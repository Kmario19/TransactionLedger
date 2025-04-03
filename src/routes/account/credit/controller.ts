import type { Request as ExpressRequest, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { z } from 'zod';
import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';
import type schema from './schema';

export type Request = ExpressRequest<z.infer<typeof schema.params>, unknown, z.infer<typeof schema.body>>;

export default async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const { amount, date } = req.body;

  const session = await Account.startSession();
  session.startTransaction();

  try {
    const account = await Account.findById(accountId).session(session);
    if (!account) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Account not found' });
      return;
    }

    const transaction = await Transaction.create(
      [
        {
          amount,
          date,
          type: TransactionType.credit,
          account: accountId,
        },
      ],
      { session }
    );

    account.balance += amount;
    await account.save({ session });

    await session.commitTransaction();
    res.status(StatusCodes.CREATED).json({ account, transaction });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
