import type { Request, Response } from 'express';
import listAccountsController from './controller';
import { Account } from '@/models/Account';

describe('listAccountsController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockFind: jest.Mock;
  let mockSort: jest.Mock;
  let mockSkip: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    req = { query: {} };
    res = {
      json: jest.fn(),
    };

    // Setup mock chaining
    mockLimit = jest.fn().mockResolvedValue([
      { _id: '1', name: 'Account 1', balance: 100 },
      { _id: '2', name: 'Account 2', balance: 200 },
    ]);
    mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
    mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
    mockFind = jest.fn().mockReturnValue({ sort: mockSort });

    Account.find = mockFind;
    Account.countDocuments = jest.fn().mockResolvedValue(2);
  });

  it('should return accounts with default pagination', async () => {
    await listAccountsController(req as Request, res as Response);

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mockSkip).toHaveBeenCalledWith(0);
    expect(mockLimit).toHaveBeenCalledWith(10);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        docs: expect.any(Array),
        pageInfo: expect.objectContaining({
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }),
      })
    );
  });

  it('should apply filters from query params', async () => {
    req.query = {
      page: '2',
      limit: '5',
      search: 'test',
      minBalance: '50',
      maxBalance: '500',
      sortBy: 'balance',
      sortOrder: 'asc',
    };

    await listAccountsController(req as Request, res as Response);

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        name: { $regex: 'test', $options: 'i' },
        balance: { $gte: 50, $lte: 500 },
      })
    );
    expect(mockSort).toHaveBeenCalledWith({ balance: 1 });
    expect(mockSkip).toHaveBeenCalledWith(5);
    expect(mockLimit).toHaveBeenCalledWith(5);
  });
});
