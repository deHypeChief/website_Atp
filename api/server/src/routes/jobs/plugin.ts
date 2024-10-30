import Elysia from "elysia";
import jobs from "./controllers";

const cron = new Elysia({
    prefix: "/jobs" 
})
    .use(jobs)

export default cron