import { z } from 'zod';

export default {
  body: z.object({
    name: z.string().trim().min(1).max(255),
  }),
};
