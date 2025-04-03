import { z } from 'zod';
import schema from './schema';

describe('Transaction Create Schema', () => {
  const { body } = schema;

  it('should validate a valid debit transaction', () => {
    const validDebit = {
      type: 'debit',
      date: '2023-01-01',
      cost: 100,
      description: 'Test debit transaction',
    };
    expect(() => body.parse(validDebit)).not.toThrow(z.ZodError);
  });

  it('should validate a valid credit transaction', () => {
    const validCredit = {
      type: 'credit',
      date: '2023-01-01',
      amount: 50,
      description: 'Test credit transaction',
    };
    expect(() => body.parse(validCredit)).not.toThrow(z.ZodError);
  });

  it('should throw an error if cost is missing for debit transaction', () => {
    const invalidDebit = {
      type: 'debit',
      date: '2023-01-01',
      description: 'Invalid debit transaction',
    };
    expect(() => body.parse(invalidDebit)).toThrow("'cost' is required for debit transactions");
  });

  it('should throw an error if amount is missing for credit transaction', () => {
    const invalidCredit = {
      type: 'credit',
      date: '2023-01-01',
      description: 'Invalid credit transaction',
    };
    expect(() => body.parse(invalidCredit)).toThrow("'amount' is required for credit transactions");
  });

  it('should throw an error if date is not in ISO format', () => {
    const invalidDate = {
      type: 'debit',
      date: '01-01-2023',
      amount: 100,
      description: 'Invalid date format',
    };
    expect(() => body.parse(invalidDate)).toThrow(z.ZodError);
  });

  it('should throw an error if description exceeds 255 characters', () => {
    const longDescription = {
      type: 'credit',
      date: '2023-01-01',
      cost: 50,
      description: 'a'.repeat(256),
    };
    expect(() => body.parse(longDescription)).toThrow();
  });

  it('should throw an error if accountId is not a valid UUID', () => {
    const invalidAccountId = {
      type: 'debit',
      date: '2023-01-01',
      amount: 100,
      description: 'Invalid accountId',
      accountId: 'not-a-uuid',
    };
    expect(() => body.parse(invalidAccountId)).toThrow(z.ZodError);
  });
});
