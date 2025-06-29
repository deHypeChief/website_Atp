import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import Coach from "../model";

const commentCoach = new Elysia()
    .use(isUser_Authenticated)
    .post("/user/comment", async ({ set, body, user }) => {
        const { comment, rating, coachId } = body;

        try {
            // Use coachId from body if provided, otherwise use user.assignedCoach
            const targetCoachId = coachId || user.assignedCoach;
            
            if (!targetCoachId) {
                set.status = 400;
                return {
                    message: "No coach ID provided and user has no assigned coach"
                };
            }

            // Find the coach by id
            const coach = await Coach.findById(targetCoachId);

            if (!coach) {
                set.status = 404;
                return {
                    message: "Coach not found"
                };
            }

            
            // Add new comment to the coach's comment array
            coach.comment.push({
                userID: user._id,
                comment,
                rating
            });

            // Calculate the new average rating
            const totalRatings = coach.comment.length;
            const sumRatings = coach.comment.reduce((acc, curr) => acc + curr.rating, 0);
            coach.avgRate = sumRatings / totalRatings;

            // Save the updated coach document
            await coach.save();

            set.status = 201;
            return {
                message: "Comment added successfully",
                data: coach
            };

        } catch (err) {
            set.status = 500;
            console.log(err);
            return {
                message: "Error adding comment"
            };
        }
    });

export default commentCoach;
