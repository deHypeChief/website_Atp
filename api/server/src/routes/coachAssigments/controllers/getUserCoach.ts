import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import CoachAssignment from "../model";

const getUserCoach = new Elysia()
    .use(isUser_Authenticated)
    .get("/assigncoach/getUserCoach", async ({ set, user }) => {
        try {
            const coachInfo = await CoachAssignment.findOne({
                playerId: user._id
            }).populate({
                path: "coachId",
                populate: {
                    path: "comment.userID",
                    select: "fullName email"
                }
            })

            if (!coachInfo) {
                set.status = 400;
                return {
                    message: "Invald user or record",
                };
            }

            set.status = 200;
            return {
                message: "User Coach fetched successfully",
                coachInfo
            };
        } catch (err) {
            set.status = 500;
            console.log(err)
            return { message: "Error while fetching user coach", error: err };
        }
    })

export default getUserCoach