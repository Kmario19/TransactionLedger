import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';
import createAccountController from './controller';

describe('createAccountController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should create a new account and return 201 status', async () => {
    req.body = { name: 'Test Account' };
    Account.findOne = jest.fn().mockResolvedValueOnce(null);
    Account.create = jest.fn().mockResolvedValueOnce(req.body);

    await createAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Account',
      })
    );
  });

  it('should return 409 if account with the same name already exists', async () => {
    req.body = { name: 'Existing Account' };
    Account.findOne = jest.fn().mockResolvedValueOnce({ name: 'Existing Account' });

    await createAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Account with this name already exists',
      })
    );
  });
});
