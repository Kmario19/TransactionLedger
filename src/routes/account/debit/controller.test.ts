import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';
import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import debitAccountController from './controller';

describe('debitAccountController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: { accountId: '123' },
      body: { cost: 300, date: '2025-04-02' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should debit the account and return 200', async () => {
    const accountId = '123';
    const debitCost = 300;
    const currentBalance = 1000;
    const newBalance = currentBalance - debitCost;

    const mockAccount = {
      _id: accountId,
      name: 'Test Account',
      balance: currentBalance,
      save: jest.fn().mockResolvedValueOnce({
        _id: accountId,
        name: 'Test Account',
        balance: newBalance,
      }),
    };

    Account.findById = jest.fn().mockResolvedValueOnce(mockAccount);
    Transaction.create = jest.fn().mockResolvedValueOnce({
      _id: 'txn123',
      account: accountId,
      type: TransactionType.debit,
      cost: debitCost,
      balance: newBalance,
      description: 'Account debit',
    });

    await debitAccountController(req as Request, res as Response);

    expect(mockAccount.save).toHaveBeenCalled();
    expect(Transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account: accountId,
        type: TransactionType.debit,
        cost: debitCost,
      })
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({
          balance: newBalance,
        }),
      })
    );
  });

  it('should return 404 if account is not found', async () => {
    Account.findById = jest.fn().mockResolvedValueOnce(null);

    await debitAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Account not found',
      })
    );
  });

  it('should return 400 if insufficient funds', async () => {
    const accountId = '123';
    const debitCost = 1500;
    const currentBalance = 1000;

    const mockAccount = {
      _id: accountId,
      name: 'Test Account',
      balance: currentBalance,
    };

    Account.findById = jest.fn().mockResolvedValueOnce(mockAccount);
    req.body = { cost: debitCost };

    await debitAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Insufficient funds',
      })
    );
  });
});
