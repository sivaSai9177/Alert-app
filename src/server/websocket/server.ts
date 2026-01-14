/**
 * WebSocket Server
 * Handles WebSocket connections for tRPC subscriptions
 */

import { WebSocketServer } from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter } from '../routers';
import { createContext } from '../trpc';
import { connectionManager } from './connection-manager';
import { log } from '@/lib/core/logger';
import { realtimeEvents } from '../services/realtime-events';
import { auth } from '@/lib/auth/auth';
import crypto from 'crypto';
import net from 'net';

// Use global variables to persist across hot reloads
const getGlobalWss = (): WebSocketServer | null => {
  return (global as any).__wss || null;
};

const setGlobalWss = (server: WebSocketServer | null): void => {
  (global as any).__wss = server;
};

const getGlobalHandler = (): ReturnType<typeof applyWSSHandler> | null => {
  return (global as any).__wsHandler || null;
};

const setGlobalHandler = (h: ReturnType<typeof applyWSSHandler> | null): void => {
  (global as any).__wsHandler = h;
};

let wss: WebSocketServer | null = null;
let handler: ReturnType<typeof applyWSSHandler> | null = null;

export interface WebSocketContext {
  connectionId: string;
  ws: WebSocket;
}

/**
 * Check if a port is available
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        tester
          .once('close', () => resolve(true))
          .close();
      })
      .listen(port);
  });
}

export async function createWebSocketServer(port: number = 3001): Promise<{ wss: WebSocketServer; handler: ReturnType<typeof applyWSSHandler> }> {
  // Check global instances first
  wss = getGlobalWss();
  handler = getGlobalHandler();
  
  if (wss && handler) {
    log.warn('WebSocket server already initialized (from global)', 'WS_SERVER');
    return { wss, handler };
  }

  // Check if port is available first
  const portAvailable = await isPortAvailable(port);
  if (!portAvailable) {
    log.warn('WebSocket port is already in use', 'WS_SERVER', { port });
    throw new Error(`Port ${port} is already in use`);
  }

  return new Promise((resolve, reject) => {
    try {
      const server = new WebSocketServer({
        port,
        perMessageDeflate: false,
      });

      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          log.warn('WebSocket port already in use', 'WS_SERVER', { port });
          wss = null;
          reject(new Error(`Port ${port} is already in use`));
        } else {
          log.error('WebSocket server error', 'WS_SERVER', error);
          reject(error);
        }
      });

      server.on('listening', () => {
        log.info('WebSocket server listening', 'WS_SERVER', { port });
        wss = server;
        setGlobalWss(server);

        // Apply tRPC WebSocket handler
        handler = applyWSSHandler({
          wss,
          router: appRouter,
          createContext: async (opts) => {
            const { req } = opts;
            const connectionId = crypto.randomUUID();
            
            // Extract auth token from query params or headers
            const url = new URL(req.url || '', `http://localhost:${port}`);
            const token = url.searchParams.get('token') || 
                         req.headers.authorization?.replace('Bearer ', '');
            
            // Create base context
            let baseContext: Awaited<ReturnType<typeof createContext>>;
            try {
              // Create headers object
              const headers = new Headers();
              if (token) {
                headers.set('authorization', `Bearer ${token}`);
              }
              if (req.headers.cookie) {
                headers.set('cookie', req.headers.cookie);
              }
              
              // Create a mock Request object for auth
              const mockRequest = new Request(`http://localhost:${port}${req.url}`, {
                headers,
              });
              
              baseContext = await createContext(mockRequest);
            } catch (error) {
              log.error('Failed to create WebSocket context', 'WS_SERVER', error);
              throw error;
            }
            
            // Add WebSocket-specific context
            const wsContext = {
              connectionId,
              ws: (opts as any).ws, // Cast as ws is added by the WebSocket adapter
            };
            
            return {
              ...baseContext,
              ...wsContext,
              isWebSocket: true,
            };
          },
          onError: ({ error, type, path, input, ctx }) => {
            log.error('WebSocket tRPC error', 'WS_TRPC', {
              error: error.message,
              type,
              path,
              input,
              connectionId: (ctx as any)?.connectionId,
            });
          },
        });
        
        setGlobalHandler(handler);

        // Handle WebSocket connection lifecycle
        wss.on('connection', async (ws, req) => {
          const connectionId = crypto.randomUUID();
          const url = new URL(req.url || '', `http://localhost:${port}`);
          const token = url.searchParams.get('token') || 
                       req.headers.authorization?.replace('Bearer ', '');
          
          // Authenticate connection
          let user = null;
          let session = null;
          
          if (token) {
            try {
              // Get session from token
              const headers = new Headers();
              headers.set('authorization', `Bearer ${token}`);
              
              session = await auth.api.getSession({
                headers,
              });
              
              if (session?.session && session.user) {
                user = session.user;
              }
            } catch (error) {
              log.error('WebSocket authentication failed', 'WS_SERVER', {
                connectionId,
                error,
              });
            }
          }
          
          // Add connection to manager
          connectionManager.addConnection({
            id: connectionId,
            ws: ws as any,
            userId: user?.id,
            role: user?.role,
            hospitalId: user?.organizationId || 'hospital-1', // Default for now
            isAlive: true,
            createdAt: new Date(),
            lastActivity: new Date(),
          });
          
          // Send welcome message
          ws.send(JSON.stringify({
            type: 'connection',
            data: {
              connectionId,
              authenticated: !!user,
              userId: user?.id,
              role: user?.role,
            },
          }));
          
          // Handle pong for heartbeat
          ws.on('pong', () => {
            const connection = connectionManager.getConnection(connectionId);
            if (connection) {
              connection.isAlive = true;
              connectionManager.updateConnectionActivity(connectionId);
            }
          });
          
          // Handle close
          ws.on('close', () => {
            connectionManager.removeConnection(connectionId);
            log.info('WebSocket connection closed', 'WS_SERVER', { connectionId });
          });
          
          // Handle errors
          ws.on('error', (error) => {
            log.error('WebSocket error', 'WS_SERVER', {
              connectionId,
              error,
            });
          });
        });

        // Start heartbeat
        connectionManager.startHeartbeat();

        // Start mock data generator in development
        if (process.env.NODE_ENV === 'development') {
          realtimeEvents.startMockDataGenerator();
        }

        // Register signal handlers only once using global flag
        if (!(global as any).__wsSignalHandlersRegistered) {
          process.on('SIGTERM', () => {
            log.info('SIGTERM received in WebSocket server', 'WS_SERVER');
            shutdownWebSocketServer();
          });

          process.on('SIGINT', () => {
            log.info('SIGINT received in WebSocket server', 'WS_SERVER');
            shutdownWebSocketServer();
          });
          
          (global as any).__wsSignalHandlersRegistered = true;
        }

        log.info('WebSocket server started', 'WS_SERVER', { port });
        
        resolve({ wss, handler });
      });
    } catch (error) {
      log.error('Failed to create WebSocket server', 'WS_SERVER', error);
      reject(error);
    }
  });
}

export function shutdownWebSocketServer() {
  // Get instances from globals
  wss = wss || getGlobalWss();
  handler = handler || getGlobalHandler();
  
  if (handler) {
    handler.broadcastReconnectNotification();
  }
  
  connectionManager.closeAll();
  
  if (wss) {
    wss.close(() => {
      log.info('WebSocket server shut down', 'WS_SERVER');
    });
    wss = null;
    handler = null;
    setGlobalWss(null);
    setGlobalHandler(null);
  }
}

export function getWebSocketServer() {
  // Get from globals if not in local variables
  wss = wss || getGlobalWss();
  handler = handler || getGlobalHandler();
  return { wss, handler };
}