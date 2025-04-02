import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export default (err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
