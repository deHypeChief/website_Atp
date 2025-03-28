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
    })
    .post("/uploadProfile", async ({set, user, body})=>{
        const {profileImage} = body
        const {_id} = user
        try{
            const userData = await User.findByIdAndUpdate(
                {_id},
                {
                    picture: profileImage
                },
                {new: true}
            )
            set.status = 200; // Status 200 on success
            return {
                message: "User updated",
                userData
            };
        }catch(err){
            set.status = 500;
            return {
                message: "Error updating user profile",
                err
            };
        }
    })

export default getUser;
