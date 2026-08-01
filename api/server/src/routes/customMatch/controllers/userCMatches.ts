import Elysia from "elysia";
import mongoose from "mongoose";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import { CustomMatch } from "../model";
import User from "../../user/model";

const userCMatches = new Elysia()
    .use(isUser_Authenticated)
    .get("/matchCustom/user", async ({ set, user }) => {
        try {
            const userId = user._id.toString(); // Ensure string comparison

            // Everything the player has been put in, so the dashboard can show upcoming
            // fixtures alongside results. The headline stats below still count completed
            // matches only, which is what a win rate means.
            const fixtures = await CustomMatch.find({ "participants.userId": userId })
                .sort({ updatedAt: -1 })
                .lean();

            // Draft matches are not assignments yet; the player should not see them.
            const visible = fixtures.filter(fixture => fixture.status !== "draft");
            const matches = visible.filter(fixture => fixture.status === "completed");

            const totalMatches = matches.length;
            const totalWins = matches.filter(m =>
                m.participants.some(p => p.userId === userId && p.winner)
            ).length;

            const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

            // Rank
            let rank;
            if (winRate >= 80) rank = "Tier 1";
            else if (winRate >= 60) rank = "Tier 2";
            else if (winRate >= 40) rank = "Tier 3";
            else if (winRate >= 30) rank = "Tier 4";
            else if (winRate >= 20) rank = "Tier 5";
            else if (winRate >= 10) rank = "Tier 6";
            else rank = "Unranked";

            // Calculate recent win rate (last 10)
            const recentMatches = matches
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 10);

            const recentWins = recentMatches.filter(m =>
                m.participants.some(p => p.userId === userId && p.winner)
            ).length;

            const recentWinRate =
                recentMatches.length > 0 ? (recentWins / recentMatches.length) * 100 : 0;

            const improvementValue = parseFloat((recentWinRate - winRate).toFixed(1));
            const improvement =
                improvementValue === 0
                    ? "Same as last 10 games"
                    : improvementValue > 0
                        ? `+${improvementValue}% better than average`
                        : `${Math.abs(improvementValue)}% worse than average`;

            // Names for everyone on court, so the player page can read as a fixture list
            // rather than a list of ids.
            const participantIds = [...new Set(visible.flatMap(fixture => fixture.participants.map(p => p.userId)))];
            const players = await User.find({ _id: { $in: participantIds.filter(id => mongoose.isValidObjectId(id)) } })
                .select("fullName username picture")
                .lean();
            const playerById = new Map(players.map(player => [player._id.toString(), player]));

            const assignments = visible.map(fixture => {
                const participants = fixture.participants.map(participant => {
                    const player = playerById.get(String(participant.userId));
                    return {
                        userId: participant.userId,
                        score: participant.score ?? null,
                        winner: Boolean(participant.winner),
                        isYou: String(participant.userId) === userId,
                        name: player?.fullName || player?.username || "ATP player",
                        picture: player?.picture || "",
                    };
                });
                const you = participants.find(participant => participant.isYou);
                return {
                    matchId: fixture._id.toString(),
                    status: fixture.status,
                    matchType: fixture.matchType,
                    createdAt: fixture.createdAt,
                    updatedAt: fixture.updatedAt,
                    participants,
                    opponents: participants.filter(participant => !participant.isYou),
                    yourScore: you?.score ?? null,
                    youWon: Boolean(you?.winner),
                    // "Scheduled" reads better than "active" for a fixture that has not been played.
                    result: fixture.status === "completed" ? (you?.winner ? "Won" : "Lost") : "Scheduled",
                };
            });

            set.status = 200;
            return {
                user: userId,
                totalMatches,
                totalWins,
                winRate: `${winRate.toFixed(1)}%`,
                rank,
                improvement,
                recent: {
                    last10Matches: recentMatches.length,
                    winRate: `${recentWinRate.toFixed(1)}%`,
                    wins: recentWins
                },
                upcoming: assignments.filter(assignment => assignment.status !== "completed").length,
                assignments,
                matches
            };
        } catch (error) {
            console.error("User match stats error:", error);
            set.status = 500;
            return { error: "Failed to retrieve user custom matches" };
        }
    });

export default userCMatches;
