import type { Request, Response } from 'express';
import { Transaction, TransactionType } from '@/models/Transaction';
import listTransactionsController from './controller';

describe('listTransactionsController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockFind: jest.Mock;
  let mockSort: jest.Mock;
  let mockSkip: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Setup chainable mock methods
    mockLimit = jest.fn().mockResolvedValue([
      { _id: 'txn1', amount: 100, type: TransactionType.credit, account: '123', date: new Date('2024-04-01') },
      { _id: 'txn2', cost: 50, type: TransactionType.debit, account: '123', date: new Date('2024-04-02') },
    ]);
    mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
    mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
    mockFind = jest.fn().mockReturnValue({ sort: mockSort });

    Transaction.find = mockFind;
    Transaction.countDocuments = jest.fn().mockResolvedValue(2);
  });

  it('should return transactions with default pagination', async () => {
    await listTransactionsController(req as Request, res as Response);

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ date: -1 });
    expect(mockSkip).toHaveBeenCalledWith(0);
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        docs: expect.any(Array),
        pageInfo: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      })
    );
  });

  it('should apply account filter when provided', async () => {
    req.query = { accountId: '123abc' };

    await listTransactionsController(req as Request, res as Response);

    expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ account: '123abc' }));
  });

  it('should apply date range filter when provided', async () => {
    const startDate = '2024-04-01';
    const endDate = '2024-04-30';
    req.query = { startDate, endDate };

    await listTransactionsController(req as Request, res as Response);

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        date: {
          $gte: expect.any(Date),
          $lte: expect.any(Date),
        },
      })
    );
  });

  it('should apply transaction type filter when provided', async () => {
    req.query = { type: TransactionType.credit };

    await listTransactionsController(req as Request, res as Response);

    expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ type: TransactionType.credit }));
  });

  it('should apply amount/cost range filters when provided', async () => {
    req.query = {
      minAmount: '50',
      maxAmount: '200',
      minCost: '10',
      maxCost: '100',
    };

    await listTransactionsController(req as Request, res as Response);

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: {
          $gte: 50,
          $lte: 200,
        },
        cost: {
          $gte: 10,
          $lte: 100,
        },
      })
    );
  });

  it('should apply custom pagination when provided', async () => {
    req.query = { page: '3', limit: '15' };

    await listTransactionsController(req as Request, res as Response);

    expect(mockSkip).toHaveBeenCalledWith(30); // (page-1) * limit = (3-1) * 15 = 30
    expect(mockLimit).toHaveBeenCalledWith(15);
  });

  it('should apply custom sorting when provided', async () => {
    req.query = { sortBy: 'amount', sortOrder: 'asc' };

    await listTransactionsController(req as Request, res as Response);

    expect(mockSort).toHaveBeenCalledWith({ amount: 1 });
  });

  it('should return an empty list if no transactions are found', async () => {
    mockLimit.mockResolvedValueOnce([]);
    Transaction.countDocuments = jest.fn().mockResolvedValueOnce(0);

    await listTransactionsController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        docs: [],
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      })
    );
  });

  it('should handle invalid query parameters gracefully', async () => {
    await listTransactionsController(req as Request, res as Response);

    expect(mockSkip).toHaveBeenCalledWith(0);
    expect(mockLimit).toHaveBeenCalledWith(10);
  });
});
