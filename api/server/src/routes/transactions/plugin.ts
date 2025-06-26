import Elysia from "elysia";
import getTrans from "./controllers/getUsertransactions";

const transPlugin = new Elysia()
    .use(getTrans)


export default transPlugin