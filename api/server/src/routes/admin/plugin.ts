import Elysia from "elysia";
import signAdmin from "./controllers/signAdmin";
import createAdmin from "./controllers/createAdmin";

const admin = new Elysia({
    prefix: "/admin"
})
    .use(signAdmin)
    .use(createAdmin)


export default admin