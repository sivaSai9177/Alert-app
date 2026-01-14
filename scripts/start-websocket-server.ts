#!/usr/bin/env bun
/**
 * Standalone WebSocket Server
 * Run the WebSocket server independently for testing
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

// Set required environment variables
process.env.EXPO_PUBLIC_ENABLE_WS = 'true';
process.env.EXPO_PUBLIC_WS_PORT = '3001';

console.log('🚀 Starting standalone WebSocket server...\n');
console.log('Environment:', {
  EXPO_PUBLIC_ENABLE_WS: process.env.EXPO_PUBLIC_ENABLE_WS,
  EXPO_PUBLIC_WS_PORT: process.env.EXPO_PUBLIC_WS_PORT,
  DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'
});

// Import server modules dynamically to avoid React Native imports
async function loadServerModules() {
  const { createWebSocketServer } = await import('../src/server/websocket/server');
  return { createWebSocketServer };
}

async function startServer() {
  try {
    const { createWebSocketServer } = await loadServerModules();
    const port = parseInt(process.env.EXPO_PUBLIC_WS_PORT || '3001');
    console.log(`\n📡 Starting WebSocket server on port ${port}...`);
    
    const { wss, handler } = await createWebSocketServer(port);
    
    console.log(`✅ WebSocket server running on ws://localhost:${port}`);
    console.log('\n📝 Logs will appear below:\n');
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down WebSocket server...');
      wss.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start WebSocket server:', error);
    process.exit(1);
  }
}

startServer();