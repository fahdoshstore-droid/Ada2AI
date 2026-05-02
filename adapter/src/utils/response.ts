import { ApiResponse, ApiError } from '../types/index.js';

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

export function fail(message: string, code: string): ApiError {
  return { success: false, data: null, error: { message, code } };
}
