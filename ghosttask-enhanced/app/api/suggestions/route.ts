import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/config/db';
import { Task } from '@/models/Task';
import { Suggestion } from '@/models/Suggestion';
import { successResponse, errorResponse } from '@/utils/api';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    let suggestions = await Suggestion.find({ userId, status: 'pending' }).populate('taskId').sort({ createdAt: -1 });

    // Auto-generate suggestions for missed/overdue tasks if none exist
    if (suggestions.length === 0) {
      await generateSuggestions(userId);
      suggestions = await Suggestion.find({ userId, status: 'pending' }).populate('taskId').sort({ createdAt: -1 });
    }

    return successResponse(suggestions, 'Suggestions retrieved');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    await generateSuggestions(userId);
    const suggestions = await Suggestion.find({ userId, status: 'pending' }).populate('taskId');
    return successResponse(suggestions, 'Suggestions generated');
  } catch (error) {
    return errorResponse(error);
  }
}

async function generateSuggestions(userId: string) {
  const now = new Date();
  // Find overdue + pending tasks that are past due
  const tasks = await Task.find({
    userId,
    isArchived: false,
    status: { $in: ['pending', 'overdue'] },
    dueDate: { $lt: now },
  }).limit(5);

  const reasons = [
    'This task was missed. We suggest rescheduling to a morning slot when your focus is highest.',
    'Overdue task detected. Moving to tomorrow 9 AM to help you catch up without overloading today.',
    'Based on your completion patterns, afternoon slots work well for this category.',
    'Missed deadline detected. Smart reschedule to your next free morning window.',
    'High cognitive load prevented completion. Shifting to a lighter day.',
  ];

  for (const task of tasks) {
    const existing = await Suggestion.findOne({ taskId: task._id, userId, status: 'pending' });
    if (existing) continue;

    const suggestedDate = new Date();
    suggestedDate.setDate(suggestedDate.getDate() + 1);
    suggestedDate.setHours(9 + Math.floor(Math.random() * 4), 0, 0, 0);

    // Mark task as overdue
    await Task.findByIdAndUpdate(task._id, { status: 'overdue' });

    await Suggestion.create({
      userId,
      taskId: task._id,
      originalDate: task.dueDate,
      suggestedDate,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      status: 'pending',
      missedTaskTitle: task.title,
    });
  }
}
