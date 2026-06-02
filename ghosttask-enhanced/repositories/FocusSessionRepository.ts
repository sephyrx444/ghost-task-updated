import { BaseRepository } from './BaseRepository';
import { FocusSession, IFocusSession } from '@/models/FocusSession';

export class FocusSessionRepository extends BaseRepository<IFocusSession> {
  constructor() {
    super(FocusSession);
  }

  async getRecentFocusSessions(limit = 10): Promise<IFocusSession[]> {
    return this.find({}, null, { sort: { timestamp: -1 }, limit });
  }

  async getTotalFocusTimeForRange(start: Date, end: Date): Promise<number> {
    const results = await this.model.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end },
          completed: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$duration' },
        },
      },
    ]);
    return results[0]?.total || 0;
  }
}
