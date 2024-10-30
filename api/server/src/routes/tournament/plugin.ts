import Elysia from "elysia"
import handleTour from "./controllers/handleTournament"
import createTour from "./controllers/createTournament"
import registerTour from "./controllers/registerTour"

const tour = new Elysia({
    prefix: "/tour"
})
    .use(createTour)
    .use(handleTour)
    .use(registerTour)

export default tour