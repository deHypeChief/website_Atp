import Elysia from "elysia";
import adminHandleUsers from "./components/adminHandle";
import getLeaders from "./components/handleLeaderboard";
import rankings from "./components/rankings";

const leader = new Elysia({
    prefix: "/leader"
})
    .use(adminHandleUsers)
    .use(getLeaders)
    .use(rankings)

export default leader