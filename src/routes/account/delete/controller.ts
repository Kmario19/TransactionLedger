import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';
import { Transaction } from '@/models/Transaction';

export default async function deleteAccountController(req: Request, res: Response) {
  const { id } = req.params;

  const account = await Account.findById(id);
  if (!account) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: 'Account not found',
    });
    return;
  }

  switch (process.env.TRANSACTION_DELETE_POLICY) {
    case 'cascade':
      await Transaction.deleteMany({ account: id });
      break;
    case 'deny': {
      const hasTransactions = await Transaction.exists({ account: id });
      if (hasTransactions) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Cannot delete account with existing transactions',
        });
        return;
      }
      break;
    }
    case 'keep':
      // Do nothing, just keep the transactions
      break;
    default:
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid transaction delete policy',
      });
      return;
  }

  await Account.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    message: 'Account deleted successfully',
  });
}
