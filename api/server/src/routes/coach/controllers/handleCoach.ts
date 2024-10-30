import Elysia from "elysia";
import Coach from "../model";

const handleCoach = new Elysia()
    .get("/getCoach/:id", async ({ set, params: { id } }) => {
        try {
            const coach = await Coach.findById({ id })

            set.status = 200
            return {
                message: "Coach found",
                coach
            }

        } catch (err) {
            set.status = 500;
            console.log(err);
            return {
                message: "Error getting coach data"
            };
        }
    })
    .get("/getCoaches/:level", async ({ set, params: { level } }) => {
        try {
            // Fetch coaches based on the level; if level is "all", skip the level filter
            const coaches = level === "all" ? await Coach.find() : await Coach.find({ level });
    
            set.status = 200;
            return {
                message: `Coaches found${level !== "all" ? ` with ${level} level` : ""}`,
                coaches
            };
        } catch (error) {
            set.status = 500;
            console.error("Error fetching coaches:", error);
            return {
                message: "Error retrieving coaches"
            };
        }
    })

export default handleCoach