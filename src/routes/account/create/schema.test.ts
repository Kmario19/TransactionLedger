import { z } from 'zod';
import schema from './schema';

describe('Account create schema', () => {
  it('should succeed with valid data', () => {
    const validData = { name: 'Test Account' };
    const parsed = schema.body.parse(validData);
    expect(parsed).toEqual(validData);
  });

  it('should trim whitespace from the name', () => {
    const validData = { name: '  Test Account   ' };
    const parsed = schema.body.parse(validData);
    expect(parsed).toEqual({ name: 'Test Account' });
  });

  it('should fail when name is empty or only whitespace', () => {
    const invalidData = { name: '   ' };
    expect(() => schema.body.parse(invalidData)).toThrow(z.ZodError);
  });

  it('should fail when name exceeds 255 characters', () => {
    const longName = 'a'.repeat(256);
    const invalidData = { name: longName };
    expect(() => schema.body.parse(invalidData)).toThrow(z.ZodError);
  });

  it('should fail when name is not a string', () => {
    const invalidData = { name: 123 };
    expect(() => schema.body.parse(invalidData)).toThrow(z.ZodError);
  });
});
