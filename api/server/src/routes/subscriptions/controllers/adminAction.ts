import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import { Subscription } from "../model";

const adminAction = new Elysia()
    .use(isAdmin_Authenticated)
    .get("/pay/all", async ({ set }) => {
        try {
            const payments = await Subscription.find({}).populate("user")
            set.status = 200;
            return { payments };
        } catch (error) {
            set.status = 500;
            return { message: "Error fetching payments", error };
        }
    })
    .get("/pay/all/users/ontraning", async ({ set }) => {
        try {
            const payments = await Subscription.find({
                "training.status": "Paid"
            }).populate("user").select("user")
            set.status = 200;
            return { payments };
        } catch (error) {
            set.status = 500;
            return { message: "Error fetching payments", error };
        }
    })

export default adminAction