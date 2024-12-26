import Elysia from "elysia"
import Leader from "../model"

const getLeaders = new Elysia()
    .get("/getLeaders", async ({ set }) => {
        try {
            const leaders = await Leader.find()
                .populate("tour")
                .populate({
                    path: "gold",
                    select: "-password", // Exclude the password field
                })
                .populate({
                    path: "silver",
                    select: "-password", // Exclude the password field
                })
                .populate({
                    path: "bronze",
                    select: "-password", // Exclude the password field
                });


            return {
                message: "Leaders found",
                leaders
            }
        } catch (err) {
            set.status = 500
            return {
                message: "Error while getting leaderboards content"
            }
        }
    })

export default getLeaders