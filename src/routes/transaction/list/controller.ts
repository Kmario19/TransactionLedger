import { Transaction } from '@/models/Transaction';
import type { ITransaction } from '@/models/Transaction';
import type { Request, Response } from 'express';
import type { FilterQuery } from 'mongoose';

const listTransactionController = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    accountId,
    type,
    sortBy = 'date',
    sortOrder = 'desc',
    minAmount,
    maxAmount,
    minCost,
    maxCost,
  } = req.query;

  const filter: FilterQuery<ITransaction> = {};

  if (accountId) {
    filter.account = accountId;
  }

  if (type) {
    filter.type = type;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = new Date(startDate as string);
    }
    if (endDate) {
      filter.date.$lte = new Date(endDate as string);
    }
  }

  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) {
      filter.amount.$gte = Number(minAmount);
    }
    if (maxAmount) {
      filter.amount.$lte = Number(maxAmount);
    }
  }

  if (minCost || maxCost) {
    filter.cost = {};
    if (minCost) {
      filter.cost.$gte = Number(minCost);
    }
    if (maxCost) {
      filter.cost.$lte = Number(maxCost);
    }
  }

  const sort: Record<string, 1 | -1> = {
    [sortBy as string]: sortOrder === 'asc' ? 1 : -1,
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort(sort).skip(skip).limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = Number(page) < totalPages;
  const hasPrevPage = Number(page) > 1;

  res.json({
    docs: transactions,
    pageInfo: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  });
};

export default listTransactionController;
