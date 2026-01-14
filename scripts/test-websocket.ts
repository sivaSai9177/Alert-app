#!/usr/bin/env bun
/**
 * Test WebSocket Implementation
 * Tests the WebSocket server and client connection
 */

import WebSocket from 'ws';

async function testWebSocket() {
  console.log('🧪 Testing WebSocket Connection...\n');
  
  const wsUrl = 'ws://localhost:3001';
  console.log(`📡 Connecting to: ${wsUrl}`);
  
  try {
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connected successfully!');
      console.log('📤 Sending test message...');
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    });
    
    ws.on('message', (data) => {
      console.log('📥 Received message:', data.toString());
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket closed. Code: ${code}, Reason: ${reason}`);
    });
    
    // Keep the script running for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🏁 Closing connection...');
    ws.close();
    
  } catch (error) {
    console.error('❌ Failed to connect:', error);
  }
}

// Run the test
testWebSocket().catch(console.error);