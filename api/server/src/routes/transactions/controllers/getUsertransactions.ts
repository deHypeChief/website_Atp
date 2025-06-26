import Elysia from "elysia";
import Transaction from "../model";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";

const getTrans = new Elysia()
    .use(isUser_Authenticated)
    .get("/transaction/all", async ({ set, user }) => {
        try {
            const trans = await Transaction.find({ user: user._id })


            set.status = 200;
            return {
                trans
            };
        } catch (err) {
            set.status = 500;
            console.log(err)
            return { message: "Error while getting transactions", error: err };
        }
    })


export default getTrans