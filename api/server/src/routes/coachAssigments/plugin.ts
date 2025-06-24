import Elysia from "elysia";
import assignCaoch from "./controllers/assignCoach";

const CoachAssignmentPlugin = new Elysia()
    .use(assignCaoch)

export default CoachAssignmentPlugin;