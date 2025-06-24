import Elysia from "elysia";
import subscriptions from "./controllers/userActions";

const subscriptionsPlugin = new Elysia({
    prefix: "/billing",
})
    .use(subscriptions)

export default subscriptionsPlugin;