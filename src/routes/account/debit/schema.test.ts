import schema from './schema';
import { z } from 'zod';

describe('Account debit schema', () => {
  it('should validate valid parameters', () => {
    const validParams = { accountId: '64f0a2d8a513d3168b20edf3' };
    const validBody = { cost: 300, date: '2025-04-02' };

    const parsedParams = schema.params.parse(validParams);
    const parsedBody = schema.body.parse(validBody);

    expect(parsedParams).toEqual(validParams);
    expect(parsedBody).toEqual(validBody);
  });

  it('should fail with invalid id format', () => {
    const invalidParams = { id: 'invalid-id' };
    expect(() => schema.params.parse(invalidParams)).toThrow(z.ZodError);
  });

  it('should fail with negative cost', () => {
    const invalidBody = { cost: -100 };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });

  it('should fail with zero cost', () => {
    const invalidBody = { cost: 0 };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });

  it('should fail with missing cost', () => {
    const invalidBody = { description: 'Missing cost' };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });

  it('should fail with non-numeric cost', () => {
    const invalidBody = { cost: 'not-a-number' };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });
});
