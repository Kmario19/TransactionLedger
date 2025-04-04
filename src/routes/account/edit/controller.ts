import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Account } from '@/models/Account';

export default async function editAccountController(req: Request, res: Response) {
  const { accountId } = req.params;
  const { name } = req.body;

  const account = await Account.findById(accountId);
  if (!account) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: 'Account not found',
    });
    return;
  }

  const existingAccount = await Account.findOne({ name, _id: { $ne: accountId } });
  if (existingAccount) {
    res.status(StatusCodes.CONFLICT).json({
      error: 'Account name already exists',
    });
    return;
  }

  account.name = name;
  await account.save();

  res.json({
    message: 'Account updated successfully',
    account,
  });
}
