import mongoose from 'mongoose';
import { z } from 'zod';

export default {
  params: z.object({
    accountId: z.string().refine(val => {
      return mongoose.Types.ObjectId.isValid(val);
    }),
  }),
  body: z.object({
    name: z.string().trim().min(1).max(255),
  }),
};
