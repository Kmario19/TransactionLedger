import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';

export default async (req: Request, res: Response) => {
  const existingAccount = await Account.findOne({ name: req.body.name });

  if (existingAccount) {
    return res.status(StatusCodes.CONFLICT).json({
      message: 'Account with this name already exists',
    });
  }

  const account = await Account.create(req.body);

  res.status(StatusCodes.CREATED).json(account);
};
