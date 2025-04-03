import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';

export default async function editTransactionController(req: Request, res: Response) {
  const { transactionId } = req.params;
  const { date, amount, cost } = req.body;

  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findById(transactionId).session(session);
    if (!transaction) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({
        error: 'Transaction not found',
      });
      return;
    }

    const account = await Account.findById(transaction.account).session(session);
    if (!account) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({
        error: 'Associated account not found',
      });
      return;
    }

    // Calculate balance adjustment
    let balanceAdjustment = 0;

    if (transaction.type === TransactionType.credit && amount !== undefined) {
      balanceAdjustment = amount - (transaction.amount ?? 0);
    } else if (transaction.type === TransactionType.debit && cost !== undefined) {
      balanceAdjustment = (transaction.cost ?? 0) - cost;
    }

    // Check if new balance would be negative
    if (account.balance + balanceAdjustment < 0) {
      await session.abortTransaction();
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Insufficient funds',
      });
      return;
    }

    if (date !== undefined) transaction.date = new Date(date);
    if (amount !== undefined) transaction.amount = amount;
    if (cost !== undefined) transaction.cost = cost;

    await transaction.save({ session });

    if (balanceAdjustment !== 0) {
      account.balance += balanceAdjustment;
      await account.save({ session });
    }

    await session.commitTransaction();
    res.json({
      transaction,
      account: balanceAdjustment !== 0 ? account : undefined,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
