import { BaseRepository } from './BaseRepository';
import { Suggestion, ISuggestion } from '@/models/Suggestion';

export class SuggestionRepository extends BaseRepository<ISuggestion> {
  constructor() {
    super(Suggestion);
  }

  async findPendingWithTasks(): Promise<ISuggestion[]> {
    return this.model
      .find({ status: 'pending' })
      .populate('taskId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
