import mongoose from 'mongoose';
import { z } from 'zod';

export default {
  params: z.object({
    accountId: z.string().refine(val => {
      return mongoose.Types.ObjectId.isValid(val);
    }),
  }),
};
