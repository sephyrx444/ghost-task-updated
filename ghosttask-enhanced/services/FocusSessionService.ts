import { FocusSessionRepository } from '@/repositories/FocusSessionRepository';
import { TaskRepository } from '@/repositories/TaskRepository';
import { ActivityRepository } from '@/repositories/ActivityRepository';
import { IFocusSession } from '@/models/FocusSession';
import { logger } from '@/lib/logger';

export class FocusSessionService {
  private focusRepo: FocusSessionRepository;
  private taskRepo: TaskRepository;
  private activityRepo: ActivityRepository;

  constructor() {
    this.focusRepo = new FocusSessionRepository();
    this.taskRepo = new TaskRepository();
    this.activityRepo = new ActivityRepository();
  }

  async recordSession(data: { taskId?: string; duration: number; completed: boolean }): Promise<IFocusSession> {
    const session = await this.focusRepo.create({
      taskId: data.taskId as any,
      duration: data.duration,
      completed: data.completed,
    });

    logger.info(`Focus Session recorded: ${data.duration}s. Completed: ${data.completed}`);

    // If associated with a task, increment its actualTimeSpent (convert seconds to minutes)
    if (data.taskId && data.completed) {
      const task = await this.taskRepo.findById(data.taskId);
      if (task) {
        const addedMinutes = Math.round(data.duration / 60);
        await this.taskRepo.update(data.taskId, {
          $inc: { actualTimeSpent: addedMinutes },
        });

        await this.activityRepo.create({
          action: 'completed',
          taskTitle: task.title,
          details: `Focused for ${Math.round(data.duration / 60)} mins in Focus Session`,
        });
      }
    } else if (data.completed) {
      await this.activityRepo.create({
        action: 'completed',
        taskTitle: 'Quick Focus Timer',
        details: `Focused for ${Math.round(data.duration / 60)} mins`,
      });
    }

    return session;
  }

  async getRecentSessions(limit = 10): Promise<IFocusSession[]> {
    return this.focusRepo.getRecentFocusSessions(limit);
  }
}

export const focusSessionService = new FocusSessionService();
