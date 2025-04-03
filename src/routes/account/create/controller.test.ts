import type { Request, Response } from 'express';
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
    Account.create = jest.fn().mockResolvedValueOnce(req.body);

    await createAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Account',
      })
    );
  });
});
