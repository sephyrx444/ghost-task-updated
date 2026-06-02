import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  category: 'academic' | 'personal' | 'work' | 'other';
  dueDate: Date;
  estimatedTime: number;
  actualTimeSpent: number;
  completedAt?: Date;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'overdue'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    category: {
      type: String,
      enum: ['academic', 'personal', 'work', 'other'],
      default: 'other',
      index: true,
    },
    dueDate: { type: Date, required: true, index: true },
    estimatedTime: { type: Number, default: 30 },
    actualTimeSpent: { type: Number, default: 0 },
    completedAt: { type: Date },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
