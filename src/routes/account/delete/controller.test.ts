import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';
import { Transaction } from '@/models/Transaction';
import deleteAccountController from './controller';

describe('deleteAccountController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  const oldEnv = process.env;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.TRANSACTION_DELETE_POLICY = 'deny';
  });

  afterEach(() => {
    process.env = oldEnv;
  });

  it('should delete the account and return 200 if no transactions exist', async () => {
    const accountId = '123';
    req.params = { accountId };

    Account.findById = jest.fn().mockResolvedValueOnce({
      _id: accountId,
      name: 'Test Account',
      balance: 100,
    });
    Transaction.exists = jest.fn().mockResolvedValueOnce(false);
    Account.findByIdAndDelete = jest.fn().mockResolvedValueOnce({
      _id: accountId,
      name: 'Test Account',
      balance: 100,
    });

    await deleteAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Account deleted successfully',
      })
    );
  });

  it('should return 404 if account is not found', async () => {
    req.params = { accountId: 'nonexistent' };

    Account.findById = jest.fn().mockResolvedValueOnce(null);

    await deleteAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Account not found',
      })
    );
  });

  it('should return 400 if account has existing transactions', async () => {
    const accountId = '123';
    req.params = { accountId };

    Account.findById = jest.fn().mockResolvedValueOnce({
      _id: accountId,
      name: 'Test Account',
      balance: 100,
    });
    Transaction.exists = jest.fn().mockResolvedValueOnce(true);

    await deleteAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Cannot delete account with existing transactions',
      })
    );
  });

  it('should delete transactions if TRANSACTION_DELETE_POLICY is set to "cascade"', async () => {
    const accountId = '123';
    req.params = { accountId };
    process.env.TRANSACTION_DELETE_POLICY = 'cascade';

    Account.findById = jest.fn().mockResolvedValueOnce({
      _id: accountId,
      name: 'Test Account',
      balance: 100,
    });
    Transaction.deleteMany = jest.fn().mockResolvedValueOnce({});

    await deleteAccountController(req as Request, res as Response);

    expect(Transaction.deleteMany).toHaveBeenCalledWith({ account: accountId });
  });

  it('should not delete transactions if TRANSACTION_DELETE_POLICY is set to "keep"', async () => {
    const accountId = '123';
    req.params = { accountId };
    process.env.TRANSACTION_DELETE_POLICY = 'keep';

    Account.findById = jest.fn().mockResolvedValueOnce({
      _id: accountId,
      name: 'Test Account',
      balance: 100,
    });
    Transaction.deleteMany = jest.fn();

    await deleteAccountController(req as Request, res as Response);

    expect(Transaction.deleteMany).not.toHaveBeenCalled();
  });

  it('should return 400 if TRANSACTION_DELETE_POLICY is invalid', async () => {
    const accountId = '123';
    req.params = { accountId };
    // @ts-ignore
    process.env.TRANSACTION_DELETE_POLICY = 'invalid_policy';

    Account.findById = jest.fn().mockResolvedValueOnce({
      _id: accountId,
      name: 'Test Account',
      balance: 100,
    });

    await deleteAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid transaction delete policy',
      })
    );
  });
});
