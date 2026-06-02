import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  meta?: any;
}

export function successResponse<T>(data: T, message?: string, meta?: any, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data, message, meta }, { status });
}

export function errorResponse(error: any, statusOverride?: number) {
  let statusCode = statusOverride || 500;
  let message = 'Internal Server Error';
  let errors: any[] | undefined = undefined;

  if (error instanceof AppError) {
    statusCode = statusOverride || error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error instanceof Error) {
    message = error.message;
  }

  logger.error(`API Error: ${message}`, error);
  return NextResponse.json<ApiResponse>({ success: false, message, errors }, { status: statusCode });
}
