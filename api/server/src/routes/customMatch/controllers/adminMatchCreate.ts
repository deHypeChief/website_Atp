import Elysia from "elysia";
import mongoose from "mongoose";
import { CustomMatch } from "../model";
import User from "../../user/model";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import { sendNotifications } from "../../notifications/service";

// Tells each player who else is on the court, so the notification is useful on its own.
const opponentLine = (names: string[]) => {
    if (!names.length) return "";
    if (names.length === 1) return ` You are up against ${names[0]}.`;
    return ` You are up against ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}.`;
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
            .select("fullName username")
            .lean();
        const nameById = new Map(players.map(player => [
            player._id.toString(),
            player.fullName || player.username || "an ATP player",
        ]));

        await sendNotifications(participantIds.map(userId => ({
            userID: userId,
            title,
            message: message(opponentLine(
                participantIds.filter(id => id !== userId).map(id => nameById.get(id) || "an ATP player"),
            )),
            type: "success" as const,
            category: "match" as const,
            link: "/u/matches",
        })));
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
            const { status, matchType, participants } = body as {
                status: string; matchType: string; participants: Array<{ userId: string; winner?: boolean; score?: number }>;
            };

            const invalid = validateMatch(status, matchType, participants || []);
            if (invalid) {
                set.status = 400;
                return { error: invalid };
            }

            const match = new CustomMatch({ status, matchType, participants });
            await match.save();

            // Draft matches are not assignments yet — only tell players once the match is live.
            if (status !== "draft") {
                await notifyParticipants(participants.map(participant => participant.userId), {
                    title: status === "completed" ? "Your friendly match result is in" : "You have a new friendly match",
                    message: opponents => status === "completed"
                        ? `Your ${matchType} friendly match has been scored.${opponents}`
                        : `You have been matched for a ${matchType} friendly.${opponents}`,
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

            const becameFinal = existing.status !== "completed" && status === "completed";
            existing.set({ status, matchType, participants });
            await existing.save();

            if (becameFinal) {
                await notifyParticipants(participants.map(participant => participant.userId), {
                    title: "Your friendly match result is in",
                    message: opponents => `Your ${matchType} friendly match has been scored.${opponents}`,
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
