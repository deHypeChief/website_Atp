import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import Coach from "../model";

const createCoach = new Elysia()
    .use(isAdmin_Authenticated)
    .post("/createCoach", async ({ set, body }) => {
        const {
            coachName,
            email,
            bioInfo,
            imageUrl,
            level
        } = body;

        try {
            const findCoachEmail = await Coach.findOne({ email });

            if (findCoachEmail) {
                set.status = 400;
                return {
                    message: "This email is already linked to a coach"
                };
            }

            // Create a new coach
            const coach = new Coach({
                coachName,
                email,
                bioInfo,
                imageUrl,
                level
            });
            await coach.save();

            set.status = 201;
            return {
                message: "Coach has been created",
                data: coach
            };

        } catch (err) {
            set.status = 500;
            console.log(err);
            return {
                message: "Error creating coach"
            };
        }
    })
    .get("/assignCoach", async ({ }) => {
        try {
            
        } catch (err) {
            set.status = 500;
            console.log(err);
            return {
                message: "Error assigning coach"
            };
        }
    })

export default createCoach;
