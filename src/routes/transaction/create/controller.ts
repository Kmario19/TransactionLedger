import { Transaction } from '@/models/Transaction';
import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async (req: Request, res: Response) => {
  const transaction = await Transaction.create(req.body);

  res.status(StatusCodes.CREATED).json(transaction);
};
