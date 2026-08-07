import Elysia from "elysia";
import subscriptions from "./controllers/userActions";
import adminAction from "./controllers/adminAction";
import publicPackages from "./controllers/publicPackages";

const subscriptionsPlugin = new Elysia({
    prefix: "/billing",
})
    .use(publicPackages)
    .use(subscriptions)
    .use(adminAction)

export default subscriptionsPlugin;