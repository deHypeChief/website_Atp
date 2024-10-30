import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import Video from "../model";
import cloudinaryClient from "../../../config/cloudinary.config";

const createVideo = new Elysia()
    .use(isAdmin_Authenticated)
    .post("/createVideo", async ({ set , body }) => {
        const { title, info, videoLink } = body;

        const titleCheck = await Video.findOne({title})
        if(titleCheck){
            set.status = 400
            return { 
                message: 'The title is already in use' 
            };
        }

        try {
            // Create a new video document
            const newVideo = new Video({
                title,
                info,
                videoLink
            });

            // Save the video metadata in MongoDB
            const video = await newVideo.save();
            set.status = 200
            return {
                message: 'Video uploaded and saved successfully',
                video
            };
        } catch (error) {
            console.error(error);
            set.status = 500
            return { 
                status: 500, 
                message: 'An error occurred while uploading the video.' 
            };
        }
    })

export default createVideo