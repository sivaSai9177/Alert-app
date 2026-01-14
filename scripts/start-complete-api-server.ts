#!/usr/bin/env node

/**
 * Complete API Server for Expo Go Development
 * Handles all API routes: auth, tRPC, health, etc.
 */

import { createServer } from 'http';
import { parse } from 'url';
import { auth } from '../lib/auth/auth-server-only';
import { appRouter } from '../src/server/routers';
import { createContext } from '../src/server/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { initializeBackgroundServices } from '../src/server/services/server-startup';
import { log } from '../lib/core/logger-server';

const PORT = process.env.API_PORT || 3000;
const ENABLE_CORS = true;

// Initialize services once
if (!(global as any).__apiServicesInitialized) {
  log.info('Initializing API server background services', 'API_SERVER');
  initializeBackgroundServices();
  (global as any).__apiServicesInitialized = true;
}

// CORS headers for development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

async function handleRequest(req: any, res: any) {
  const parsedUrl = parse(req.url!, true);
  const pathname = parsedUrl.pathname || '';

  // Set CORS headers
  if (ENABLE_CORS) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  log.debug(`[API] ${req.method} ${pathname}`, 'API_SERVER');

  try {
    // Handle health check
    if (pathname === '/api/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.APP_ENV || 'local',
        server: 'standalone-api',
        services: {
          auth: 'ready',
          trpc: 'ready',
          websocket: process.env.EXPO_PUBLIC_ENABLE_WS === 'true' ? 'ready' : 'disabled'
        }
      }));
      return;
    }

    // Handle auth routes
    if (pathname.startsWith('/api/auth')) {
      const authRequest = new Request(`http://localhost:${PORT}${req.url}`, {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      });

      const response = await auth.handler(authRequest);
      
      // Copy response headers
      response.headers.forEach((value: string, key: string) => {
        res.setHeader(key, value);
      });
      
      res.statusCode = response.status;
      
      const body = await response.text();
      res.end(body);
      return;
    }

    // Handle tRPC routes
    if (pathname.startsWith('/api/trpc')) {
      // Create a proper Request object for tRPC
      const trpcRequest = new Request(`http://localhost:${PORT}${req.url}`, {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      });

      const response = await fetchRequestHandler({
        endpoint: '/api/trpc',
        req: trpcRequest,
        router: appRouter,
        createContext: () => createContext(trpcRequest),
        onError: ({ error, path }) => {
          log.error('tRPC error', 'API_SERVER', { path, error: error.message });
        },
      });

      // Copy response headers
      response.headers.forEach((value: string, key: string) => {
        res.setHeader(key, value);
      });

      res.statusCode = response.status;
      
      const body = await response.text();
      res.end(body);
      return;
    }

    // 404 for unknown routes
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found', path: pathname }));

  } catch (error) {
    log.error('API server error', 'API_SERVER', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
}

// Handle request body for POST/PUT requests
async function getRequestBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Create HTTP server
const server = createServer(async (req, res) => {
  // For POST/PUT requests, we need to handle the body
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const body = await getRequestBody(req);
      // Add body to request
      (req as any).body = body;
      (req as any).arrayBuffer = async () => body;
      (req as any).text = async () => body.toString();
      (req as any).json = async () => JSON.parse(body.toString());
    } catch (error) {
      log.error('Failed to parse request body', 'API_SERVER', error);
    }
  }

  await handleRequest(req, res);
});

// Start server
server.listen(PORT, () => {
  log.info(`✅ Complete API server running on http://localhost:${PORT}`, 'API_SERVER');
  log.info('Available endpoints:', 'API_SERVER', {
    health: `http://localhost:${PORT}/api/health`,
    auth: `http://localhost:${PORT}/api/auth/*`,
    trpc: `http://localhost:${PORT}/api/trpc/*`,
  });
  
  if (process.env.EXPO_PUBLIC_ENABLE_WS === 'true') {
    log.info(`WebSocket server will be initialized on port ${process.env.EXPO_PUBLIC_WS_PORT || 3001}`, 'API_SERVER');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down API server', 'API_SERVER');
  server.close(() => {
    log.info('API server closed', 'API_SERVER');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down API server', 'API_SERVER');
  server.close(() => {
    log.info('API server closed', 'API_SERVER');
    process.exit(0);
  });
});