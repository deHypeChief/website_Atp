import mongoose, { Document, Schema } from 'mongoose';

interface IResetToken extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const resetTokenSchema = new mongoose.Schema<IResetToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from creation
  },
});

const ResetToken = mongoose.model<IResetToken>('ResetToken', resetTokenSchema);

export default ResetToken;
