import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.enum(['academic', 'personal', 'work', 'other']).default('other'),
  dueDate: z.preprocess((val) => new Date(val as any), z.date()),
  estimatedTime: z.number().int().min(1, 'Estimated time must be at least 1 minute').max(1440).default(30),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: z.enum(['pending', 'completed', 'overdue']).optional(),
  actualTimeSpent: z.number().int().min(0).optional(),
});
