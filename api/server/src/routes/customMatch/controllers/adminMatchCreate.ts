import Elysia from "elysia";
import mongoose from "mongoose";
import { CustomMatch } from "../model";
import User from "../../user/model";
import { sendNotifications } from "../../notifications/service";

// Tells each player who else is on the court, so the notification is useful on its own.
const opponentLine = (names: string[]) => {
    if (!names.length) return "";
    if (names.length === 1) return ` You are up against ${names[0]}.`;
    return ` You are up against ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}.`;
};

const adminMatchCreate = new Elysia()
    .post("/matchCustom/create", async ({ set, body }) => {
        try {
            const { status, matchType, participants } = body;

            // Basic validation
            if (!status || !matchType || !participants || !Array.isArray(participants)) {
                set.status = 400;
                return { error: "Invalid match data" };
            }

            // Validate expected number of participants
            const expectedCount = matchType === "1v1" ? 2 : 4;
            if (participants.length !== expectedCount) {
                set.status = 400;
                return {
                    error: `Match type '${matchType}' requires exactly ${expectedCount} participants`
                };
            }

            // ✅ Validate winner count
            const winnerCount = participants.filter(p => p.winner === true).length;
            const requiredWinners = matchType === "1v1" ? 1 : 2;

            if (winnerCount !== requiredWinners) {
                set.status = 400;
                return {
                    error: `Match type '${matchType}' requires exactly ${requiredWinners} winner(s)`
                };
            }

            // Create and save the match
            const match = new CustomMatch({
                status,
                matchType,
                participants
            });

            await match.save();

            // Draft matches are not assignments yet — only tell players once the match is live.
            // The match is already saved at this point, so notifying must never fail the request:
            // a malformed participant id would otherwise make User.find throw and report a 500
            // for a match that was created successfully.
            if (status !== "draft") {
                try {
                    const participantIds = participants.map(p => p.userId);
                    const players = await User.find({ _id: { $in: participantIds.filter(id => mongoose.isValidObjectId(id)) } })
                        .select("fullName username")
                        .lean();
                    const nameById = new Map(players.map(player => [
                        player._id.toString(),
                        player.fullName || player.username || "an ATP player",
                    ]));

                    await sendNotifications(participantIds.map(userId => ({
                        userID: userId,
                        title: "You have a new match",
                        message: `You have been assigned to a ${matchType} match.${opponentLine(
                            participantIds.filter(id => id !== userId).map(id => nameById.get(id) || "an ATP player"),
                        )}`,
                        type: "success" as const,
                        category: "match" as const,
                        link: "/u/matches",
                    })));
                } catch (notifyError) {
                    console.error("Failed to notify match participants", notifyError);
                }
            }

            set.status = 201;
            return { message: "Custom match created", match };
        } catch (error) {
            set.status = 500;
            return { error: "Error while saving custom match" };
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
            const usersMap = await User.find({ _id: { $in: allParticipantIds } })
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