import Elysia from "elysia";
import userNotify from "./controllers/userNotify";

const notify = new Elysia()
    .use(userNotify)

    export default notify