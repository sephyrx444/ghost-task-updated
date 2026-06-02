import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/config/db';
import { Suggestion } from '@/models/Suggestion';
import { Task } from '@/models/Task';
import { Activity } from '@/models/Activity';
import { successResponse, errorResponse } from '@/utils/api';
import { getUserIdFromRequest } from '@/lib/auth';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    const suggestion = await Suggestion.findOne({ _id: params.id, userId });
    if (!suggestion) return errorResponse(new Error('Suggestion not found'), 404);

    suggestion.status = 'applied';
    await suggestion.save();

    // Reschedule the task
    const task = await Task.findOneAndUpdate(
      { _id: suggestion.taskId, userId },
      { dueDate: suggestion.suggestedDate, status: 'pending' },
      { new: true }
    );

    if (task) {
      await Activity.create({
        userId,
        action: 'rescheduled',
        taskTitle: task.title,
        details: `AI rescheduled: ${suggestion.reason}`,
      });
    }

    return successResponse(suggestion, 'Suggestion applied');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    await Suggestion.findOneAndUpdate({ _id: params.id, userId }, { status: 'rejected' });
    return successResponse(null, 'Suggestion dismissed');
  } catch (error) {
    return errorResponse(error);
  }
}
