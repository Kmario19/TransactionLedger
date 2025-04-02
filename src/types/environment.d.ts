declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      MONGODB_URI: string;
      TRANSACTION_DELETE_POLICY: 'cascade' | 'deny' | 'keep';
    }
  }
}

export {};
