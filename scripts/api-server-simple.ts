#!/usr/bin/env node

/**
 * Simple API Server for Expo Go Development
 * Minimal dependencies, no React Native imports
 */

import { createServer } from 'http';
import { parse } from 'url';

const PORT = process.env.API_PORT || 3000;

// Simple logging
const log = (message: string, data?: any) => {
  console.log(`[API Server] ${message}`, data || '');
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

// Import server modules dynamically to avoid initialization issues
async function getServerModules() {
  try {
    const authModule = await import('../lib/auth/auth-server-only');
    const trpcModule = await import('@trpc/server/adapters/fetch');
    const routersModule = await import('../src/server/routers');
    const contextModule = await import('../src/server/trpc');
    
    return {
      auth: authModule.auth,
      fetchRequestHandler: trpcModule.fetchRequestHandler,
      appRouter: routersModule.appRouter,
      createContext: contextModule.createContext,
    };
  } catch (error) {
    log('Failed to load server modules:', error);
    throw error;
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

async function startServer() {
  log('Starting API server...');
  
  // Load modules
  const { auth, fetchRequestHandler, appRouter, createContext } = await getServerModules();
  
  // Create HTTP server
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);
    const pathname = parsedUrl.pathname || '';

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    log(`${req.method} ${pathname}`);

    try {
      // Handle health check
      if (pathname === '/api/health') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          environment: process.env.APP_ENV || 'local',
          server: 'api-simple',
        }));
        return;
      }

      // For POST/PUT requests, handle the body
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        try {
          const body = await getRequestBody(req);
          (req as any).body = body;
          (req as any).arrayBuffer = async () => body;
          (req as any).text = async () => body.toString();
          (req as any).json = async () => JSON.parse(body.toString());
        } catch (error) {
          log('Failed to parse request body:', error);
        }
      }

      // Create Request object
      const request = new Request(`http://localhost:${PORT}${req.url}`, {
        method: req.method,
        headers: req.headers as any,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? (req as any).body : undefined,
      });

      // Handle auth routes
      if (pathname.startsWith('/api/auth')) {
        const response = await auth.handler(request);
        
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
        const response = await fetchRequestHandler({
          endpoint: '/api/trpc',
          req: request,
          router: appRouter,
          createContext: () => createContext(request),
          onError: ({ error, path }) => {
            log(`tRPC error on ${path}:`, error.message);
          },
        });

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
      log('Server error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  });

  // Start server
  server.listen(PORT, () => {
    log(`✅ API server running on http://localhost:${PORT}`);
    log('Available endpoints:');
    log(`  Health: http://localhost:${PORT}/api/health`);
    log(`  Auth:   http://localhost:${PORT}/api/auth/*`);
    log(`  tRPC:   http://localhost:${PORT}/api/trpc/*`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down...');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    log('SIGINT received, shutting down...');
    server.close(() => process.exit(0));
  });
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});