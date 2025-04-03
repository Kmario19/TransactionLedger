import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account, type IAccount } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';

export default async (req: Request, res: Response) => {
  const { accountId, amount, cost, date, type } = req.body;

  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    let account: IAccount | null = null;

    if (accountId) {
      account = await Account.findById(accountId).session(session);
      if (!account) {
        await session.abortTransaction();
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Account not found' });
        return;
      }

      if (type === TransactionType.debit && account.balance < cost) {
        await session.abortTransaction();
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Insufficient funds' });
        return;
      }

      if (type === TransactionType.debit) {
        account.balance -= cost;
      } else if (type === TransactionType.credit) {
        account.balance += amount;
      }

      await account.save({ session });
    }

    const transaction = await Transaction.create(
      [
        {
          account: accountId,
          amount,
          cost,
          date,
          type,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(StatusCodes.CREATED).json({ transaction, account });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
