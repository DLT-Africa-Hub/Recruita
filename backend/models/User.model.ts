import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'graduate' | 'company' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['graduate', 'company', 'admin'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);

