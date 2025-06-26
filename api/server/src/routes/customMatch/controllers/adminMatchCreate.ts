import Elysia from "elysia";
import { CustomMatch } from "../model";
import User from "../../user/model";

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