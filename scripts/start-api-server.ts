#!/usr/bin/env bun

/**
 * Start API Server
 * This script ensures the API routes are properly served
 */

import { createServer } from 'http';
import { auth } from '../lib/auth/auth';

const PORT = process.env.PORT || 8082;

async function startApiServer() {
  console.log('🚀 Starting API server...\n');

  const server = createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    console.log(`[API] ${req.method} ${req.url}`);

    // Handle auth routes
    if (req.url?.startsWith('/api/auth')) {
      try {
        const response = await auth.handler(req as any);
        
        // Copy response headers
        response.headers.forEach((value: string, key: string) => {
          res.setHeader(key, value);
        });
        
        // Set status
        res.statusCode = response.status;
        
        // Send body
        const body = await response.text();
        res.end(body);
      } catch (error) {
        console.error('[API] Error:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(PORT, () => {
    console.log(`✅ API server running on http://localhost:${PORT}`);
    console.log(`📍 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
    console.log('\n💡 You can test OAuth at:');
    console.log(`   http://localhost:${PORT}/api/auth/sign-in/provider/google`);
  });
}

startApiServer().catch(console.error);