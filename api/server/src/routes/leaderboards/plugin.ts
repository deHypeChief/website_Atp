import Elysia from "elysia";
import adminHandleUsers from "./components/adminHandle";
import getLeaders from "./components/handleLeaderboard";

const leader = new Elysia({
    prefix: "/leader"
})
    .use(adminHandleUsers)
    .use(getLeaders)

export default leader