import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/src/server/routers';
import { createContext } from '@/src/server/trpc';

// Handle all tRPC requests
const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: () => createContext(request),
    onError: ({ error, path }) => {
      console.error(`tRPC error on ${path}:`, error);
    },
  });
};

export { handler as GET, handler as POST };