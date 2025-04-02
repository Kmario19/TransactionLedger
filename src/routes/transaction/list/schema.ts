import { z } from 'zod';

export default {
  query: z
    .object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      accountId: z.string().uuid().optional(),
      type: z.enum(['debit', 'credit']).optional(),
      sortBy: z.enum(['date', 'amount', 'cost']).default('date'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      minAmount: z.coerce.number().optional(),
      maxAmount: z.coerce.number().optional(),
      minCost: z.coerce.number().optional(),
      maxCost: z.coerce.number().optional(),
    })
    .optional(),
};
