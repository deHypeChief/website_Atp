import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import Match from "../model";

// Define an interface for leaderboard entries
interface LeaderboardEntry {
    tournamentId: string;
    gold: typeof Match.schema.methods | null;  
    silver: typeof Match.schema.methods | null; 
    bronze: typeof Match.schema.methods | null; 
}

// Define the leaderboard type
interface Leaderboard {
    [tournamentId: string]: LeaderboardEntry;
}

const handleTour = new Elysia({
    prefix: "/admin"
})
    .use(isAdmin_Authenticated)
    .get("/getMatches", async ({ set }) => {
        const matches = await Match.find()
            .populate("user")
            .populate("tournament");

        set.status = 200;
        return {
            message: "Matches found",
            matches
        };
    })
    .post("/winStatus/:matchId", async ({ set, body, params: { matchId } }) => {
        const { won, medal } = body;
        try {
            const matchFound = await Match.findById(matchId);

            if (!matchFound) {
                set.status = 400;
                return {
                    message: "Match not found"
                };
            }

            const match = await Match.findByIdAndUpdate(
                matchFound._id,
                {
                    won,
                    medal,
                },
                { new: true }
            );

            set.status = 200;
            return {
                message: "Match status has been updated",
                match
            };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return {
                message: "Error updating match status"
            };
        }
    })
    .get("/tourCheck/:token", async ({ set, params: { token } }) => {
        try {
            const matchTokenFound = await Match.findOne({ token });

            if (!matchTokenFound) {
                set.status = 400;
                return {
                    message: "Token provided does not exist"
                };
            }

            const match = await Match.findByIdAndUpdate(
                matchTokenFound._id,
                {
                    tourCheck: true,
                },
                { new: true }
            );

            set.status = 200;
            return {
                message: "Match ticket is valid",
                match
            };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return {
                message: "Error updating match status"
            };
        }
    })
    .get("/leaderboard", async ({ set }) => {
        try {
            const matches = await Match.find({ won: true }).populate("tournament"); // Fetch only matches that have been won
            const leaderboard: Leaderboard = {}; // Declare the leaderboard object with the appropriate type

            // Group matches by tournament ID and medal type
            for (const match of matches) {
                const tournamentId = match.tournament._id.toString(); // Ensure the tournament ID is a string

                if (!leaderboard[tournamentId]) {
                    leaderboard[tournamentId] = {
                        tournamentId: tournamentId,
                        gold: null,
                        silver: null,
                        bronze: null,
                    };
                }

                // Assign the match to the corresponding medal type
                switch (match.medal) {
                    case "gold":
                        leaderboard[tournamentId].gold = match;
                        break;
                    case "silver":
                        leaderboard[tournamentId].silver = match;
                        break;
                    case "bronze":
                        leaderboard[tournamentId].bronze = match;
                        break;
                }
            }

            set.status = 200;
            return {
                message: "Leaderboard retrieved successfully",
                leaderboard: Object.values(leaderboard), // Convert the leaderboard object to an array
            };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return {
                message: "Error retrieving leaderboard"
            };
        }
    });

export default handleTour;
