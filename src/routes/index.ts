import express from 'express';
import transactionRoutes from './transaction';
import accountRoutes from './account';
import apiKeyValidator from '@/middleware/apiKeyValidator';

const app = express();

app.use(apiKeyValidator);
app.use('/transactions', transactionRoutes);
app.use('/accounts', accountRoutes);

export default app;
