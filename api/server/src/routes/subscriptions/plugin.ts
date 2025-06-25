import Elysia from "elysia";
import subscriptions from "./controllers/userActions";
import adminAction from "./controllers/adminAction";

const subscriptionsPlugin = new Elysia({
    prefix: "/billing",
})
    .use(subscriptions)
    .use(adminAction)

export default subscriptionsPlugin;