import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose';
import { isBcryptHash } from '../utils/security.utils';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: 'graduate' | 'company' | 'admin';
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  calendly?: {
    userUri?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    publicLink?: string;
    enabled: boolean;
    connectedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

type UserModel = Model<IUser>;

const UserSchema: Schema<IUser, UserModel> = new Schema(
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
      validate: {
        validator: (value: string) => isBcryptHash(value),
        message: 'Password must be stored as a bcrypt hash',
      },
    },
    role: {
      type: String,
      enum: ['graduate', 'company', 'admin'],
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerifiedAt: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    calendly: {
      userUri: {
        type: String,
        required: false,
      },
      accessToken: {
        type: String,
        required: false,
        select: false,
      },
      refreshToken: {
        type: String,
        required: false,
        select: false,
      },
      tokenExpiresAt: {
        type: Date,
        required: false,
      },
      publicLink: {
        type: String,
        required: false,
      },
      enabled: {
        type: Boolean,
        default: false,
      },
      connectedAt: {
        type: Date,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.model<IUser, UserModel>('User', UserSchema);
