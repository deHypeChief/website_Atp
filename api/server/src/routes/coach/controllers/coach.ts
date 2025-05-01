import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import Coach from "../model";
import User from "../../user/model";

const createCoach = new Elysia()
    .use(isAdmin_Authenticated)
    .get("removeCoach/:id", async ({ set, params: { id } }) => {
        try {
            const coachId = id
            const usersWithCoach = await User.find({ assignedCoach: coachId });

            if (usersWithCoach.length > 0) {
                await User.updateMany({ assignedCoach: coachId }, { assignedCoach: "" });
            }

            await Coach.findByIdAndDelete(coachId);

            set.status = 200;
            return {
                message: "Coach and associated assignments have been removed"
            };

        } catch (err) {
            set.status = 500;
            console.log(err);
            return {
                message: "Error deleting coach"
            };
        }
    })
    .post("/updateCoach/:id", async ({ set, body, params: { id } }) => {
        try {
            const { coachName, email, bioInfo, imageUrl, level } = body;

            // Check if the coach exists
            const coach = await Coach.findById(id);
            if (!coach) {
                set.status = 404;
                return {
                    message: "Coach not found"
                };
            }

            // Update the coach's details
            coach.coachName = coachName || coach.coachName;
            coach.email = email || coach.email;
            coach.bioInfo = bioInfo || coach.bioInfo;
            coach.imageUrl = imageUrl || coach.imageUrl;
            coach.level = level || coach.level;

            await coach.save();

            set.status = 200;
            return {
                message: "Coach data updated successfully",
                data: coach
            };

        } catch (err) {
            set.status = 500;
            console.log(err);
            return {
                message: "Error while updating coach data"
            };
        }
    })
    .post("/createCoach", async ({ set, body }) => {
        const {
            coachName,
            email,
            bioInfo,
            imageUrl,
            level
        } = body;

        try {
            const findCoachEmail = await Coach.findOne({ email });

            if (findCoachEmail) {
                set.status = 400;
                return {
                    message: "This email is already linked to a coach"
                };
            }

            // Create a new coach
            const coach = new Coach({
                coachName,
                email,
                bioInfo,
                imageUrl,
                level
            });
            await coach.save();

            set.status = 201;
            return {
                message: "Coach has been created",
                data: coach
            };

        } catch (err) {
            set.status = 500;
            console.log(err);
            return {
                message: "Error creating coach"
            };
        }
    })
    .get("/assignCoach", async ({ }) => {
        try {

        } catch (err) {
            set.status = 500;
            console.log(err);
            return {
                message: "Error assigning coach"
            };
        }
    })

export default createCoach;
