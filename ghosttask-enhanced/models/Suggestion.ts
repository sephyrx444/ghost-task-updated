import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISuggestion extends Document {
  userId: Types.ObjectId;
  taskId: Types.ObjectId;
  originalDate: Date;
  suggestedDate: Date;
  reason: string;
  status: 'pending' | 'applied' | 'rejected';
  missedTaskTitle?: string;
  createdAt: Date;
}

const SuggestionSchema: Schema<ISuggestion> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    originalDate: { type: Date, required: true },
    suggestedDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'applied', 'rejected'],
      default: 'pending',
      index: true,
    },
    missedTaskTitle: { type: String },
  },
  { timestamps: true }
);

export const Suggestion: Model<ISuggestion> =
  mongoose.models.Suggestion || mongoose.model<ISuggestion>('Suggestion', SuggestionSchema);
