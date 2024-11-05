import mongoose from "mongoose";
import { Document } from "mongoose";
import { ObjectId } from "mongoose";

interface ILeader extends Document {
    tour: ObjectId;
    gold: ObjectId;
    silver: ObjectId;
    bronze: ObjectId;
}

const leaderSchema = new mongoose.Schema<ILeader>({
    tour: {type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
    gold: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    silver: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bronze: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
})


const Leader = mongoose.model<ILeader>('Leader', leaderSchema)
export default Leader