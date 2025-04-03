import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';

export default async function deleteTransactionController(req: Request, res: Response) {
  const session = await Transaction.startSession();

  try {
    session.startTransaction();

    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({
        error: 'Transaction not found',
      });
      return;
    }

    const account = await Account.findById(transaction.account);
    if (!account) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({
        error: 'Associated account not found',
      });
      return;
    }

    // Calculate balance adjustment
    let balanceAdjustment = 0;
    if (transaction.type === TransactionType.credit) {
      balanceAdjustment = -(transaction.amount ?? 0);
    } else {
      balanceAdjustment = transaction.cost ?? 0;
    }

    // Check if deletion would result in negative balance
    if (account.balance + balanceAdjustment < 0) {
      await session.abortTransaction();
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Cannot delete transaction: would result in negative balance',
      });
      return;
    }

    account.balance += balanceAdjustment;
    await account.save({ session });

    await Transaction.findByIdAndDelete(transactionId).session(session);

    await session.commitTransaction();

    res.json({
      account,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
