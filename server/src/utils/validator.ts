import type { Request } from 'express';
import type { ZodType } from 'zod';
import { ZodError } from 'zod';
import { ApiError } from '../exceptions/api-error.js';

export function createValidate(key: 'body' | 'query' | 'params') {
  return async function validate<T>(
    schema: ZodType<T>,
    request: Request,
  ): Promise<T> {
    try {
      return await schema.parseAsync(request[key]);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ApiError.BadRequest('Ошибка валидации', error.issues.map(item => item.message));
      }
      throw error;
    }
  };
}

export const validateBody = createValidate('body');
export const validateQuery = createValidate('query');
export const validateParams = createValidate('params');