import schema from './schema';
import { z } from 'zod';

describe('Account list schema', () => {
  it('should use default values when not provided', () => {
    const parsed = schema.query.parse({});
    expect(parsed).toEqual({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('should accept valid query parameters', () => {
    const validQuery = {
      page: '2',
      limit: '20',
      search: 'test',
      minBalance: '100',
      maxBalance: '500',
      sortBy: 'balance',
      sortOrder: 'asc',
    };

    const parsed = schema.query.parse(validQuery);

    expect(parsed).toEqual({
      page: 2,
      limit: 20,
      search: 'test',
      minBalance: 100,
      maxBalance: 500,
      sortBy: 'balance',
      sortOrder: 'asc',
    });
  });

  it('should fail when page is less than 1', () => {
    const invalidQuery = { page: '0' };
    expect(() => schema.query.parse(invalidQuery)).toThrow(z.ZodError);
  });

  it('should fail when limit exceeds maximum', () => {
    const invalidQuery = { limit: '101' };
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
