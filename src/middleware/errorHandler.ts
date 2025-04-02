import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default (err: Error, _req: Request, res: Response) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
