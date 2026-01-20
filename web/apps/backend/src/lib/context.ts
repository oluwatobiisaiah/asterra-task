import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export const createContext = ({ req, res }: CreateExpressContextOptions): {
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
  ip: string;
} => {
  // Get IP address (handles proxies like App Runner)
  const getIp = () => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
    }
    return req.socket.remoteAddress || 'unknown';
  };

  return {
    req,
    res,
    ip: getIp(),
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;