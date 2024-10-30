import Elysia from "elysia"
import createVideo from "./controllers/createVideo"
import handleVideo from "./controllers/handleVideo"

const video = new Elysia({
    prefix: "/video"
})
    .use(createVideo)
    .use(handleVideo)

export default video