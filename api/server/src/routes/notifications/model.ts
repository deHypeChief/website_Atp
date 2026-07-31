import mongoose, { Document, ObjectId } from "mongoose";


interface INotify extends Document {
    userID: ObjectId;
    title: string;
    message: string;
    status: 'unread' | 'read';
    type: 'info' | 'alert' | 'success';
    category: 'general' | 'match' | 'community' | 'tournament' | 'billing';
    link: string;
    createdAt: Date
}

const notificationSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: {type: String, required: true},
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
    type: { type: String, enum: ['info', 'alert', 'success'], default: 'info' },
    // Drives the icon shown in the player's notification list.
    category: { type: String, enum: ['general', 'match', 'community', 'tournament', 'billing'], default: 'general' },
    // In-app path this notification opens, e.g. "/u/community?topic=<id>". Empty means not linkable.
    link: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

// The bell polls unread counts per user, and the list is always newest-first.
notificationSchema.index({ userID: 1, status: 1 });
notificationSchema.index({ userID: 1, createdAt: -1 });

const Notify = mongoose.model('Notification', notificationSchema);

export default Notify;
export type { INotify };
