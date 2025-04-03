import type { Request, Response, NextFunction } from 'express';

const apiKeyValidator = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('x-api-key');

  if (!process.env.API_KEYS) {
    res.status(500).json({ error: 'API keys are not configured.' });
    return;
  }

  const allowedKeys = process.env.API_KEYS.split(',');

  if (!apiKey || !allowedKeys.includes(apiKey)) {
    res.status(401).json({ error: 'Unauthorized: Invalid API key.' });
    return;
  }

  next();
};

export default apiKeyValidator;
