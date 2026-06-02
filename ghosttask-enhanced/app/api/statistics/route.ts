import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/config/db';
import { Task } from '@/models/Task';
import { successResponse, errorResponse } from '@/utils/api';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    const tasks = await Task.find({ userId, isArchived: false });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const productivityScore = Math.min(100, Math.round(completionRate * 0.7 + (pendingTasks === 0 ? 30 : 10)));

    // Build 7-day chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d); nextD.setDate(nextD.getDate() + 1);
      const dayTasks = tasks.filter(t => {
        const td = new Date(t.dueDate);
        return td >= d && td < nextD;
      });
      const dayCompleted = dayTasks.filter(t => t.status === 'completed').length;
      const value = dayTasks.length > 0 ? Math.round((dayCompleted / dayTasks.length) * 100) : 0;
      chartData.push({ day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], value });
    }

    return successResponse({
      totalTasks, completedTasks, pendingTasks, overdueTasks, completionRate, productivityScore, chartData
    }, 'Stats computed');
  } catch (error) {
    return errorResponse(error);
  }
}
