import { BaseRepository } from './BaseRepository';
import { Task, ITask } from '@/models/Task';

export class TaskRepository extends BaseRepository<ITask> {
  constructor() {
    super(Task);
  }

  async findActive(filters: any = {}): Promise<ITask[]> {
    return this.find({ isArchived: false, ...filters }, null, { sort: { dueDate: 1 } });
  }

  async findOverdue(): Promise<ITask[]> {
    const now = new Date();
    return this.find({
      status: 'pending',
      dueDate: { $lt: now },
      isArchived: false,
    });
  }

  async markAsOverdue(id: string): Promise<ITask | null> {
    return this.update(id, { status: 'overdue' });
  }

  async completeTask(id: string, actualTime: number): Promise<ITask | null> {
    return this.update(id, {
      status: 'completed',
      actualTimeSpent: actualTime,
      completedAt: new Date(),
    });
  }
}
