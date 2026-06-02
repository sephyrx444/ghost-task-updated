import { describe, it, expect } from 'vitest';
import { CreateTaskSchema, UpdateTaskSchema } from '@/validators/task.validator';

describe('Task Validation Schemas', () => {
  describe('CreateTaskSchema', () => {
    it('should validate correctly for a valid task payload', () => {
      const validPayload = {
        title: 'Complete physics project',
        priority: 'high',
        category: 'academic',
        dueDate: new Date().toISOString(),
        estimatedTime: 45,
      };

      const result = CreateTaskSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(validPayload.title);
        expect(result.data.priority).toBe('high');
        expect(result.data.category).toBe('academic');
      }
    });

    it('should fail validation when title is empty', () => {
      const invalidPayload = {
        title: '',
        dueDate: new Date().toISOString(),
      };

      const result = CreateTaskSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const titleError = result.error.issues.find(e => e.path.includes('title'));
        expect(titleError).toBeDefined();
      }
    });

    it('should fail validation when due date is invalid format', () => {
      const invalidPayload = {
        title: 'Check car tire pressure',
        dueDate: 'not-a-date',
      };

      const result = CreateTaskSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateTaskSchema', () => {
    it('should allow partial parameters', () => {
      const partialPayload = {
        priority: 'low' as const,
        status: 'completed' as const,
      };

      const result = UpdateTaskSchema.safeParse(partialPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('low');
        expect(result.data.status).toBe('completed');
      }
    });
  });
});
