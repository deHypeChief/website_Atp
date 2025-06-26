import mongoose, { Schema, Document } from 'mongoose';

interface ITransDocument {
    user: mongoose.ObjectId
    type: string
    amount: string
    status: "Pending" | "Complete"
    date: Date
}


const TransSchema: Schema = new Schema({
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Complete"], required: true },
    date: { type: Date, required: true }
});

const Transaction =  mongoose.model<ITransDocument>('Transaction', TransSchema);
export default Transaction