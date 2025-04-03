import type { Response } from 'express';
import creditAccountController, { type Request } from './controller';
import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';
import { StatusCodes } from 'http-status-codes';

describe('creditAccountController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: { accountId: '123' },
      body: { amount: 500, date: '2025-04-02' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should credit the account and return 200', async () => {
    const accountId = '123';
    const creditAmount = 500;
    const currentBalance = 1000;
    const newBalance = currentBalance + creditAmount;

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
      type: TransactionType.credit,
      amount: creditAmount,
      balance: newBalance,
      description: 'Account credit',
    });

    await creditAccountController(req as Request, res as Response);

    expect(mockAccount.save).toHaveBeenCalled();
    expect(Transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account: accountId,
        type: TransactionType.credit,
        amount: creditAmount,
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

    await creditAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Account not found',
      })
    );
  });
});
