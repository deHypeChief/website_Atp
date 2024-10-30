import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import Video from "../model";

const handleVideo = new Elysia({
    prefix: "/admin"
})
    .get("/getVideos", async ({ set }) => {
        const videos = await Video.find();

        set.status = 200;
        return {
            message: "Videos found",
            videos
        };
    })
    .use(isAdmin_Authenticated)
    .post("/delVideo/:id", async ({ set, params: { id } }) => {
            const video = await Video.findByIdAndDelete(id);

            if (!video) {
                set.status = 404;
                return { message: 'Video not found' };
            }

            set.status = 200;
            return {
                message: 'The video has been deleted successfully'
            };

    })

export default handleVideo