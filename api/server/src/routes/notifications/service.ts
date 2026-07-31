import mongoose from "mongoose";
import Notify from "./model";

type NotificationInput = {
    userID: string | mongoose.Types.ObjectId;
    title: string;
    message: string;
    type?: "info" | "alert" | "success";
    category?: "general" | "match" | "community" | "tournament" | "billing";
    link?: string;
};

/**
 * A notification is a side effect of the action that triggered it, never a reason
 * for that action to fail. An unusable recipient id or a write error is logged and
 * swallowed so creating a match or posting a comment still succeeds.
 *
 * Returns how many notifications were written.
 */
export const sendNotifications = async (inputs: NotificationInput[]) => {
    const documents = inputs
        .filter(input => input.userID && mongoose.isValidObjectId(input.userID))
        .map(input => ({
            userID: new mongoose.Types.ObjectId(input.userID.toString()),
            title: input.title,
            message: input.message,
            type: input.type || "info",
            category: input.category || "general",
            link: input.link || "",
        }));

    if (!documents.length) return 0;

    try {
        // ordered:false so one bad document does not drop the rest of the batch.
        await Notify.insertMany(documents, { ordered: false });
        return documents.length;
    } catch (error) {
        console.error("Failed to write notifications", error);
        return 0;
    }
};

export const sendNotification = (input: NotificationInput) => sendNotifications([input]);
