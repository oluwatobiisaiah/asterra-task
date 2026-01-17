import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import dotenv from 'dotenv';
import { appRouter } from './routers/index';
import { testConnection } from './db/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _: express.Request, res: express.Response, __: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`tRPC endpoint: http://localhost:${PORT}/trpc`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();