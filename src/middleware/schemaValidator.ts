import type { Request, Response, NextFunction } from 'express';
import { type z, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

type ValidationSchema = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

export default (schemas: ValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body && !req.body) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Validation Error',
          message: 'Request body is required',
        });
        return;
      }

      if (schemas.params && Object.keys(req.params).length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Validation Error',
          message: 'URL parameters are required',
        });
        return;
      }

      if (schemas.query && Object.keys(req.query).length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Validation Error',
          message: 'Query parameters are required',
        });
        return;
      }

      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Validation Error',
          details: errorMessages,
        });
        return;
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
      });
    }
  };
};
