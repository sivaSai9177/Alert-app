#!/usr/bin/env bun
import { auth } from '@/lib/auth';
import { log } from '@/lib/core/logger';

async function testAuthHandler() {
  log.info('Testing auth handler directly...', 'TEST');
  
  try {
    // Create a minimal request object
    const request = new Request('http://localhost:8081/api/auth/sign-in/social', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        callbackURL: 'http://localhost:8081/auth-callback',
      }),
    });
    
    log.info('Calling auth.handler with request', 'TEST', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    });
    
    const response = await auth.handler(request);
    
    log.info('Response from auth.handler', 'TEST', {
      status: response.status,
      statusText: response.statusText,
    });
    
    const body = await response.text();
    log.info('Response body', 'TEST', body);
    
  } catch (error) {
    log.error('Error calling auth.handler', 'TEST', error);
  }
}

// Also test if auth object is correctly initialized
log.info('Auth object check', 'TEST', {
  hasAuth: !!auth,
  hasHandler: typeof auth?.handler === 'function',
  hasApi: !!auth?.api,
  apiKeys: auth?.api ? Object.keys(auth.api) : [],
});

testAuthHandler();