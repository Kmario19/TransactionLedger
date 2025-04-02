import express from 'express';
import transactionRoutes from './transaction';
import accountRoutes from './account';

const app = express();

app.use('/transactions', transactionRoutes);
app.use('/accounts', accountRoutes);

export default app;
