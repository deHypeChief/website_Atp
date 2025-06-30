import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import { CustomMatch } from "../model";

const userCMatches = new Elysia()
    .use(isUser_Authenticated)
    .get("/matchCustom/user", async ({ set, user }) => {
        try {
            const userId = user._id.toString(); // Ensure string comparison

            // Only consider completed matches
            const matches = await CustomMatch.find({
                status: "completed",
                "participants.userId": userId
            }).lean();

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
                matches
            };
        } catch (error) {
            console.error("User match stats error:", error);
            set.status = 500;
            return { error: "Failed to retrieve user custom matches" };
        }
    });

export default userCMatches;