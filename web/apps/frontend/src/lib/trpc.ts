import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/routers/index';
import SuperJSON from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    return 'http://localhost:4000'; // fallback url incase there is no impo
};

export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: `${getBaseUrl()}/trpc`,
            transformer: SuperJSON
        }),
    ],
});