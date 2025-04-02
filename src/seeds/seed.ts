import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { type ITransaction, Transaction } from '@/models/Transaction';

dotenv.config();

const generateRandomTransactions = (count: number) => {
  const categories = ['Income', 'Expenses', 'Transportation', 'Food', 'Entertainment'];
  const accounts = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
  const transactions: ITransaction[] = [];

  for (let i = 0; i < count; i++) {
    const transaction = {
      type: Math.random() > 0.5 ? 'debit' : 'credit',
      date: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)),
      description: categories[Math.floor(Math.random() * categories.length)],
      account: accounts[Math.floor(Math.random() * accounts.length)],
    } as ITransaction;

    const randomValue = Math.floor(Math.random() * 10000) + 1;

    transaction[transaction.type === 'debit' ? 'cost' : 'amount'] = randomValue;

    transactions.push(transaction);
  }

  return transactions;
};

async function seedDevDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.error('This script should not be run in production!');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    await Transaction.deleteMany({});
    console.log('Cleared existing transactions');

    const transactions = await Transaction.insertMany(generateRandomTransactions(50));
    console.log(`Seeded ${transactions.length} random transactions`);

    await mongoose.disconnect();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDevDatabase();
