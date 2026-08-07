import Elysia from "elysia";
import mongoose from "mongoose";
import { CustomMatch } from "../model";
import User from "../../user/model";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import { sendNotifications } from "../../notifications/service";
import { atpEmail, sendAtpMail } from "../../../middleware/sendMail";

// Tells each player who else is on the court, so the notification is useful on its own.
const opponentLine = (names: string[]) => {
    if (!names.length) return "";
    if (names.length === 1) return ` You are up against ${names[0]}.`;
    return ` You are up against ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}.`;
};

/** "Saturday 9 August, 4:00 pm" — the detail a player needs to turn up. */
const whenLine = (scheduledAt?: Date | null) => {
    if (!scheduledAt) return " The date is still to be confirmed.";
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime())) return " The date is still to be confirmed.";
    return ` It is set for ${when.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} at ${when.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })}.`;
};

const venueLine = (venue?: string) => (venue?.trim() ? ` Venue: ${venue.trim()}.` : "");

/** Reads the admin's datetime-local value. Blank clears the schedule; nonsense is rejected. */
const readSchedule = (value?: string): Date | undefined | "invalid" => {
    if (!value?.trim()) return undefined;
    const when = new Date(value);
    return Number.isNaN(when.getTime()) ? "invalid" : when;
};

const notifyParticipants = async (
    participantIds: string[],
    { title, message }: { title: string; message: (opponents: string) => string },
) => {
    // The match is already saved by the time this runs, so notifying must never fail the
    // request: a malformed participant id would otherwise report a 500 for a match that
    // was created successfully.
    try {
        const players = await User.find({ _id: { $in: participantIds.filter(id => mongoose.isValidObjectId(id)) } })
            .select("fullName username email")
            .lean();
        const nameById = new Map(players.map(player => [
            player._id.toString(),
            player.fullName || player.username || "an ATP player",
        ]));
        const emailById = new Map(players.map(player => [player._id.toString(), player.email]));

        // Each player is told who they are up against, so the line differs per recipient.
        const notices = participantIds.map(userId => ({
            userId,
            body: message(opponentLine(
                participantIds.filter(id => id !== userId).map(id => nameById.get(id) || "an ATP player"),
            )),
        }));

        await sendNotifications(notices.map(({ userId, body }) => ({
            userID: userId,
            title,
            message: body,
            type: "success" as const,
            category: "match" as const,
            link: "/u/matches",
        })));

        // The same notice by email, so a fixture still reaches a player who is not logged in.
        // Not awaited: SMTP is slow and the admin's save should not wait on it.
        Promise.all(notices.map(({ userId, body }) => sendAtpMail(
            emailById.get(userId) || "",
            `ATP · ${title}`,
            atpEmail({
                title,
                content: `
              <p>Hi ${nameById.get(userId)},</p>
              <p>${body}</p>
              <p>Your fixtures are on your ATP dashboard under <strong>Friendly matches</strong>.</p>
              <p>The ATP Team</p>
            `,
            }),
        ))).catch(error => console.error("Failed to email match participants", error));
    } catch (notifyError) {
        console.error("Failed to notify match participants", notifyError);
    }
};

/**
 * Friendly matches: fixtures an admin arranges outside the tournament calendar.
 *
 * A match is created as `active` once the players are paired, then moved to `completed`
 * with the final scores. Winners are only required at that last step, because a fixture
 * that has not been played yet has none.
 */
const validateMatch = (
    status: string,
    matchType: string,
    participants: Array<{ userId?: string; winner?: boolean; score?: number }>,
) => {
    if (!status || !matchType || !Array.isArray(participants)) return "Invalid match data";
    if (!["draft", "active", "completed"].includes(status)) return "Status must be draft, active or completed";
    if (!["1v1", "2v2"].includes(matchType)) return "Match type must be 1v1 or 2v2";

    const expectedCount = matchType === "1v1" ? 2 : 4;
    if (participants.length !== expectedCount) return `Match type '${matchType}' requires exactly ${expectedCount} participants`;
    if (participants.some(participant => !participant.userId)) return "Choose a player for every slot";
    if (new Set(participants.map(participant => participant.userId)).size !== participants.length) return "A player cannot appear twice in the same match";

    // Only a played match has a result to record.
    if (status !== "completed") return null;
    const winnerCount = participants.filter(participant => participant.winner === true).length;
    const requiredWinners = matchType === "1v1" ? 1 : 2;
    if (winnerCount !== requiredWinners) return `Match type '${matchType}' requires exactly ${requiredWinners} winner(s)`;
    return null;
};

const adminMatchCreate = new Elysia()
    .use(isAdmin_Authenticated)
    .post("/matchCustom/create", async ({ set, body }) => {
        try {
            const { status, matchType, participants, scheduledAt, venue } = body as {
                status: string; matchType: string; participants: Array<{ userId: string; winner?: boolean; score?: number }>;
                scheduledAt?: string; venue?: string;
            };

            const invalid = validateMatch(status, matchType, participants || []);
            if (invalid) {
                set.status = 400;
                return { error: invalid };
            }

            const when = readSchedule(scheduledAt);
            if (when === "invalid") {
                set.status = 400;
                return { error: "That date and time could not be read" };
            }

            const match = new CustomMatch({ status, matchType, participants, scheduledAt: when, venue: venue?.trim() || "" });
            await match.save();

            // Draft matches are not assignments yet — only tell players once the match is live.
            if (status !== "draft") {
                await notifyParticipants(participants.map(participant => participant.userId), {
                    title: status === "completed" ? "Your friendly match result is in" : "You have a new friendly match",
                    message: opponents => status === "completed"
                        ? `Your ${matchType} friendly match has been scored.${opponents}${venueLine(venue)}`
                        : `You have been matched for a ${matchType} friendly.${opponents}${whenLine(when)}${venueLine(venue)}`,
                });
            }

            set.status = 201;
            return { message: "Custom match created", match };
        } catch (error) {
            console.error("Error while saving custom match:", error);
            set.status = 500;
            return { error: "Error while saving custom match" };
        }
    })
    // Used to record the result after a friendly has been played, or to correct a fixture.
    .put("/matchCustom/:id", async ({ set, params: { id }, body }) => {
        try {
            const existing = await CustomMatch.findById(id);
            if (!existing) {
                set.status = 404;
                return { error: "Custom match not found" };
            }

            const payload = body as {
                status?: string; matchType?: string; participants?: Array<{ userId: string; winner?: boolean; score?: number }>;
                scheduledAt?: string; venue?: string;
            };
            const status = payload.status ?? existing.status;
            const matchType = payload.matchType ?? existing.matchType;
            const participants = payload.participants ?? existing.participants.map(participant => ({
                userId: participant.userId, winner: participant.winner, score: participant.score,
            }));

            const invalid = validateMatch(status, matchType, participants);
            if (invalid) {
                set.status = 400;
                return { error: invalid };
            }

            const when = payload.scheduledAt === undefined ? existing.scheduledAt : readSchedule(payload.scheduledAt);
            if (when === "invalid") {
                set.status = 400;
                return { error: "That date and time could not be read" };
            }
            const venue = payload.venue === undefined ? existing.venue : payload.venue.trim();

            const becameFinal = existing.status !== "completed" && status === "completed";
            // A draft is not an assignment, so publishing one is the players' first word of
            // it — the same notification they would have had if it were never a draft.
            const becamePublic = !becameFinal && existing.status === "draft" && status !== "draft";
            // A fixture that moves is worth telling the players about, otherwise they turn
            // up at the old time or place.
            const rescheduled = !becameFinal && !becamePublic && status !== "draft" && (
                String(existing.scheduledAt ?? "") !== String(when ?? "") || (existing.venue ?? "") !== (venue ?? "")
            );

            existing.set({ status, matchType, participants, scheduledAt: when, venue });
            await existing.save();

            if (becameFinal) {
                await notifyParticipants(participants.map(participant => participant.userId), {
                    title: "Your friendly match result is in",
                    message: opponents => `Your ${matchType} friendly match has been scored.${opponents}${venueLine(venue)}`,
                });
            } else if (becamePublic) {
                await notifyParticipants(participants.map(participant => participant.userId), {
                    title: "You have a new friendly match",
                    message: opponents => `You have been matched for a ${matchType} friendly.${opponents}${whenLine(when)}${venueLine(venue)}`,
                });
            } else if (rescheduled) {
                await notifyParticipants(participants.map(participant => participant.userId), {
                    title: "Your friendly match has moved",
                    message: opponents => `Your ${matchType} friendly has been rescheduled.${opponents}${whenLine(when)}${venueLine(venue)}`,
                });
            }

            return { message: "Custom match updated", match: existing };
        } catch (error) {
            console.error("Error while updating custom match:", error);
            set.status = 500;
            return { error: "Error while updating custom match" };
        }
    })
    .get("/matchCustom/all", async ({ set }) => {
        try {
            // Get all matches, most recent first
            const matchesRaw = await CustomMatch.find().lean().sort({ createdAt: -1 });

            // Step 1: Collect all userIds from all participants
            const allParticipantIds = [
                ...new Set(matchesRaw.flatMap(match =>
                    match.participants.map(p => p.userId)
                ))
            ];

            // Step 2: Fetch user documents and build map: { userId: username }
            const usersMap = await User.find({ _id: { $in: allParticipantIds.filter(id => mongoose.isValidObjectId(id)) } })
                .lean()
                .then(users =>
                    users.reduce((acc, user) => {
                        acc[user._id.toString()] = user.username;
                        return acc;
                    }, {} as Record<string, string>)
                );

            // Step 3: Transform matches
            const matches = matchesRaw.map(match => {
                const totalScore = match.participants.reduce((sum, p) => sum + (p.score || 0), 0);

                const enrichedParticipants = match.participants.map(p => ({
                    ...p,
                    username: usersMap[p.userId] || p.userId // fallback to ID if user not found
                }));

                const winners = enrichedParticipants
                    .filter(p => p.winner)
                    .map(p => p.username);

                return {
                    matchId: match._id.toString(),
                    status: match.status,
                    matchType: match.matchType,
                    scheduledAt: match.scheduledAt ?? null,
                    venue: match.venue || "",
                    createdAt: match.createdAt,
                    updatedAt: match.updatedAt,
                    totalParticipants: enrichedParticipants.length,
                    totalScore,
                    winners,
                    participants: enrichedParticipants
                };
            });

            // Step 4: Summary stats
            const total = matches.length;
            const completed = matches.filter(m => m.status === "completed").length;
            const active = matches.filter(m => m.status === "active").length;

            set.status = 200;
            return {
                total,
                completed,
                active,
                matches
            };
        } catch (error) {
            console.error("Error fetching matches:", error);
            set.status = 500;
            return { error: "Failed to retrieve custom matches" };
        }
    })

export default adminMatchCreate;
