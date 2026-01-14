#!/usr/bin/env bun

// TODO: Replace with structured logging - console.log('[TEST] Testing OAuth configuration...');

try {
  const { betterAuth } = await import('better-auth');
  const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
  const { db } = await import('@/src/db');
  
  // Create auth with just Google OAuth
  const auth = betterAuth({
    baseURL: 'http://localhost:8081/api/auth',
    secret: process.env.BETTER_AUTH_SECRET || 'test-secret',
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
  });
  
// TODO: Replace with structured logging - console.log('[TEST] ✅ Auth with Google OAuth created');
  
  // Test the Google sign-in endpoint
  const signInRequest = new Request('http://localhost:8081/api/auth/sign-in/social', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: 'google',
      callbackURL: 'http://localhost:8081/home',
    }),
  });
  
  const response = await auth.handler(signInRequest);
// TODO: Replace with structured logging - console.log('[TEST] Google sign-in response:', response.status);
  
  if (response.status !== 200) {
    const text = await response.text();
// TODO: Replace with structured logging - console.log('[TEST] Response body:', text);
  } else {
    const data = await response.json();
// TODO: Replace with structured logging - console.log('[TEST] Success! Redirect URL:', data.url);
  }
  
} catch (error) {
  console.error('[TEST] ❌ Error:', error.message);
  console.error('[TEST] Stack:', error.stack);
}