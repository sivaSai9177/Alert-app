#!/usr/bin/env bun

import { log } from '@/lib/core/logger';
import { authClient } from '@/lib/auth/auth-client';
import { sessionManager } from '@/lib/auth/auth-session-manager';
import { mobileStorage } from '@/lib/core/secure-storage';

log.info('🔍 Testing Authentication Headers on Mobile...\n', 'COMPONENT');

// Test 1: Check what's in storage
log.info('📦 Checking Storage Contents:', 'COMPONENT');
const storageKeys = [
  'better-auth_cookie',
  'better-auth.cookie',
  'better-auth_session-token',
  'better-auth.session-token',
  'better-auth_session_data',
  'better-auth.session_data',
];

for (const key of storageKeys) {
  const value = mobileStorage.getItem(key);
  if (value) {
    log.info('✅ Found ${key}:', 'COMPONENT');
  }
}

// Test 2: Try to get session token via session manager
log.info('\n🔑 Testing Session Manager:', 'COMPONENT');
const token = sessionManager.getSessionToken();
log.info('Session token:', 'COMPONENT');

// Test 3: Check Better Auth client session
log.info('\n🔐 Testing Better Auth Client:', 'COMPONENT');
try {
  const sessionStore = authClient.$sessionStore.get();
  log.info('Session store:', 'COMPONENT');
    hasSession: !!sessionStore?.session,
    hasToken: !!sessionStore?.session?.token,
    hasUser: !!sessionStore?.user,
    userId: sessionStore?.user?.id,
  });
  
  if (sessionStore?.session?.token) {
    log.info('Token from session store:', 'COMPONENT');
  }
} catch (error) {
  console.error('Failed to access session store:', error);
}

// Test 4: Make a test API call
log.info('\n🌐 Testing API Call with Headers:', 'COMPONENT');
const apiUrl = 'http://localhost:8081/api/debug/auth-check';

// First test without any headers
fetch(apiUrl)
  .then(res => res.json())
  .then(data => {
    log.info('\nAPI Response (no headers):', 'COMPONENT');
    log.info('- Headers found:', 'COMPONENT');
    log.info('- Sessions:', 'COMPONENT');
    log.info('- Diagnostics:', 'COMPONENT');
  })
  .catch(err => console.error('API call failed:', err))
  .then(async () => {
    // Now test with Bearer token if we have one
    if (token) {
      log.info('\n🔄 Testing with Bearer token...', 'COMPONENT');
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      log.info('\nAPI Response (with Bearer):', 'COMPONENT');
      log.info('- Bearer token recognized:', 'COMPONENT');
      log.info('- Session validated:', 'COMPONENT');
      log.info('- User ID:', 'COMPONENT');
    } else {
      log.info('\n⚠️  No token available to test Bearer authentication', 'COMPONENT');
    }
  });

// Test 5: Debug token storage
log.debug('\n🐛 Running detailed token storage debug:', 'COMPONENT');
await sessionManager.debugTokenStorage();

log.info('\n✅ Authentication header testing complete', 'COMPONENT');