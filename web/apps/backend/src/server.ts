import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import dotenv from 'dotenv';
import { appRouter } from './routers/index';
import { testConnection } from './db/index';
import { createContext } from './lib/context';
import { getRateLimitStats } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
            if (allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin.includes('*')) {
          const regex = new RegExp(allowedOrigin.replace('*', '.*'));
          return regex.test(origin);
        }
        return origin === allowedOrigin;
      })) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    config: {
      allowedOrigins: allowedOrigins,
      port: PORT,
    }
  });
});

app.get('/stats/rate-limit', (_, res) => {
  if (process.env.NODE_ENV === 'production') {
     res.status(404).json({ error: 'Not found' });
  }
  res.json(getRateLimitStats());
});

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use((_, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _: express.Request, res: express.Response, __: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

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