import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/config/db';
import { Activity } from '@/models/Activity';
import { successResponse, errorResponse } from '@/utils/api';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    const activities = await Activity.find({ userId }).sort({ timestamp: -1 }).limit(20);
    return successResponse(activities, 'Activities retrieved');
  } catch (error) {
    return errorResponse(error);
  }
}
