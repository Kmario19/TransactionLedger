import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Account } from './Account';

describe('Account Model', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Account.deleteMany({});
  });

  it('should create an account with valid data', async () => {
    const validAccount = {
      name: 'Test Account',
      balance: 1000,
    };

    const account = await Account.create(validAccount);
    expect(account.name).toBe(validAccount.name);
    expect(account.balance).toBe(validAccount.balance);
    expect(account.createdAt).toBeInstanceOf(Date);
    expect(account.updatedAt).toBeInstanceOf(Date);
  });

  it('should fail when creating account without required fields', async () => {
    const invalidAccount = {};

    await expect(Account.create(invalidAccount)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should prevent negative balance', async () => {
    const account = await Account.create({
      name: 'Test Account',
      balance: 100,
    });

    account.balance = -50;
    await expect(account.save()).rejects.toThrow('Balance cannot be negative');
  });

  it('should enforce unique account names', async () => {
    const accountData = {
      name: 'Duplicate Account',
      balance: 100,
    };

    await Account.create(accountData);
    await expect(Account.create(accountData)).rejects.toThrow(mongoose.mongo.MongoServerError);
  });

  it('should update timestamps on modification', async () => {
    const account = await Account.create({
      name: 'Test Account',
      balance: 100,
    });

    const originalUpdatedAt = account.updatedAt;
    await new Promise(resolve => setTimeout(resolve, 100));

    account.balance = 200;
    await account.save();

    expect(account.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
