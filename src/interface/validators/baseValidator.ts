import { ZodSchema, ZodError } from 'zod';

interface ValidationIssue {
  path: string;
  message: string;
}

export class RequestValidator {
  static validate<T>(schema: ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const issues: ValidationIssue[] = error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        throw new Error(`Validation failed: ${JSON.stringify(issues)}`);
      }
      throw error;
    }
  }
}
