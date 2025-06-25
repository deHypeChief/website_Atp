import Elysia from "elysia";
import CoachAssignment from "../model";

const assignCaoch = new Elysia()
    .get("/assigncoach/listAssignments", async ({ set }) => {
        try {
            // Fetching all assignments from the database
            const assignments = await CoachAssignment.find({});

            // Returning the assignments to the client
            set.status = 200;
            return {
                message: "Assignments fetched successfully",
                assignments
            };
        } catch (err) {
            set.status = 500;
            console.log(err)
            return { message: "Error while fetching assignments", error: err };
        }
    })
    .get("/assigncoach/:playerId/:coachId", async ({ set, params: { coachId, playerId } }) => {
        try {
            // look for existing assignment for registered player
            const existingAssignment = await CoachAssignment.findOne({ playerId, status: "Pending" });

            if (!existingAssignment) {
                set.status = 400;
                return { message: "No pending assignment found for this player" };
            }

            // Update the existing assignment with the new coachId
            existingAssignment.coachId = coachId;
            existingAssignment.status = "Assigned";
            await existingAssignment.save();

            // Returning the updated assignment to the client
            set.status = 200;
            return {
                message: "Coach assigned to player successfully",
                assignment: existingAssignment
            };
        } catch (err) {
            set.status = 500;
            console.log(err)
            return { message: "Error while linking coach to player", error: err };
        }
    })
    .get("/assigncoach/update/:playerId/:coachId", async ({ set, params: { coachId, playerId } }) => {
        try {
            // look for existing assignment for registered player
            const existingAssignment = await CoachAssignment.findOne({ playerId, status: "Assigned" });

            if (!existingAssignment) {
                set.status = 400;
                return { message: "No assigned coach found for this player" };
            }

            // Update the existing assignment with the new coachId
            existingAssignment.coachId = coachId;
            await existingAssignment.save();

            // Returning the updated assignment to the client
            set.status = 200;
            return {
                message: "Coach updated successfully",
                assignment: existingAssignment
            };
        } catch (err) {
            set.status = 500;
            console.log(err)
            return { message: "Error while updating coach", error: err };
        }
    })


    export default assignCaoch