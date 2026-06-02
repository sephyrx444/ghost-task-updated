import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IActivity extends Document {
  userId: Types.ObjectId;
  action: 'completed' | 'rescheduled' | 'missed' | 'added';
  taskTitle: string;
  details?: string;
  timestamp: Date;
}

const ActivitySchema: Schema<IActivity> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: {
    type: String,
    enum: ['completed', 'rescheduled', 'missed', 'added'],
    required: true,
  },
  taskTitle: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
