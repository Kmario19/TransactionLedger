import { z } from 'zod';
import schema from './schema';

describe('Account delete schema', () => {
  it('should validate valid id parameter', () => {
    const validParams = { accountId: '64f0a2d8a513d3168b20edf3' };
    const parsed = schema.params.parse(validParams);
    expect(parsed).toEqual(validParams);
  });

  it('should fail with invalid id format', () => {
    const invalidParams = { id: 'invalid-id' };
    expect(() => schema.params.parse(invalidParams)).toThrow(z.ZodError);
  });

  it('should fail when id is missing', () => {
    const invalidParams = {};
    expect(() => schema.params.parse(invalidParams)).toThrow(z.ZodError);
  });
});
