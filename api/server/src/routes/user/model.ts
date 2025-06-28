import mongoose, { Document, ObjectId, Schema } from 'mongoose';
import bcrypt from 'bcryptjs'; 
import validator from 'validator';

interface IUser extends Document {
  picture: string;
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  dob: Date;
  level: string;
  socialAuth: boolean;
  socialToken: string;
  socialType: string;
  assignedCoach: ObjectId;
  resetToken: string;
  comparePassword(candidatePin: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String },
  email: { type: String, required: true, validate: [validator.isEmail, 'Invalid email address'] },
  fullName: { type: String, trim: true, default: '' },
  phoneNumber: { type: String, default: '' },
  dob: { type: Date, default: Date.now() },
  level: { type: String, default: '' },
  socialAuth: { type: Boolean, default: false },
  socialToken: { type: String },
  socialType: { type: String },
  picture: { type: String, default: '' },

  assignedCoach: {
    type: Schema.Types.ObjectId,
    ref: 'Coach',
  },
});

// Pre-save hook for password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = function (candidatePassword: string | Buffer) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
