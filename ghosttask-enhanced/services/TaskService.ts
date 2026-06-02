import { TaskRepository } from '@/repositories/TaskRepository';
import { ActivityRepository } from '@/repositories/ActivityRepository';
import { ITask } from '@/models/Task';
import { NotFoundError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export class TaskService {
  private taskRepo: TaskRepository;
  private activityRepo: ActivityRepository;

  constructor() {
    this.taskRepo = new TaskRepository();
    this.activityRepo = new ActivityRepository();
  }

  async getAllActiveTasks(filters?: any): Promise<ITask[]> {
    // Proactively check and update overdue tasks
    await this.updateOverdueTasks();
    return this.taskRepo.findActive(filters);
  }

  async getTaskById(id: string): Promise<ITask> {
    const task = await this.taskRepo.findById(id);
    if (!task || task.isArchived) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }

  async createTask(data: Partial<ITask>): Promise<ITask> {
    const task = await this.taskRepo.create(data);
    logger.info(`Task created: ${task.title}`);

    await this.activityRepo.create({
      action: 'added',
      taskTitle: task.title,
      details: `Created task with priority ${task.priority}`,
    });

    return task;
  }

  async updateTask(id: string, data: Partial<ITask>): Promise<ITask> {
    const task = await this.getTaskById(id);
    const updated = await this.taskRepo.update(id, data);
    if (!updated) {
      throw new NotFoundError('Task not found');
    }

    logger.info(`Task updated: ${updated.title}`);

    // If dueDate changed significantly, log it
    if (data.dueDate && new Date(data.dueDate).getTime() !== new Date(task.dueDate).getTime()) {
      await this.activityRepo.create({
        action: 'rescheduled',
        taskTitle: updated.title,
        details: `Due date changed to ${new Date(data.dueDate).toLocaleDateString()}`,
      });
    }

    return updated;
  }

  async completeTask(id: string, actualTime = 0): Promise<ITask> {
    const task = await this.getTaskById(id);
    const updated = await this.taskRepo.completeTask(id, actualTime);
    if (!updated) {
      throw new NotFoundError('Task not found');
    }

    logger.info(`Task completed: ${updated.title}`);

    await this.activityRepo.create({
      action: 'completed',
      taskTitle: updated.title,
      details: `Completed in ${actualTime} minutes`,
    });

    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await this.getTaskById(id);
    // Soft delete / archive
    await this.taskRepo.update(id, { isArchived: true });
    logger.info(`Task archived: ${id}`);
  }

  async updateOverdueTasks(): Promise<void> {
    const overdue = await this.taskRepo.findOverdue();
    for (const task of overdue) {
      await this.taskRepo.markAsOverdue(task._id as any);
      logger.info(`Task marked as overdue: ${task.title}`);
      await this.activityRepo.create({
        action: 'missed',
        taskTitle: task.title,
        details: 'Missed scheduled due date',
      });
    }
  }
}
export const taskService = new TaskService();
