import schema from './schema';
import { z } from 'zod';

describe('Transaction delete schema', () => {
  it('should validate valid transaction ID', () => {
    const validParams = { transactionId: '64f0a2d8a513d3168b20edf3' };

    const parsedParams = schema.params.parse(validParams);

    expect(parsedParams).toEqual(validParams);
  });

  it('should fail with invalid transaction ID', () => {
    const invalidParams = { transactionId: 'invalid-id' };
    expect(() => schema.params.parse(invalidParams)).toThrow(z.ZodError);
  });

  it('should fail with missing transaction ID', () => {
    const invalidParams = {};
    expect(() => schema.params.parse(invalidParams)).toThrow(z.ZodError);
  });
});
