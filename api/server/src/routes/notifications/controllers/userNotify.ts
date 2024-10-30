import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import Notify from "../model";

const userNotify = new Elysia()
    .use(isUser_Authenticated)
    .get('/notifications', async ({ set, user }) => {
        try {
            const notifications = await Notify.find({ userID: user._id });

            set.status = 200;
            return {
                notifications,
            };
        } catch (err) {
            // Log the error (consider using a logging library)
            console.error('Error fetching notifications:', err);
            set.status = 500;
            return {
                message: "Error while fetching notifications",
            };
        }
    })
    .post('/notifications/:id/read', async ({ set, params: { id } }) => {
        try {
            // Validate ID before using it
            if (!id) {
                set.status = 400; // Bad Request
                return {
                    message: "Notification ID is required",
                };
            }

            const notification = await Notify.findById(id);

            if (!notification) {
                set.status = 404; // Not Found
                return {
                    message: "Invalid Notification",
                };
            }

            const updatedNotification = await Notify.findByIdAndUpdate(
                id,
                { status: "read" },
                { new: true }
            );

            set.status = 200;
            return {
                updatedNotification,
            };
        } catch (err) {
            // Log the error (consider using a logging library)
            console.error('Error marking notification as read:', err);
            set.status = 500;
            return {
                message: "Error while marking notification as read",
            };
        }
    });

export default userNotify;
