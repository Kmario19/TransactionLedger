import type { Request, Response } from 'express';
import editAccountController from './controller';
import { Account } from '@/models/Account';
import { StatusCodes } from 'http-status-codes';

describe('editAccountController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should update the account name and return 200 status', async () => {
    const accountId = '123';
    req.params = { id: accountId };
    req.body = { name: 'Updated Account' };

    Account.findById = jest.fn().mockResolvedValueOnce({
      _id: accountId,
      name: 'Old Account',
      balance: 100,
      save: jest.fn().mockResolvedValueOnce({
        _id: accountId,
        name: 'Updated Account',
        balance: 100,
      }),
    });

    await editAccountController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({
          name: 'Updated Account',
        }),
      })
    );
  });

  it('should return 404 if account is not found', async () => {
    req.params = { id: 'nonexistent' };
    req.body = { name: 'New Name' };

    Account.findById = jest.fn().mockResolvedValueOnce(null);

    await editAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Account not found',
      })
    );
  });

  it('should return 409 if account name already exists', async () => {
    req.params = { id: '123' };
    req.body = { name: 'Existing Account' };

    Account.findById = jest.fn().mockResolvedValueOnce({
      _id: '123',
      name: 'Old Account',
      balance: 100,
      save: jest.fn().mockRejectedValueOnce({
        code: 11000,
      }),
    });

    await editAccountController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Account name already exists',
      })
    );
  });

  it('should throw an error if an unexpected error occurs', async () => {
    req.params = { id: '123' };
    req.body = { name: 'New Name' };

    Account.findById = jest.fn().mockResolvedValueOnce({
      _id: '123',
      name: 'Old Account',
      balance: 100,
      save: jest.fn().mockRejectedValueOnce(new Error('Unexpected error')),
    });

    await expect(editAccountController(req as Request, res as Response)).rejects.toThrow('Unexpected error');
  });
});
