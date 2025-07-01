import Elysia from "elysia";
import createUser from "./controllers/createUser";
import socialAuth from "./controllers/socialAuth";
import signUser from "./controllers/signUser";
import getUser from "./controllers/handleUser";
import handleUser from "./controllers/handleUsers";

const user = new Elysia()
    .use(createUser)
    .use(signUser)
    .use(socialAuth)
    .use(handleUser)
    .use(getUser)

    export default user