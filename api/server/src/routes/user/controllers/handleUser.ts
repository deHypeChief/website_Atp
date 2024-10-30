import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import User from "../model";

const getUser = new Elysia()
    .use(isUser_Authenticated)
    .get("/me", async ({ set, user }) => {
        try {
            const userData = await User.findById(user._id).populate("coach").populate("plan")

            set.status = 500
            return {
                message: "user found",
                userData
            }
        } catch (err) {
            set.status = 500
            return {
                message: "Error getting user",
                err
            }
        }
    })