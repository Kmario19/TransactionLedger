import schema from './schema';
import { z } from 'zod';

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
});
