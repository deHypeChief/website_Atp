import Elysia from "elysia";
import assignCaoch from "./controllers/assignCoach";
import getUserCoach from "./controllers/getUserCoach";

const CoachAssignmentPlugin = new Elysia()
    .use(assignCaoch)
    .use(getUserCoach)

export default CoachAssignmentPlugin;