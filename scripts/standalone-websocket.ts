#!/usr/bin/env node
/**
 * Standalone WebSocket Server
 * Runs the WebSocket server independently without React Native imports
 */

const { WebSocketServer } = require('ws');
const crypto = require('crypto');

const port = process.env.EXPO_PUBLIC_WS_PORT || 3001;

console.log('🚀 Starting WebSocket server...');
console.log(`📡 Port: ${port}`);

const wss = new WebSocketServer({ port });

wss.on('connection', (ws, req) => {
  const connectionId = crypto.randomUUID();
  console.log(`✅ New connection: ${connectionId}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    connectionId,
    message: 'Connected to WebSocket server'
  }));
  
  // Handle messages
  ws.on('message', (data) => {
    console.log(`📥 Received: ${data}`);
    
    // Echo back
    ws.send(JSON.stringify({
      type: 'echo',
      received: data.toString(),
      timestamp: new Date().toISOString()
    }));
  });
  
  // Handle close
  ws.on('close', () => {
    console.log(`🔌 Connection closed: ${connectionId}`);
  });
  
  // Heartbeat
  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);
  
  ws.on('close', () => {
    clearInterval(interval);
  });
});

console.log(`✅ WebSocket server running on ws://localhost:${port}`);

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  wss.close(() => {
    process.exit(0);
  });
});