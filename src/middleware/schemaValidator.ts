import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, type z } from 'zod';

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

      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.params) {
        await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        await schemas.query.parseAsync(req.query || {});
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
      throw error;
    }
  };
};
