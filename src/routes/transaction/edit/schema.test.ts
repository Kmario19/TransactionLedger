import { z } from 'zod';
import schema from './schema';

describe('Transaction edit schema', () => {
  it('should validate valid input', () => {
    const validParams = { transactionId: '64f0a2d8a513d3168b20edf3' };
    const validBody = { amount: 200, date: '2023-10-01' };

    const parsedParams = schema.params.parse(validParams);
    const parsedBody = schema.body.parse(validBody);

    expect(parsedParams).toEqual(validParams);
    expect(parsedBody).toEqual(validBody);
  });

  it('should fail with invalid transaction ID', () => {
    const invalidParams = { transactionId: 'invalid-id' };
    expect(() => schema.params.parse(invalidParams)).toThrow(z.ZodError);
  });

  it('should fail with missing body', () => {
    const invalidBody = {};
    expect(() => schema.body.parse(invalidBody)).toThrow('At least one field must be provided');
  });

  it('should fail with negative amount', () => {
    const invalidBody = { amount: -200, date: '2023-10-01' };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });

  it('should fail with invalid date format', () => {
    const invalidBody = { amount: 200, date: 'invalid-date' };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });

  it('should fail with negative cost', () => {
    const invalidBody = { cost: -200, date: '2023-10-01' };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });
});
