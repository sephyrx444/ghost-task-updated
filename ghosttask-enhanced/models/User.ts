import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true,
      index: true 
    },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'user' },
  },
  {
    timestamps: true,
  }
);

// Method to verify passwords
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
