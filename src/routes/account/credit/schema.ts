import mongoose from 'mongoose';
import { z } from 'zod';

export default {
  params: z.object({
    accountId: z.string().refine(val => {
      return mongoose.Types.ObjectId.isValid(val);
    }),
  }),
  body: z.object({
    date: z
      .string()
      .date()
      .refine(date => {
        const today = new Date();
        const inputDate = new Date(date);
        return inputDate <= today;
      }),
    amount: z.number().positive(),
  }),
};
