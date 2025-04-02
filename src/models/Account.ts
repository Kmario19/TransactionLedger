import mongoose, { type Document } from 'mongoose';

export interface IAccount extends Document {
  name: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

accountSchema.pre<IAccount>('save', function (next) {
  if (this.balance < 0) {
    return next(new Error('Balance cannot be negative'));
  }
  next();
});

export const Account = mongoose.model<IAccount>('Account', accountSchema);
