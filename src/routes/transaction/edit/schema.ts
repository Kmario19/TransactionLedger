import { z } from 'zod';
import mongoose from 'mongoose';

export default {
  params: z.object({
    transactionId: z.string().refine(val => {
      return mongoose.Types.ObjectId.isValid(val);
    }),
  }),
  body: z
    .object({
      date: z.string().date().optional(),
      amount: z.number().positive().optional(),
      cost: z.number().positive().optional(),
    })
    .refine(
      data => {
        return Object.keys(data).length > 0;
      },
      { message: 'At least one field must be provided' }
    ),
};
