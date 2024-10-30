import Elysia from "elysia";
import Tournament from "../model";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";

const createTour = new Elysia()
    .use(isAdmin_Authenticated)
    .post("/createTour", async ({ set, body }) => {
        const {
            name,
            category,
            location,
            date,
            time,
            tournamentImgURL,
            price
        } = body;
        const nameCheck = await Tournament.findOne({name})
        if(nameCheck){
            set.status = 400
            return { 
                message: 'The tour name is already in use' 
            };
        }

        try {
            // Create a new video document
            const newTour = new Tournament({
                name,
                category,
                location,
                date,
                time,
                tournamentImgURL,
                price
            });

            // Save the video metadata in MongoDB
            const tour = await newTour.save();
            set.status = 200
            return {
                message: 'Tournament uploaded and saved successfully',
                tour
            };
        } catch (error) {
            console.error(error);
            set.status = 500
            return {
                status: 500,
                message: 'An error occurred while uploading the tournament.'
            };
        }
    })

export default createTour


// levels
// kids amatuer
// Kids Mid-level
// kids Professional 
// adult Amateur
// adult Mid-level
// adult Professional 