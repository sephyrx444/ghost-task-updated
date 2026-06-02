import { BaseRepository } from './BaseRepository';
import { Activity, IActivity } from '@/models/Activity';

export class ActivityRepository extends BaseRepository<IActivity> {
  constructor() {
    super(Activity);
  }

  async getRecent(limit = 10): Promise<IActivity[]> {
    return this.find({}, null, { sort: { timestamp: -1 }, limit });
  }
}
