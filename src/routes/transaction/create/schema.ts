import mongoose from 'mongoose';
import { z } from 'zod';

export default {
  body: z
    .object({
      type: z.enum(['debit', 'credit']),
      date: z.string().date(), // ISO date format (YYYY-MM-DD)
      amount: z.number().positive().optional(),
      cost: z.number().positive().optional(),
      description: z.string().max(255),
      accountId: z
        .string()
        .refine(val => {
          return mongoose.Types.ObjectId.isValid(val);
        })
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === 'debit' && data.cost === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `'cost' is required for debit transactions`,
        });
      }
      if (data.type === 'credit' && data.amount === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `'amount' is required for credit transactions`,
        });
      }
    }),
};
