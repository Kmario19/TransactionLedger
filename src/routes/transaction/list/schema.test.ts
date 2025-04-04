import { z } from 'zod';
import schema from './schema';

describe('Transaction list schema', () => {
  it('should use default values when not provided', () => {
    const parsed = schema.query.parse({});
    expect(parsed).toEqual({
      page: 1,
      limit: 10,
      sortBy: 'date',
      sortOrder: 'desc',
    });
  });

  it('should validate valid query parameters', () => {
    const validQuery = {
      page: '2',
      limit: '20',
      sortBy: 'amount',
      sortOrder: 'asc',
    };

    const parsed = schema.query.parse(validQuery);

    expect(parsed).toEqual({
      page: 2,
      limit: 20,
      sortBy: 'amount',
      sortOrder: 'asc',
    });
  });

  it('should fail with invalid page number', () => {
    const invalidQuery = { page: '0' };
    expect(() => schema.query.parse(invalidQuery)).toThrow(z.ZodError);
  });

  it('should fail with invalid sortBy value', () => {
    const invalidQuery = { sortBy: 'invalid' };
    expect(() => schema.query.parse(invalidQuery)).toThrow(z.ZodError);
  });

  it('should fail with invalid sortOrder value', () => {
    const invalidQuery = { sortOrder: 'invalid' };
    expect(() => schema.query.parse(invalidQuery)).toThrow(z.ZodError);
  });

  it('should validate valid accountId', () => {
    const validQuery = { accountId: '67edcab2b45aa63502e054b9' };
    const parsed = schema.query.parse(validQuery);
    expect(parsed).toEqual(expect.objectContaining({ accountId: '67edcab2b45aa63502e054b9' }));
  });

  it('should fail with invalid accountId', () => {
    const invalidQuery = { accountId: '' };
    expect(() => schema.query.parse(invalidQuery)).toThrow(z.ZodError);
  });
});
