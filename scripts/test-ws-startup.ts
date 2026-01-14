#!/usr/bin/env bun
/**
 * Test WebSocket Server Startup
 * Tests the WebSocket server initialization with proper error handling
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

// Set required environment variables
process.env.EXPO_PUBLIC_ENABLE_WS = 'true';
process.env.EXPO_PUBLIC_WS_PORT = '3001';

console.log('🧪 Testing WebSocket server startup...\n');

// Import server modules dynamically
async function testWebSocketStartup() {
  try {
    const { initializeBackgroundServices } = await import('../src/server/services/server-startup');
    
    console.log('📡 Initializing background services...');
    initializeBackgroundServices();
    
    // Wait a bit for async initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to initialize again (should handle gracefully)
    console.log('\n📡 Testing duplicate initialization...');
    initializeBackgroundServices();
    
    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n✅ WebSocket server startup test completed');
    console.log('Check the logs above for any errors or warnings\n');
    
    // Keep running for manual inspection
    console.log('Press Ctrl+C to exit...');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testWebSocketStartup();