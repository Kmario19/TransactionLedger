import { z } from 'zod';

export default {
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    minBalance: z.coerce.number().optional(),
    maxBalance: z.coerce.number().optional(),
    sortBy: z.enum(['balance', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};
