#!/usr/bin/env bun

// Fix OAuth by checking environment and configuration

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// TODO: Replace with structured logging - console.log('[FIX OAUTH] Checking environment...\n');

// 1. Check environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'BETTER_AUTH_SECRET',
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars);
// TODO: Replace with structured logging - console.log('\nPlease set these in your .env.local file');
  process.exit(1);
}

// TODO: Replace with structured logging - console.log('✅ All required environment variables are set\n');

// 2. Test database connection
try {
  const { db } = await import('@/src/db');
// TODO: Replace with structured logging - console.log('✅ Database connection successful\n');
} catch (error: any) {
  console.error('❌ Database connection failed:', error.message);
// TODO: Replace with structured logging - console.log('\nMake sure your database is running:');
// TODO: Replace with structured logging - console.log('  bun run db:local:up');
  process.exit(1);
}

// 3. Test minimal Better Auth configuration
try {
  const { db } = await import('@/src/db');
  const schema = await import('@/src/db/schema');
  
  const auth = betterAuth({
    baseURL: 'http://localhost:8081/api/auth',
    secret: process.env.BETTER_AUTH_SECRET!,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { ...schema },
    }),
  });
  
// TODO: Replace with structured logging - console.log('✅ Better Auth configuration is valid\n');
} catch (error: any) {
  console.error('❌ Better Auth configuration failed:', error.message);
  process.exit(1);
}

// 4. Test with Google OAuth
try {
  const { db } = await import('@/src/db');
  const schema = await import('@/src/db/schema');
  
  const auth = betterAuth({
    baseURL: 'http://localhost:8081/api/auth',
    secret: process.env.BETTER_AUTH_SECRET!,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { ...schema },
    }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
  });
  
// TODO: Replace with structured logging - console.log('✅ Google OAuth configuration is valid\n');
  
  // Test creating a sign-in URL
  const testRequest = new Request('http://localhost:8081/api/auth/sign-in/social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'google',
      callbackURL: 'http://localhost:8081/home',
    }),
  });
  
  const response = await auth.handler(testRequest);
  if (response.status === 200) {
    const data = await response.json();
// TODO: Replace with structured logging - console.log('✅ OAuth sign-in URL generated successfully');
// TODO: Replace with structured logging - console.log('   URL starts with:', data.url.substring(0, 50) + '...\n');
  } else {
    console.error('❌ OAuth sign-in failed:', response.status);
    const text = await response.text();
    console.error('   Response:', text);
  }
  
} catch (error: any) {
  console.error('❌ Google OAuth test failed:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

// TODO: Replace with structured logging - console.log('🎉 OAuth configuration is working correctly!');
// TODO: Replace with structured logging - console.log('\nNext steps:');
// TODO: Replace with structured logging - console.log('1. Make sure your Expo server is running: bun start');
// TODO: Replace with structured logging - console.log('2. The auth API should be available at: http://localhost:8081/api/auth');
// TODO: Replace with structured logging - console.log('3. If you still see 500 errors, check the Expo server logs');