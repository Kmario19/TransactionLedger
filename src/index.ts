import mongoose from 'mongoose';

import { connectDB } from '@/config/database';
import loadEnvironment from '@/config/environment';

import app from './app';

loadEnvironment();

connectDB();

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

if (process.env.NODE_ENV !== 'test') {
  const PORT = +(process.env.PORT || '3000');

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (error: Error) => {
    console.error('Server error:', error);
    gracefulShutdown('Server error');
  });
}
