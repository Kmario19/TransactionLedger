import mongoose, { type Document } from 'mongoose';
import type { IAccount } from './Account';

export enum TransactionType {
  debit = 'debit',
  credit = 'credit',
}

export interface ITransaction extends Document {
  type: TransactionType;
  date: Date;
  amount?: number;
  cost?: number;
  description?: string;
  account: IAccount['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    date: {
      type: Date,
      required: true,
      get: (value: Date) => value.toISOString().split('T')[0],
    },
    amount: {
      type: Number,
      required: function (this: ITransaction) {
        return this.type === TransactionType.credit;
      },
    },
    cost: {
      type: Number,
      required: function (this: ITransaction) {
        return this.type === TransactionType.debit;
      },
    },
    description: {
      type: String,
      maxlength: 255,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

transactionSchema.index({ type: 1, account: 1, date: -1 });
transactionSchema.index({ type: 1, cost: 1, amount: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
