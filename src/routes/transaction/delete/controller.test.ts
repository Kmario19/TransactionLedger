import type { Request, Response } from 'express';
import deleteTransactionController from './controller';
import { Transaction, TransactionType } from '@/models/Transaction';
import { Account } from '@/models/Account';
import { StatusCodes } from 'http-status-codes';

describe('deleteTransactionController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeAll(() => {
    Transaction.startSession = jest.fn().mockReturnValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    });
  });

  beforeEach(() => {
    req = {
      params: { transactionId: 'txn123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should delete the transaction and return the updated account for a credit', async () => {
    const transactionId = 'txn123';
    const accountId = 'acc123';
    const currentBalance = 1000;
    const transactionAmount = 200;
    const newBalance = currentBalance - transactionAmount;

    const mockTransaction = {
      _id: transactionId,
      account: accountId,
      type: TransactionType.credit,
      amount: transactionAmount,
    };

    const mockAccount = {
      _id: accountId,
      balance: currentBalance,
      save: jest.fn().mockResolvedValueOnce({
        _id: accountId,
        balance: newBalance,
      }),
    };

    Transaction.findById = jest.fn().mockResolvedValueOnce(mockTransaction);
    Account.findById = jest.fn().mockResolvedValueOnce(mockAccount);
    Transaction.findByIdAndDelete = jest.fn().mockReturnValue({
      session: jest.fn().mockResolvedValueOnce(null),
    });

    await deleteTransactionController(req as Request, res as Response);

    expect(mockAccount.save).toHaveBeenCalled();
    expect(Transaction.findByIdAndDelete).toHaveBeenCalledWith(transactionId);
    expect(res.status).not.toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({
          balance: newBalance,
        }),
      })
    );
  });

  it('should delete the transaction and return the updated account for a credit of 0', async () => {
    const transactionId = 'txn123';
    const accountId = 'acc123';
    const currentBalance = 1000;

    const mockTransaction = {
      _id: transactionId,
      account: accountId,
      type: TransactionType.credit,
    };

    const mockAccount = {
      _id: accountId,
      balance: currentBalance,
      save: jest.fn().mockResolvedValueOnce({
        _id: accountId,
        balance: currentBalance,
      }),
    };

    Transaction.findById = jest.fn().mockResolvedValueOnce(mockTransaction);
    Account.findById = jest.fn().mockResolvedValueOnce(mockAccount);
    Transaction.findByIdAndDelete = jest.fn().mockReturnValue({
      session: jest.fn().mockResolvedValueOnce(null),
    });

    await deleteTransactionController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({
          balance: currentBalance,
        }),
      })
    );
  });

  it('should delete the transaction and return the updated account for a debit', async () => {
    const transactionId = 'txn123';
    const accountId = 'acc123';
    const currentBalance = 1000;
    const transactionCost = 200;
    const newBalance = currentBalance + transactionCost;

    const mockTransaction = {
      _id: transactionId,
      account: accountId,
      type: TransactionType.debit,
      cost: transactionCost,
    };

    const mockAccount = {
      _id: accountId,
      balance: currentBalance,
      save: jest.fn().mockResolvedValueOnce({
        _id: accountId,
        balance: newBalance,
      }),
    };

    Transaction.findById = jest.fn().mockResolvedValueOnce(mockTransaction);
    Account.findById = jest.fn().mockResolvedValueOnce(mockAccount);
    Transaction.findByIdAndDelete = jest.fn().mockReturnValue({
      session: jest.fn().mockResolvedValueOnce(null),
    });

    await deleteTransactionController(req as Request, res as Response);

    expect(mockAccount.save).toHaveBeenCalled();
    expect(Transaction.findByIdAndDelete).toHaveBeenCalledWith(transactionId);
    expect(res.status).not.toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({
          balance: newBalance,
        }),
      })
    );
  });

  it('should delete the transaction and return the updated account for a debit of 0', async () => {
    const transactionId = 'txn123';
    const accountId = 'acc123';
    const currentBalance = 1000;

    const mockTransaction = {
      _id: transactionId,
      account: accountId,
      type: TransactionType.debit,
    };

    const mockAccount = {
      _id: accountId,
      balance: currentBalance,
      save: jest.fn().mockResolvedValueOnce({
        _id: accountId,
        balance: currentBalance,
      }),
    };

    Transaction.findById = jest.fn().mockResolvedValueOnce(mockTransaction);
    Account.findById = jest.fn().mockResolvedValueOnce(mockAccount);
    Transaction.findByIdAndDelete = jest.fn().mockReturnValue({
      session: jest.fn().mockResolvedValueOnce(null),
    });

    await deleteTransactionController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({
          balance: currentBalance,
        }),
      })
    );
  });

  it('should return 404 if transaction is not found', async () => {
    Transaction.findById = jest.fn().mockResolvedValueOnce(null);

    await deleteTransactionController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Transaction not found',
      })
    );
  });

  it('should return 404 if associated account is not found', async () => {
    const transactionId = 'txn123';

    const mockTransaction = {
      _id: transactionId,
      account: 'acc123',
    };

    Transaction.findById = jest.fn().mockResolvedValueOnce(mockTransaction);
    Account.findById = jest.fn().mockResolvedValueOnce(null);

    await deleteTransactionController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Associated account not found',
      })
    );
  });

  it('should return 400 if deletion would result in negative balance', async () => {
    const transactionId = 'txn123';
    const accountId = 'acc123';
    const currentBalance = 100;
    const transactionAmount = 200;

    const mockTransaction = {
      _id: transactionId,
      account: accountId,
      type: TransactionType.credit,
      amount: transactionAmount,
    };

    const mockAccount = {
      _id: accountId,
      balance: currentBalance,
    };

    Transaction.findById = jest.fn().mockResolvedValueOnce(mockTransaction);
    Account.findById = jest.fn().mockResolvedValueOnce(mockAccount);

    await deleteTransactionController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Cannot delete transaction: would result in negative balance',
      })
    );
  });

  it('should handle errors and abort transaction', async () => {
    Transaction.startSession = jest.fn().mockReturnValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    });

    Transaction.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    await expect(deleteTransactionController(req as Request, res as Response)).rejects.toThrow('Database error');
  });
});
