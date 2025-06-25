import mongoose, { Schema, Document, model } from 'mongoose';

export interface ICoachAssignment extends Document {
  status: 'Assigned' | 'Pending';
  coachId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
}

const CoachAssignmentSchema = new Schema<ICoachAssignment>({
  status: {
    type: String,
    enum: ['Assigned', 'Pending'],
    required: true,
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach', // Adjust this to match your actual Coach model name
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Adjust this to match your actual Player/User model name
    required: true,
  },
}, {
  timestamps: true // optional: adds createdAt & updatedAt fields
});

const CoachAssignment = model<ICoachAssignment>('CoachAssignment', CoachAssignmentSchema);
export default CoachAssignment;
