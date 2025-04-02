import type { Request, Response } from 'express';
import { Account } from '@/models/Account';
import type { FilterQuery } from 'mongoose';
import type { IAccount } from '@/models/Account';

export default async function listAccountsController(req: Request, res: Response) {
  const { page = 1, limit = 10, search, minBalance, maxBalance, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const filter: FilterQuery<IAccount> = {};

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  if (minBalance !== undefined || maxBalance !== undefined) {
    filter.balance = {};
    if (minBalance !== undefined) {
      filter.balance.$gte = Number(minBalance);
    }
    if (maxBalance !== undefined) {
      filter.balance.$lte = Number(maxBalance);
    }
  }

  const skip = (Number(page) - 1) * Number(limit);

  const sort: Record<string, 1 | -1> = {
    [sortBy as string]: sortOrder === 'asc' ? 1 : -1,
  };

  const [accounts, total] = await Promise.all([
    Account.find(filter).sort(sort).skip(skip).limit(Number(limit)),
    Account.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = Number(page) < totalPages;
  const hasPrevPage = Number(page) > 1;

  res.json({
    docs: accounts,
    pageInfo: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  });
}
