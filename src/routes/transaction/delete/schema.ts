import { z } from 'zod';
import mongoose from 'mongoose';

export default {
  params: z.object({
    transactionId: z.string().refine(val => {
      return mongoose.Types.ObjectId.isValid(val);
    }),
  }),
};
