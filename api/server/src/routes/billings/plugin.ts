import Elysia from "elysia";
import userAction from "./controllers/userActions";
import adminAction from "./controllers/adminAction";

const billing = new Elysia({
    prefix: "/billing",
})
    .use(userAction)
    .use(adminAction)

export default billing