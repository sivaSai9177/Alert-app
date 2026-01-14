#!/usr/bin/env bun

// Simple test to check if auth module loads without React Native dependencies

// TODO: Replace with structured logging - console.log('[TEST] Starting auth module test...');

// Test 1: Can we load the database?
try {
  const { db } = await import('@/src/db');
// TODO: Replace with structured logging - console.log('[TEST] ✅ Database module loaded successfully');
} catch (error) {
  console.error('[TEST] ❌ Failed to load database:', error.message);
}

// Test 2: Can we load Better Auth without our config?
try {
  const { betterAuth } = await import('better-auth');
// TODO: Replace with structured logging - console.log('[TEST] ✅ Better Auth core loaded successfully');
} catch (error) {
  console.error('[TEST] ❌ Failed to load Better Auth:', error.message);
}

// Test 3: Can we create a minimal auth instance?
try {
  const { betterAuth } = await import('better-auth');
  const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
  const { db } = await import('@/src/db');
  
  const minimalAuth = betterAuth({
    baseURL: 'http://localhost:8081/api/auth',
    secret: process.env.BETTER_AUTH_SECRET || 'test-secret',
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
  });
  
// TODO: Replace with structured logging - console.log('[TEST] ✅ Minimal auth instance created');
  
  // Test the handler
  const testRequest = new Request('http://localhost:8081/api/auth/session');
  const response = await minimalAuth.handler(testRequest);
// TODO: Replace with structured logging - console.log('[TEST] Handler response:', response.status);
  
} catch (error) {
  console.error('[TEST] ❌ Failed to create minimal auth:', error.message);
  console.error('[TEST] Stack:', error.stack);
}

// Test 4: Check environment variables
// TODO: Replace with structured logging - console.log('\n[TEST] Environment check:');
// TODO: Replace with structured logging - console.log('- NODE_ENV:', process.env.NODE_ENV);
// TODO: Replace with structured logging - console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set');
// TODO: Replace with structured logging - console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
// TODO: Replace with structured logging - console.log('- BETTER_AUTH_SECRET:', process.env.BETTER_AUTH_SECRET ? '✅ Set' : '❌ Not set');
// TODO: Replace with structured logging - console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');