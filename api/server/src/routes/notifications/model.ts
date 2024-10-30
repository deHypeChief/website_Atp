import mongoose, { ObjectId } from "mongoose";


interface INotify extends Document {
    userID: ObjectId;
    title: string;
    message: string;
    status: 'unread' | 'read';
    type: 'info' | 'alert' | 'success';
    createdAt: Date
}

const notificationSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: {type: String, required: true},
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
    type: { type: String, enum: ['info', 'alert', 'success'], default: 'info' },
    createdAt: { type: Date, default: Date.now }
});

const Notify = mongoose.model('Notification', notificationSchema);

export default Notify;