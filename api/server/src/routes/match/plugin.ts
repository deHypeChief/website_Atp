import Elysia from "elysia";
import createMatch from "./controllers/createMatch";
import handleTour from "./controllers/handleMatch";

const match = new Elysia({
    prefix: "/match"
})
    .use(createMatch)
    .use(handleTour)

export default match