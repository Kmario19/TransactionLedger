import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';
import editTransactionController from './controller';

describe('editTransactionController', () => {
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
      body: { date: '2025-04-02', amount: 500 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should edit the transaction and return the updated transaction and account', async () => {
    const transactionId = 'txn123';
    const accountId = 'acc123';
    const currentBalance = 1000;
    const transactionAmount = 200;
    const newTransactionAmount = 500;
    const balanceAdjustment = newTransactionAmount - transactionAmount;
    const newBalance = currentBalance + balanceAdjustment;

    const mockTransaction = {
      _id: transactionId,
      account: accountId,
      type: TransactionType.credit,
      amount: transactionAmount,
      save: jest.fn().mockResolvedValueOnce({
        _id: transactionId,
        account: accountId,
        type: TransactionType.credit,
        amount: newTransactionAmount,
      }),
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

    await editTransactionController(req as Request, res as Response);

    expect(mockTransaction.save).toHaveBeenCalled();
    expect(mockAccount.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        transaction: expect.objectContaining({
          amount: newTransactionAmount,
        }),
        account: expect.objectContaining({
          balance: newBalance,
        }),
      })
    );
  });

  it('should edit the transaction and return the updated transaction without account when balance is 0', async () => {
    const transactionId = 'txn123';
    const accountId = 'acc123';
    const currentBalance = 300;
    const transactionCost = 200;
    const newTransactionCost = 500;
    const balanceAdjustment = newTransactionCost - transactionCost;
    const newBalance = currentBalance - balanceAdjustment;

    const mockTransaction = {
      _id: transactionId,
      account: accountId,
      type: TransactionType.debit,
      cost: transactionCost,
      save: jest.fn().mockResolvedValueOnce({
        _id: transactionId,
        account: accountId,
        type: TransactionType.debit,
        cost: newTransactionCost,
      }),
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

    await editTransactionController(req as Request, res as Response);

    expect(mockTransaction.save).toHaveBeenCalled();
    expect(mockAccount.save).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      transaction: expect.objectContaining({
        amount: newTransactionCost,
      }),
    });
  });

  it('should return 404 if transaction is not found', async () => {
    Transaction.findById = jest.fn().mockResolvedValueOnce(null);

    await editTransactionController(req as Request, res as Response);

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

    await editTransactionController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Associated account not found',
      })
    );
  });

  it('should return 400 if balance adjustment results in negative balance', async () => {
    const transactionId = 'txn123';
    const accountId = 'acc123';
    const currentBalance = 100;
    const transactionAmount = 200;
    const newTransactionAmount = 500;

    const mockTransaction = {
      _id: transactionId,
      account: accountId,
      type: TransactionType.debit,
      cost: transactionAmount,
    };

    const mockAccount = {
      _id: accountId,
      balance: currentBalance,
    };

    Transaction.findById = jest.fn().mockResolvedValueOnce(mockTransaction);
    Account.findById = jest.fn().mockResolvedValueOnce(mockAccount);
    req.body.cost = newTransactionAmount;

    await editTransactionController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Insufficient funds',
      })
    );
  });

  it('should make balance adjusment when debit is empty', async () => {
    const transactionId = 'txn123';
    const accountId = 'acc123';
    const currentBalance = 100;
    const newTransactionAmount = 500;

    const mockTransaction = {
      _id: transactionId,
      account: accountId,
      type: TransactionType.debit,
    };

    const mockAccount = {
      _id: accountId,
      balance: currentBalance,
    };

    Transaction.findById = jest.fn().mockResolvedValueOnce(mockTransaction);
    Account.findById = jest.fn().mockResolvedValueOnce(mockAccount);
    req.body.cost = newTransactionAmount;

    await editTransactionController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Insufficient funds',
      })
    );
  });

  it('should make balance adjusment when credit is empty', async () => {
    const transactionId = 'txn123';
    const accountId = 'acc123';
    const currentBalance = 100;
    const newTransactionAmount = 500;
    const newBalance = currentBalance + newTransactionAmount;

    const mockTransaction = {
      _id: transactionId,
      account: accountId,
      type: TransactionType.credit,
      save: jest.fn().mockResolvedValueOnce({
        _id: transactionId,
        account: accountId,
        type: TransactionType.debit,
        cost: newTransactionAmount,
      }),
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
    req.body.cost = newTransactionAmount;

    await editTransactionController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        transaction: expect.objectContaining({
          amount: newTransactionAmount,
        }),
        account: expect.objectContaining({
          balance: newBalance,
        }),
      })
    );
  });

  it('should handle errors and abort transaction', async () => {
    Transaction.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    await expect(editTransactionController(req as Request, res as Response)).rejects.toThrow('Database error');
  });
});
