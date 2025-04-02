import schema from './schema';
import { z } from 'zod';

describe('Account credit schema', () => {
  it('should validate valid parameters', () => {
    const validParams = { accountId: '64f0a2d8a513d3168b20edf3' };
    const validBody = { amount: 500, date: '2023-10-01' };

    const parsedParams = schema.params.parse(validParams);
    const parsedBody = schema.body.parse(validBody);

    expect(parsedParams).toEqual(validParams);
    expect(parsedBody).toEqual(validBody);
  });

  it('should fail with invalid id format', () => {
    const invalidParams = { id: 'invalid-id' };
    expect(() => schema.params.parse(invalidParams)).toThrow(z.ZodError);
  });

  it('should fail with negative amount', () => {
    const invalidBody = { amount: -100 };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });

  it('should fail with zero amount', () => {
    const invalidBody = { amount: 0 };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });

  it('should fail with missing amount', () => {
    const invalidBody = { description: 'Missing amount' };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });

  it('should fail with non-numeric amount', () => {
    const invalidBody = { amount: 'not-a-number' };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });
});
