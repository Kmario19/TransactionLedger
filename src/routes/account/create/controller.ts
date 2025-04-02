import type { Request, Response } from 'express';
import { Account } from '@/models/Account';
import { StatusCodes } from 'http-status-codes';

export default async (req: Request, res: Response) => {
  const account = await Account.create(req.body);

  res.status(StatusCodes.CREATED).json(account);
};
