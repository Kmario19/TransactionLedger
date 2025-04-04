import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';
import debitAccountController from './controller';

describe('debitAccountController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeAll(() => {
    Account.startSession = jest.fn().mockReturnValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: { accountId: 'acc123' },
      body: { cost: 200, date: '2025-04-02' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should debit the account and return the updated account and transaction', async () => {
    const accountId = 'acc123';
    const currentBalance = 1000;
    const debitCost = 200;
    const newBalance = currentBalance - debitCost;

    const mockAccount = {
      _id: accountId,
      balance: currentBalance,
      save: jest.fn().mockResolvedValueOnce({
        _id: accountId,
        balance: newBalance,
      }),
    };

    const mockTransaction = {
      _id: 'txn123',
      account: accountId,
      type: TransactionType.debit,
      cost: debitCost,
    };

    Account.findById = jest.fn().mockReturnValueOnce({ session: jest.fn().mockResolvedValueOnce(mockAccount) });
    Transaction.create = jest.fn().mockResolvedValueOnce(mockTransaction);

    await debitAccountController(req as Request, res as Response);

    expect(mockAccount.save).toHaveBeenCalled();
    expect(Transaction.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          account: accountId,
          type: TransactionType.debit,
          cost: debitCost,
        }),
      ],
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({
          balance: newBalance,
        }),
        transaction: mockTransaction,
      })
    );
  });

  it('should return 404 if account is not found', async () => {
    Account.findById = jest.fn().mockReturnValueOnce({ session: jest.fn().mockResolvedValueOnce(null) });

    await debitAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Account not found',
      })
    );
  });

  it('should return 400 if insufficient funds', async () => {
    const accountId = 'acc123';
    const currentBalance = 100;

    const mockAccount = {
      _id: accountId,
      balance: currentBalance,
    };

    Account.findById = jest.fn().mockReturnValueOnce({ session: jest.fn().mockResolvedValueOnce(mockAccount) });

    await debitAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Insufficient funds',
      })
    );
  });

  it('should handle errors and abort transaction', async () => {
    Account.findById = jest
      .fn()
      .mockReturnValueOnce({ session: jest.fn().mockRejectedValueOnce(new Error('Database error')) });

    await expect(debitAccountController(req as Request, res as Response)).rejects.toThrow('Database error');
  });
});
