import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';
import { Transaction, TransactionType } from '@/models/Transaction';
import creditAccountController, { type Request } from './controller';

describe('creditAccountController', () => {
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
    req = {
      params: { accountId: 'acc123' },
      body: { amount: 200, date: '2025-04-02' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should credit the account and return the updated account and transaction', async () => {
    const accountId = 'acc123';
    const currentBalance = 1000;
    const creditAmount = 200;
    const newBalance = currentBalance + creditAmount;

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
      type: TransactionType.credit,
      amount: creditAmount,
    };

    Account.findById = jest.fn().mockReturnValueOnce({ session: jest.fn().mockResolvedValueOnce(mockAccount) });
    Transaction.create = jest.fn().mockResolvedValueOnce(mockTransaction);

    await creditAccountController(req as Request, res as Response);

    expect(mockAccount.save).toHaveBeenCalled();
    expect(Transaction.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          account: accountId,
          type: TransactionType.credit,
          amount: creditAmount,
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

    await creditAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Account not found',
      })
    );
  });

  it('should handle errors and abort transaction', async () => {
    Account.findById = jest
      .fn()
      .mockReturnValueOnce({ session: jest.fn().mockRejectedValueOnce(new Error('Database error')) });

    await expect(creditAccountController(req as Request, res as Response)).rejects.toThrow('Database error');
  });
});
