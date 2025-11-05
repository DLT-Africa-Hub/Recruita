import mongoose, { Schema, Document } from 'mongoose';

export interface IGraduate extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  skills: string[];
  education: {
    degree: string;
    field: string;
    institution: string;
    graduationYear: number;
  };
  interests: string[];
  assessmentData?: {
    submittedAt: Date;
    embedding?: number[];
    feedback?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GraduateSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    education: {
      degree: {
        type: String,
        required: true,
      },
      field: {
        type: String,
        required: true,
      },
      institution: {
        type: String,
        required: true,
      },
      graduationYear: {
        type: Number,
        required: true,
      },
    },
    interests: {
      type: [String],
      default: [],
    },
    assessmentData: {
      submittedAt: Date,
      embedding: [Number],
      feedback: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGraduate>('Graduate', GraduateSchema);

