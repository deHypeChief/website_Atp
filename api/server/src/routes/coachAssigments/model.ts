import mongoose, { Schema } from 'mongoose';

export interface ICoachAssignment {
    status: "Assigned" | "Pending";
    coachId: string;
    playerId: string;
}

const CoachAssignmentSchema: Schema = new Schema<ICoachAssignment>({
    status: {
        type: String,
        enum: ["Assigned", "Pending"],
        required: true
    },
    coachId: {
        type: String,
    },
    playerId: {
        type: String,
        required: true
    }
});

const CoachAssignment = mongoose.model<ICoachAssignment>('CoachAssignment', CoachAssignmentSchema);
export default CoachAssignment