import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import Tournament from "../model";

const handleTour = new Elysia({
    prefix: "/admin"
})
    .get("/getTournaments", async ({ set }) => {
        const tours = await Tournament.find();

        set.status = 200;
        return {
            message: "Tournament found",
            tours
        };
    })
    .use(isAdmin_Authenticated)
    .post("/delTournament/:id", async ({ set, params: { id } }) => {
            const tour = await Tournament.findByIdAndDelete(id);

            if (!tour) {
                set.status = 404;
                return { message: 'Tournament not found' };
            }

            set.status = 200;
            return {
                message: 'The tournament has been deleted successfully'
            };

    })

export default handleTour