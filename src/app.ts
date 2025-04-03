import express from 'express';
import apiRoutes from '@/routes';
import errorHandler from '@/middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './../swagger.json';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api', apiRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use(errorHandler);

export default app;
