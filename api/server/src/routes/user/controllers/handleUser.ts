import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import User from "../model";

const getUser = new Elysia()
    .use(isUser_Authenticated)
    .get("/me", async ({ set, user }) => {
        try {
            const userData = await User.findById(user._id)
                .select("-password") // Exclude the password field
                .populate({
                    path: "assignedCoach",
                    populate: {
                        path: "comment.userID", // Nested populate within assignedCoach for comment userID
                        model: "User", // Specify the model if needed for clarity
                        select: "-password"
                    }
                })
                .populate("plan.planId"); // Ensure nested population for plan ID

            set.status = 200; // Status 200 on success
            return {
                message: "User found",
                userData
            };
        } catch (err) {
            set.status = 500;
            return {
                message: "Error getting user",
                err
            };
        }
    });

export default getUser;
