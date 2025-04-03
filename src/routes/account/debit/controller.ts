import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';

export default async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const { cost, date } = req.body;

  const account = await Account.findById(accountId);
  if (!account) {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Account not found' });
    return;
  }

  if (account.balance < cost) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Insufficient funds' });
    return;
  }

  const transaction = await Transaction.create({
    cost,
    date,
    type: TransactionType.debit,
    account: accountId,
  });

  account.balance -= cost;
  await account.save();

  res.status(StatusCodes.CREATED).json({ account, transaction });
};
