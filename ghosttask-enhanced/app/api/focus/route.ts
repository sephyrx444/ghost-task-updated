import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/config/db';
import { FocusSession } from '@/models/FocusSession';
import { successResponse, errorResponse } from '@/utils/api';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    const body = await req.json();
    const session = await FocusSession.create({
      userId,
      taskId: body.taskId || undefined,
      duration: body.duration || 1500,
      completed: body.completed ?? true,
    });
    return successResponse(session, 'Focus session logged', undefined, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
