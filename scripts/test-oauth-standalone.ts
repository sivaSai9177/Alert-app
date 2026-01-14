#!/usr/bin/env bun

import { serve } from "bun";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, multiSession } from "better-auth/plugins";
import { db } from "@/src/db";
import * as schema from "@/src/db/schema";

// TODO: Replace with structured logging - console.log('[STANDALONE] Starting OAuth test server...');

// Create auth instance
const auth = betterAuth({
  baseURL: 'http://localhost:3333/api/auth',
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
  plugins: [
    oAuthProxy(),
    multiSession({ maximumSessions: 5 }),
  ],
  disableCsrf: true,
  trustedOrigins: () => true,
});

// Create server
const server = serve({
  port: 3333,
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/auth')) {
// TODO: Replace with structured logging - console.log(`[STANDALONE] Handling auth request: ${request.method} ${url.pathname}`);
      try {
        const response = await auth.handler(request);
// TODO: Replace with structured logging - console.log(`[STANDALONE] Auth response: ${response.status}`);
        return response;
      } catch (error: any) {
        console.error('[STANDALONE] Auth error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Test page
    if (url.pathname === '/') {
      return new Response(`
        <html>
          <body>
            <h1>OAuth Test Server</h1>
            <p>Server is running on port 3333</p>
            <a href="/api/auth/sign-in/social?provider=google&callbackURL=http://localhost:3333/success">
              Sign in with Google
            </a>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    if (url.pathname === '/success') {
      return new Response(`
        <html>
          <body>
            <h1>Success!</h1>
            <p>OAuth callback successful</p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    return new Response('Not found', { status: 404 });
  },
});

// TODO: Replace with structured logging - console.log(`[STANDALONE] Server running at http://localhost:3333`);
// TODO: Replace with structured logging - console.log(`[STANDALONE] Visit http://localhost:3333 to test OAuth`);
// TODO: Replace with structured logging - console.log(`[STANDALONE] Press Ctrl+C to stop`);