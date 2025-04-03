import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';

export default async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const { cost, date } = req.body;

  const session = await Account.startSession();
  session.startTransaction();

  try {
    const account = await Account.findById(accountId).session(session);
    if (!account) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Account not found' });
      return;
    }

    if (account.balance < cost) {
      await session.abortTransaction();
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Insufficient funds' });
      return;
    }

    const transaction = await Transaction.create(
      [
        {
          cost,
          date,
          type: TransactionType.debit,
          account: accountId,
        },
      ],
      { session }
    );

    account.balance -= cost;
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
