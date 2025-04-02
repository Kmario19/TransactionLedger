import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Transaction, TransactionType } from './Transaction';
import { Account, type IAccount } from './Account';

describe('Transaction Model', () => {
  let mongoServer: MongoMemoryServer;
  let testAccount: IAccount;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    testAccount = await Account.create({
      name: 'Test Account',
      balance: 1000,
    });
  });

  afterEach(async () => {
    await Transaction.deleteMany({});
    await Account.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Validation', () => {
    it('should create a valid credit transaction', async () => {
      const transaction = await Transaction.create({
        type: TransactionType.credit,
        date: new Date(),
        amount: 100,
        description: 'Test credit',
        account: testAccount._id,
      });

      expect(transaction.type).toBe(TransactionType.credit);
      expect(transaction.amount).toBe(100);
      expect(transaction.cost).toBeUndefined();
    });

    it('should create a valid debit transaction', async () => {
      const transaction = await Transaction.create({
        type: TransactionType.debit,
        date: new Date(),
        cost: 50,
        description: 'Test debit',
        account: testAccount._id,
      });

      expect(transaction.type).toBe(TransactionType.debit);
      expect(transaction.cost).toBe(50);
      expect(transaction.amount).toBeUndefined();
    });

    it('should fail when creating credit transaction without amount', async () => {
      await expect(
        Transaction.create({
          type: TransactionType.credit,
          date: new Date(),
          account: testAccount._id,
        })
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail when creating debit transaction without cost', async () => {
      await expect(
        Transaction.create({
          type: TransactionType.debit,
          date: new Date(),
          account: testAccount._id,
        })
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });

  describe('Date Handling', () => {
    it('should format date correctly using getter', async () => {
      const testDate = new Date('2024-04-02');
      const transaction = await Transaction.create({
        type: TransactionType.credit,
        date: testDate,
        amount: 100,
        account: testAccount._id,
      });

      const formattedDate = transaction.date;
      expect(formattedDate).toBe('2024-04-02');
    });
  });

  describe('Field Validation', () => {
    it('should enforce maximum length for description', async () => {
      const longDescription = 'a'.repeat(256);
      await expect(
        Transaction.create({
          type: TransactionType.credit,
          date: new Date(),
          amount: 100,
          description: longDescription,
          account: testAccount._id,
        })
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should only allow valid transaction types', async () => {
      await expect(
        Transaction.create({
          type: 'invalid',
          date: new Date(),
          amount: 100,
          account: testAccount._id,
        })
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });
});
