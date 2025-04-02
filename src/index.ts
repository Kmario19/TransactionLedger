import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import apiRoutes from '@/routes';
import { connectDB } from '@/config/database';
import errorHandler from '@/middleware/errorHandler';

dotenv.config();

export const app = express();
const PORT = +(process.env.PORT || '3000');

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Graceful shutdown function
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} signal received: closing HTTP server`);

  try {
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Handle server errors
  server.on('error', (error: Error) => {
    console.error('Server error:', error);
    gracefulShutdown('Server error');
  });
}
