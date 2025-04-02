import express from 'express';
import apiRoutes from '@/routes';
import errorHandler from '@/middleware/errorHandler';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
