import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/config/db';
import { Task } from '@/models/Task';
import { Activity } from '@/models/Activity';
import { successResponse, errorResponse } from '@/utils/api';
import { rateLimiter } from '@/lib/rateLimit';
import { getUserIdFromRequest } from '@/lib/auth';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    rateLimiter(ip, { max: 60 });
    await connectToDatabase();

    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    const { searchParams } = new URL(req.url);
    const actualTime = parseInt(searchParams.get('actualTimeSpent') || '0', 10);

    const task = await Task.findOneAndUpdate(
      { _id: params.id, userId },
      { status: 'completed', completedAt: new Date(), actualTimeSpent: actualTime },
      { new: true }
    );
    if (!task) return errorResponse(new Error('Task not found'), 404);

    await Activity.create({
      userId,
      action: 'completed',
      taskTitle: task.title,
      details: `Completed after ${actualTime || task.estimatedTime} min`,
    });

    return successResponse(task, 'Task marked as completed');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    rateLimiter(ip, { max: 60 });
    await connectToDatabase();

    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    await Task.findOneAndDelete({ _id: params.id, userId });
    return successResponse(null, 'Task deleted successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
