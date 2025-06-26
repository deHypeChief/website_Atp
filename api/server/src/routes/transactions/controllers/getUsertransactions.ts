import Elysia from "elysia";
import Transaction from "../model";

const getTrans = new Elysia()
    .get("/transaction/all", async ({ set }) => {
        try {
            const trans = await Transaction.find({})

            
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