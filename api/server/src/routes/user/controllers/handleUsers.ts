import Elysia from "elysia";
import User from "../model";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";

const handleUser = new Elysia({
    prefix: "/admin"
})
    .use(isAdmin_Authenticated)
    .get("/getUsers", async ({ set }) => {
        const users = await User.find().select("-password");

        set.status = 200;
        return {
            message: "Users found",
            users
        };
    })
    .post("/delUser/:id", async ({ set, params: { id } }) => {
            const user = await User.findByIdAndDelete(id).select("-password");

            if (!user) {
                set.status = 404;
                return { message: 'User not found' };
            }

            // Delete all associated records across collections
            // await CoinDeposit.deleteMany({ user: id });

            set.status = 200;
            return {
                message: 'User and all associated records deleted successfully',
                user
            };

    })

export default handleUser
