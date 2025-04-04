import express from 'express';
import apiKeyValidator from '@/middleware/apiKeyValidator';
import accountRoutes from './account';
import transactionRoutes from './transaction';

const app = express();

app.use(apiKeyValidator);
app.use('/transactions', transactionRoutes);
app.use('/accounts', accountRoutes);

export default app;
