import { ActivityRepository } from '@/repositories/ActivityRepository';
import { IActivity } from '@/models/Activity';

export class ActivityService {
  private activityRepo: ActivityRepository;

  constructor() {
    this.activityRepo = new ActivityRepository();
  }

  async getRecentActivities(limit = 10): Promise<IActivity[]> {
    return this.activityRepo.getRecent(limit);
  }
}

export const activityService = new ActivityService();
