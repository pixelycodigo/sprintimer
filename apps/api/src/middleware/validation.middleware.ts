import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export function validateSchema(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar body
      if (req.body && Object.keys(req.body).length > 0) {
        req.body = schema.parse(req.body);
      }

      // Validar query params
      if (req.query && Object.keys(req.query).length > 0) {
        req.query = schema.parse(req.query);
      }

      // Validar params
      if (req.params && Object.keys(req.params).length > 0) {
        req.params = schema.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validación fallida',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}
