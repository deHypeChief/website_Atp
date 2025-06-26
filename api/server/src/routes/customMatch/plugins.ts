import Elysia from "elysia";
import userCMatches from "./controllers/userCMatches";
import adminMatchCreate from "./controllers/adminMatchCreate";

const cMatchPlugins = new Elysia()
    .use(userCMatches)
    .use(adminMatchCreate)

export default cMatchPlugins;