import type { Request, Response } from 'express';
import { Account } from '@/models/Account';
import { StatusCodes } from 'http-status-codes';

export default async function editAccountController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const account = await Account.findById(id);
    if (!account) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: 'Account not found',
      });
      return;
    }

    account.name = name;
    await account.save();

    res.json({
      message: 'Account updated successfully',
      account,
    });
  } catch (error) {
    // TODO: Test this error handling
    if ((error as { code: number }).code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        error: 'Account name already exists',
      });
      return;
    }
    throw error;
  }
}
