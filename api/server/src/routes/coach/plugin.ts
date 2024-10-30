import Elysia from "elysia";
import createCoach from "./controllers/coach";
import handleCoach from "./controllers/handleCoach";
import commentCoach from "./controllers/commentCoach";

const coach = new Elysia({
    prefix: "/coach"
})
    .use(createCoach)
    .use(handleCoach)
    .use(commentCoach)

export default coach