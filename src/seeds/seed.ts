import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '@/config/database';
import { type ITransaction, Transaction, TransactionType } from '@/models/Transaction';
import { type IAccount, Account } from '@/models/Account';

dotenv.config();

const generateRandomAccounts = (count: number) => {
  const accounts: IAccount[] = [];
  for (let i = 0; i < count; i++) {
    accounts.push({
      name: `Account ${i + 1}`,
    } as IAccount);
  }
  return accounts;
};

const generateRandomTransactions = (count: number, accounts: IAccount[]) => {
  const categories = ['Income', 'Expenses', 'Transportation', 'Food', 'Entertainment'];
  const accountBalances = new Map<string, number>();
  const transactions: ITransaction[] = [];

  for (let i = 0; i < count; i++) {
    const selectedAccount = accounts[Math.floor(Math.random() * accounts.length)];
    const accountId = selectedAccount.id.toString();
    const currentBalance = accountBalances.get(accountId) || 0;

    const randomValue = Math.floor(Math.random() * 10000) + 1;
    let transactionType = Math.random() > 0.5 ? TransactionType.debit : TransactionType.credit;

    // If debit would make balance negative, make it a credit instead
    if (transactionType === TransactionType.debit && currentBalance - randomValue < 0) {
      transactionType = TransactionType.credit;
    }

    const balanceChange = transactionType === TransactionType.credit ? randomValue : -randomValue;
    accountBalances.set(accountId, currentBalance + balanceChange);

    const transaction = {
      type: transactionType,
      date: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)),
      description: `${categories[Math.floor(Math.random() * categories.length)]} transaction`,
      account: selectedAccount.id,
      [transactionType === TransactionType.debit ? 'cost' : 'amount']: randomValue,
    } as ITransaction;

    transactions.push(transaction);
  }

  return { transactions, accountBalances };
};

async function seedDevDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.error('This script should not be run in production!');
    process.exit(1);
  }

  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    await Account.deleteMany({});
    console.log('Cleared existing accounts');

    const accounts = await Account.insertMany(generateRandomAccounts(10));
    console.log(`Seeded ${accounts.length} random accounts`);

    await Transaction.deleteMany({});
    console.log('Cleared existing transactions');

    const { transactions, accountBalances } = generateRandomTransactions(50, accounts);
    await Transaction.insertMany(transactions);
    console.log(`Seeded ${transactions.length} random transactions`);

    const updatePromises = Array.from(accountBalances.entries()).map(([accountId, balance]) =>
      Account.findByIdAndUpdate(accountId, { balance })
    );
    await Promise.all(updatePromises);
    console.log('Updated account balances');

    await session.commitTransaction();
    await mongoose.disconnect();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    await session.abortTransaction();
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    session.endSession();
  }
}

seedDevDatabase();
