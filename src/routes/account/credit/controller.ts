import type { Request as ExpressRequest, Response } from 'express';
import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';
import { StatusCodes } from 'http-status-codes';
import type schema from './schema';
import type { z } from 'zod';

export type Request = ExpressRequest<z.infer<typeof schema.params>, unknown, z.infer<typeof schema.body>>;

export default async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const { amount, date } = req.body;

  const account = await Account.findById(accountId);
  if (!account) {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Account not found' });
    return;
  }

  const transaction = await Transaction.create({
    amount,
    date,
    type: TransactionType.credit,
    account: accountId,
  });

  account.balance += amount;
  await account.save();

  res.status(StatusCodes.CREATED).json({ account, transaction });
};
