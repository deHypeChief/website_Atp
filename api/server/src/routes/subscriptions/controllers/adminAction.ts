import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import Billing from "../model";

const adminAction = new Elysia()
    .use(isAdmin_Authenticated)
    .get("/pay/all", async ({ set }) => {
        try {
            const payments = await Billing.find({});
            set.status = 200;
            return { payments };
        } catch (error) {
            set.status = 500;
            return { message: "Error fetching payments", error };
        }
    })

export default adminAction