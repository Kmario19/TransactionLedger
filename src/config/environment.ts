import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export default () => {
  const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: z.string().url(),
    TRANSACTION_DELETE_POLICY: z.enum(['keep', 'cascade', 'deny']).default('keep'),
  });

  const env = envSchema.safeParse(process.env);

  if (!env.success) {
    throw new Error(`Environment variable validation error: ${JSON.stringify(env.error.format(), null, 2)}`);
  }
  return env.data;
};
