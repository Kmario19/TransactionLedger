import schema from './schema';
import { z } from 'zod';

describe('Account edit schema', () => {
  it('should validate valid parameters and body', () => {
    const validParams = { accountId: '64f0a2d8a513d3168b20edf3' };
    const validBody = { name: 'Updated Account' };

    const parsedParams = schema.params.parse(validParams);
    const parsedBody = schema.body.parse(validBody);

    expect(parsedParams).toEqual(validParams);
    expect(parsedBody).toEqual(validBody);
  });

  it('should fail with invalid id format', () => {
    const invalidParams = { id: 'invalid-id' };
    expect(() => schema.params.parse(invalidParams)).toThrow(z.ZodError);
  });

  it('should trim whitespace from name', () => {
    const body = { name: '  Updated Account  ' };
    const parsed = schema.body.parse(body);
    expect(parsed).toEqual({ name: 'Updated Account' });
  });

  it('should fail when name is too short', () => {
    const invalidBody = { name: '' };
    expect(() => schema.body.parse(invalidBody)).toThrow(z.ZodError);
  });

  it('should fail when name is too long', () => {
    const longName = 'a'.repeat(256);
    expect(() => schema.body.parse({ name: longName })).toThrow(z.ZodError);
  });
});
