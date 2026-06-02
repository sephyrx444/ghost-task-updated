import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  RateLimitError,
} from '@/lib/errors';

describe('Custom Domain Errors', () => {
  it('should create AppError with default internal server error status', () => {
    const error = new AppError('Database error occurred');
    expect(error.message).toBe('Database error occurred');
    expect(error.statusCode).toBe(500);
  });

  it('should create ValidationError with 400 status', () => {
    const error = new ValidationError('Payload fields missing', [{ field: 'title', message: 'Required' }]);
    expect(error.message).toBe('Payload fields missing');
    expect(error.statusCode).toBe(400);
    expect(error.errors).toBeDefined();
    expect(error.errors?.[0].field).toBe('title');
  });

  it('should create NotFoundError with 404 status', () => {
    const error = new NotFoundError('Task not found');
    expect(error.message).toBe('Task not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create UnauthorizedError with 401 status', () => {
    const error = new UnauthorizedError();
    expect(error.message).toBe('Unauthorized access');
    expect(error.statusCode).toBe(401);
  });

  it('should create RateLimitError with 429 status', () => {
    const error = new RateLimitError();
    expect(error.message).toContain('Too many requests');
    expect(error.statusCode).toBe(429);
  });
});
