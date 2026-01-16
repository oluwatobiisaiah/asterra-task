import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';
import dotenv from 'dotenv';
import { appRouter } from './routers/index';
import { testConnection } from './db/index';

dotenv.config();

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext: async () => {
    // Ensure database connection for each Lambda invocation
    await testConnection();
    return {};
  },
});