import Elysia from "elysia";
import adminHandlePlan from "./controllers/adminHandlePlans";
import userHandle from "./controllers/userHandlePlan";
import plans from "./controllers/handlePlan";

const plan = new Elysia({
    prefix: "/plan"
})
    .use(adminHandlePlan)
    .use(userHandle)
    .use(plans)

export default plan