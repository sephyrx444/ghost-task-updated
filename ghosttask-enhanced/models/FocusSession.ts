import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFocusSession extends Document {
  userId: Types.ObjectId;
  taskId?: Types.ObjectId;
  duration: number;
  completed: boolean;
  startedAt: Date;
}

const FocusSessionSchema: Schema<IFocusSession> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  duration: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
});

export const FocusSession: Model<IFocusSession> =
  mongoose.models.FocusSession || mongoose.model<IFocusSession>('FocusSession', FocusSessionSchema);
