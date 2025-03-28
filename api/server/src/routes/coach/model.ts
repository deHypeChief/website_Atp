import mongoose, { Document, Schema } from "mongoose";

// Interface for the coach document
interface ICoach extends Document {
    level: string;
    coachName: string;
    email: string;
    bioInfo: string;
    imageUrl: string;
    avgRate: number; // Better to use 'number' instead of 'string' for rates
    comment: {
        userID: Schema.Types.ObjectId;
        comment: string;
        rating: number; // Use 'number' for rating
    }[];
}

// Coach schema definition
const coachSchema = new mongoose.Schema<ICoach>({
    level: {
        type: String,
        required: true,
    },
    coachName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    bioInfo: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    avgRate: {
        type: Number,
        default: 0,
    },
    comment: [
        {
            userID: {
                type: Schema.Types.ObjectId,
                ref: 'User', // Assuming there's a 'User' model for reference
                require: true
            },
            comment: {
                type: String,
                require: true
            },
            rating: {
                type: Number,
                default: 0,
                require: true
            },
        },
    ],
});

// Creating the model
const Coach = mongoose.model<ICoach>("Coach", coachSchema);
export default Coach;
