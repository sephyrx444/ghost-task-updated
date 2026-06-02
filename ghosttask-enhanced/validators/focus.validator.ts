import { z } from 'zod';

export const RecordFocusSessionSchema = z.object({
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Task ID format').optional(),
  duration: z.number().int().min(1, 'Duration must be at least 1 second'),
  completed: z.boolean().default(true),
});
