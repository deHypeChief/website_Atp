import Elysia from "elysia";
import userCMatches from "./controllers/userCMatches";
import adminMatchCreate from "./controllers/adminMatchCreate";
import publicFixtures from "./controllers/publicFixtures";

const cMatchPlugins = new Elysia()
    // Public first: the authenticated plugins below guard every route declared after them.
    .use(publicFixtures)
    .use(userCMatches)
    .use(adminMatchCreate)

export default cMatchPlugins;
