import type { Request, Response } from 'express';
import { Transaction } from '@/models/Transaction';
import { StatusCodes } from 'http-status-codes';

export default async (req: Request, res: Response) => {
  const transaction = new Transaction(req.body);

  await transaction.save();

  res.status(StatusCodes.CREATED).json(transaction);
};
