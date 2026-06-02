import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/config/db';
import { Task } from '@/models/Task';
import { Activity } from '@/models/Activity';
import { CreateTaskSchema } from '@/validators/task.validator';
import { successResponse, errorResponse } from '@/utils/api';
import { rateLimiter } from '@/lib/rateLimit';
import { ValidationError } from '@/lib/errors';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    rateLimiter(ip, { max: 120 });
    await connectToDatabase();

    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const dateParam = searchParams.get('date'); // for calendar date browsing

    const filters: any = { userId, isArchived: false };
    if (category) filters.category = category;

    if (dateParam) {
      const date = new Date(dateParam);
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      filters.dueDate = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(filters).sort({ dueDate: 1 });
    return successResponse(tasks, 'Tasks retrieved successfully');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    rateLimiter(ip, { max: 60 });
    await connectToDatabase();

    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    const body = await req.json();
    const result = CreateTaskSchema.safeParse(body);
    if (!result.success) throw new ValidationError('Validation failed', result.error.issues);

    const task = await Task.create({ ...result.data, userId });

    await Activity.create({
      userId,
      action: 'added',
      taskTitle: task.title,
      details: `New task created: ${task.category} category`,
    });

    return successResponse(task, 'Task created successfully', undefined, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
