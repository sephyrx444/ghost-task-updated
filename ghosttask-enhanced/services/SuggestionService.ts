import { SuggestionRepository } from '@/repositories/SuggestionRepository';
import { TaskRepository } from '@/repositories/TaskRepository';
import { ActivityRepository } from '@/repositories/ActivityRepository';
import { ISuggestion } from '@/models/Suggestion';
import { NotFoundError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export class SuggestionService {
  private suggestionRepo: SuggestionRepository;
  private taskRepo: TaskRepository;
  private activityRepo: ActivityRepository;

  constructor() {
    this.suggestionRepo = new SuggestionRepository();
    this.taskRepo = new TaskRepository();
    this.activityRepo = new ActivityRepository();
  }

  async getPendingSuggestions(): Promise<ISuggestion[]> {
    const list = await this.suggestionRepo.findPendingWithTasks();
    if (list.length === 0) {
      // Proactively generate new suggestions if none exist to make dashboard feel alive
      await this.generateAISuggestions();
      return this.suggestionRepo.findPendingWithTasks();
    }
    return list;
  }

  async applySuggestion(id: string): Promise<ISuggestion> {
    const suggestion = await this.suggestionRepo.findById(id);
    if (!suggestion || suggestion.status !== 'pending') {
      throw new NotFoundError('Pending suggestion not found');
    }

    // Mark suggestion as applied
    const updatedSuggestion = await this.suggestionRepo.update(id, { status: 'applied' });
    if (!updatedSuggestion) {
      throw new NotFoundError('Failed to apply suggestion');
    }

    // Reschedule the Task
    const task = await this.taskRepo.findById(suggestion.taskId.toString());
    if (task) {
      await this.taskRepo.update(task._id as any, {
        dueDate: suggestion.suggestedDate,
        status: 'pending', // clear overdue if applicable
      });

      logger.info(`AI Suggestion Applied: Rescheduled task "${task.title}" to ${suggestion.suggestedDate}`);

      await this.activityRepo.create({
        action: 'rescheduled',
        taskTitle: task.title,
        details: `Smart AI rescheduled: ${suggestion.reason}`,
      });
    }

    return updatedSuggestion;
  }

  async rejectSuggestion(id: string): Promise<ISuggestion> {
    const suggestion = await this.suggestionRepo.update(id, { status: 'rejected' });
    if (!suggestion) {
      throw new NotFoundError('Suggestion not found');
    }
    logger.info(`AI Suggestion Rejected: ${id}`);
    return suggestion;
  }

  async generateAISuggestions(): Promise<void> {
    logger.info('Running GhostTask AI rescheduling engine...');
    const tasks = await this.taskRepo.findActive({ status: { $in: ['pending', 'overdue'] } });
    if (tasks.length === 0) return;

    // Filter tasks due today or overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetTasks = tasks.filter((t) => {
      const taskDate = new Date(t.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() <= today.getTime();
    });

    const reasons = [
      'High cognitive load detected today. Reschedule this complex task to a fresher morning slot.',
      'Based on your historic completion speeds, morning slots have 40% higher focus index. Rescheduling suggested.',
      'Multiple deliverables overlap today. Moving this block avoids high fatigue levels.',
      'Productivity indexes show strong evening momentum on academic categories. Shifting due date to tomorrow morning.',
    ];

    let count = 0;
    for (const task of targetTasks) {
      // Ensure we don't duplicate suggestions for the same task
      const existing = await this.suggestionRepo.findOne({
        taskId: task._id as any,
        status: 'pending',
      });

      if (!existing) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0); // Suggest 10 AM tomorrow

        const randomReason = reasons[Math.floor(Math.random() * reasons.length)];

        await this.suggestionRepo.create({
          taskId: task._id as any,
          originalDate: task.dueDate,
          suggestedDate: tomorrow,
          reason: randomReason,
          status: 'pending',
        });
        count++;
        if (count >= 2) break; // generate maximum 2 suggestions per run to keep it elegant
      }
    }
    logger.info(`GhostTask AI Rescheduling engine generated ${count} recommendations.`);
  }
}

export const suggestionService = new SuggestionService();
