import { appRouter } from '@/src/server/routers';
import { createContext } from '@/src/server/trpc';
import { log } from '@/lib/core/logger';
import { createWebSocketServer } from '@/src/server/websocket/server';

// Initialize WebSocket server on first load
let wsInitialized = false;
if (!wsInitialized && process.env.EXPO_PUBLIC_ENABLE_WS === 'true') {
  try {
    const wsPort = parseInt(process.env.EXPO_PUBLIC_WS_PORT || '3001');
    createWebSocketServer(wsPort);
    wsInitialized = true;
    log.info('WebSocket server initialized from API handler', 'WS_API', { port: wsPort });
  } catch (error) {
    log.error('Failed to initialize WebSocket server', 'WS_API', error);
  }
}

// Simple health check handler
const handler = async (request: Request) => {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    websocket: wsInitialized ? 'running' : 'not started',
    port: process.env.EXPO_PUBLIC_WS_PORT || '3001'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export { handler as GET, handler as POST };