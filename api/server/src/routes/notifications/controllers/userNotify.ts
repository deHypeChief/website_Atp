import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import Notify from "../model";

const NOTIFICATION_PAGE_SIZE = 100;

const userNotify = new Elysia()
    .use(isUser_Authenticated)
    .get('/notifications', async ({ set, user }) => {
        try {
            // Newest first, so the client renders the list as-is.
            const notifications = await Notify.find({ userID: user._id })
                .sort({ createdAt: -1 })
                .limit(NOTIFICATION_PAGE_SIZE)
                .lean();
            // Counted separately so the bell badge stays correct beyond the page size.
            const unreadCount = await Notify.countDocuments({ userID: user._id, status: 'unread' });

            set.status = 200;
            return {
                notifications,
                unreadCount,
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
    .post('/notifications/read-all', async ({ set, user }) => {
        try {
            const result = await Notify.updateMany(
                { userID: user._id, status: 'unread' },
                { status: 'read' }
            );

            set.status = 200;
            return {
                message: "All notifications marked as read",
                updated: result.modifiedCount,
            };
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            set.status = 500;
            return {
                message: "Error while marking notifications as read",
            };
        }
    })
    .post('/notifications/:id/read', async ({ set, params: { id }, user }) => {
        try {
            // Validate ID before using it
            if (!id) {
                set.status = 400; // Bad Request
                return {
                    message: "Notification ID is required",
                };
            }

            // Scoped to the caller so one player cannot read or modify another player's notifications.
            const updatedNotification = await Notify.findOneAndUpdate(
                { _id: id, userID: user._id },
                { status: "read" },
                { new: true }
            );

            if (!updatedNotification) {
                set.status = 404; // Not Found
                return {
                    message: "Invalid Notification",
                };
            }

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
