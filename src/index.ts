import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

export const app = express();
const PORT = Number.parseInt(process.env.PORT || '3000', 10);

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Set port
app.set('port', PORT);

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
