import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/src/server/routers';
import { createContext } from '@/src/server/trpc';
import { initializeBackgroundServices } from '@/src/server/services/server-startup';
import { log } from '@/lib/core/logger';

// Initialize background services on first load
// Use a global variable to prevent re-initialization across hot reloads
if (!(global as any).__servicesInitialized) {
  log.info('Initializing background services from tRPC handler', 'TRPC_API');
  initializeBackgroundServices();
  (global as any).__servicesInitialized = true;
} else {
  log.info('Background services already initialized', 'TRPC_API');
}

// Handle all tRPC requests with proper CORS
const handler = async (request: Request) => {
  const origin = request.headers.get('origin') || '*';
  
  // CORS headers - Fix origin when credentials mode is used
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin === '*' ? 'http://localhost:8081' : origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, x-trpc-source',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Check if this is a subscription request (SSE)
  const url = new URL(request.url);
  const path = url.pathname.split('/').pop();
  
  // Handle SSE subscription requests
  if (request.headers.get('accept')?.includes('text/event-stream')) {
    log.info('SSE subscription request', 'TRPC_SSE', { path });
    
    // Create a readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(`data: ${JSON.stringify({ connected: true })}\n\n`);
        
        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          controller.enqueue(`:heartbeat\n\n`);
        }, 30000);
        
        // Clean up on close
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          controller.close();
        });
      },
    });
    
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: () => createContext(request),
    onError: ({ error, path }) => {
      // Error logging handled by tRPC logger middleware
    },
  });

  // Add CORS headers to response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

export { handler as GET, handler as POST, handler as OPTIONS };