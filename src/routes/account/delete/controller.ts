import type { Request, Response } from 'express';
import { Account } from '@/models/Account';
import { Transaction } from '@/models/Transaction';
import { StatusCodes } from 'http-status-codes';

export default async function deleteAccountController(req: Request, res: Response) {
  try {
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
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Error deleting account',
    });
  }
}
