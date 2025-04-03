import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';

export default async (req: Request, res: Response) => {
  const account = await Account.create(req.body);

  res.status(StatusCodes.CREATED).json(account);
};
