#!/usr/bin/env bun

// TODO: Replace with structured logging - console.log('[TEST] Testing OAuth without expo plugin...');

try {
  const { betterAuth } = await import('better-auth');
  const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
  const { oAuthProxy, multiSession } = await import('better-auth/plugins');
  const { db } = await import('@/src/db');
  const schema = await import('@/src/db/schema');
  
  // Create auth without expo plugin
  const auth = betterAuth({
    baseURL: 'http://localhost:8081/api/auth',
    secret: process.env.BETTER_AUTH_SECRET || 'test-secret',
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { ...schema },
    }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        scope: ["openid", "email", "profile"],
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: null,
        },
        organizationId: {
          type: "string",
          required: false,
        },
        needsProfileCompletion: {
          type: "boolean",
          required: true,
          defaultValue: true,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    plugins: [
      oAuthProxy(),
      multiSession({ maximumSessions: 5 }),
    ],
  });
  
// TODO: Replace with structured logging - console.log('[TEST] ✅ Auth created without expo plugin');
  
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
  
  if (response.status === 200 || response.status === 302) {
    const data = await response.json();
// TODO: Replace with structured logging - console.log('[TEST] ✅ Success! Response:', data);
  } else {
    const text = await response.text();
// TODO: Replace with structured logging - console.log('[TEST] ❌ Error response:', text);
  }
  
} catch (error) {
  console.error('[TEST] ❌ Error:', error.message);
  if (error.stack) {
    console.error('[TEST] Stack:', error.stack);
  }
}