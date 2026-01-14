#!/usr/bin/env bun
import { log } from '@/lib/core/logger';

// Debug OAuth server configuration
function debugOAuthServer() {
  log.info('Debugging OAuth Server Configuration...', 'DEBUG');
  
  // Check environment variables
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? '✅ Set' : '❌ Missing',
    BETTER_AUTH_BASE_URL: process.env.BETTER_AUTH_BASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? `✅ ${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : '❌ Missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  };
  
  log.info('Environment Variables:', 'DEBUG', env);
  
  // Check if auth module can be loaded
  try {
    const { auth } = require('@/lib/auth');
    log.info('Auth module loaded successfully', 'DEBUG', {
      hasHandler: typeof auth.handler === 'function',
      hasApi: !!auth.api,
    });
  } catch (error) {
    log.error('Failed to load auth module', 'DEBUG', error);
  }
  
  // Check database connection
  try {
    const { db } = require('@/src/db');
    log.info('Database module loaded', 'DEBUG', { hasDb: !!db });
  } catch (error) {
    log.error('Failed to load database', 'DEBUG', error);
  }
  
  // Test OAuth endpoint directly
  testOAuthEndpoint();
}

async function testOAuthEndpoint() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081';
  
  log.info('Testing OAuth endpoint...', 'DEBUG');
  
  try {
    // Test the auth handler endpoint
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    log.info('Auth endpoint response', 'DEBUG', {
      status: response.status,
      statusText: response.statusText,
    });
    
    // Test the social sign-in endpoint
    const socialResponse = await fetch(`${baseUrl}/api/auth/sign-in/social`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        callbackURL: `${baseUrl}/auth-callback`,
      }),
    });
    
    const responseText = await socialResponse.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
    
    log.info('Social sign-in endpoint response', 'DEBUG', {
      status: socialResponse.status,
      statusText: socialResponse.statusText,
      data: responseData,
    });
  } catch (error) {
    log.error('Failed to test OAuth endpoint', 'DEBUG', error);
  }
}

// Run the debug script
debugOAuthServer();