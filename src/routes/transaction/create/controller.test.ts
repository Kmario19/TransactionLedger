import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Transaction } from '@/models/Transaction';
import createTransactionController from './controller';

describe('createTransactionController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should create a transaction and return it with status 201', async () => {
    const mockTransaction = { id: 1, amount: 100, description: 'Test transaction' };
    Transaction.create = jest.fn().mockResolvedValue(mockTransaction);

    req.body = { amount: 100, description: 'Test transaction' };

    await createTransactionController(req as Request, res as Response);

    expect(Transaction.create).toHaveBeenCalledWith({ amount: 100, description: 'Test transaction' });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith(mockTransaction);
  });
});
