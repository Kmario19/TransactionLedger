import express from 'express';
import accountRoutes from './account';
import transactionRoutes from './transaction';

const app = express();

app.use('/transactions', transactionRoutes);
app.use('/accounts', accountRoutes);

export default app;
