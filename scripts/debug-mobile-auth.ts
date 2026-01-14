#!/usr/bin/env bun

/**
 * Debug script to understand mobile authentication storage
 * Run this to see what's actually stored after login
 */

import { mobileStorage } from '../lib/core/secure-storage';

// TODO: Replace with structured logging - console.log('=== Mobile Auth Storage Debug ===\n');

// Check all possible keys
const keysToCheck = [
  'better-auth_cookie',
  'better-auth_session-token', 
  'better-auth.session-token',
  'better-auth.cookie',
  'better-auth_session_data',
  'better-auth_user_data',
  'session-token',
  'auth-token',
  'app-auth-storage', // Zustand store
];

// TODO: Replace with structured logging - console.log('Checking storage keys:');
for (const key of keysToCheck) {
  const value = mobileStorage.getItem(key);
  if (value) {
// TODO: Replace with structured logging - console.log(`\n✅ ${key}:`);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(value);
// TODO: Replace with structured logging - console.log('  Type: JSON');
// TODO: Replace with structured logging - console.log('  Keys:', Object.keys(parsed));
      
      // Show preview of values
      if (parsed.token) {
// TODO: Replace with structured logging - console.log('  token:', parsed.token.substring(0, 20) + '...');
      }
      if (parsed.sessionToken) {
// TODO: Replace with structured logging - console.log('  sessionToken:', parsed.sessionToken.substring(0, 20) + '...');
      }
      if (parsed['better-auth.session-token']) {
// TODO: Replace with structured logging - console.log('  better-auth.session-token:', parsed['better-auth.session-token'].substring(0, 20) + '...');
      }
      if (parsed.user) {
// TODO: Replace with structured logging - console.log('  user:', { id: parsed.user.id, email: parsed.user.email });
      }
      if (parsed.state?.user) {
// TODO: Replace with structured logging - console.log('  state.user:', { id: parsed.state.user.id, email: parsed.state.user.email });
      }
    } catch (e) {
      // Not JSON, show as string
// TODO: Replace with structured logging - console.log('  Type: String');
      if (value.length > 100) {
// TODO: Replace with structured logging - console.log('  Value:', value.substring(0, 80) + '...');
      } else {
// TODO: Replace with structured logging - console.log('  Value:', value);
      }
      
      // Check if it looks like a cookie
      if (value.includes('=')) {
// TODO: Replace with structured logging - console.log('  Looks like a cookie format');
        const parts = value.split(';');
        parts.forEach(part => {
          const [k, v] = part.split('=');
          if (k && v) {
// TODO: Replace with structured logging - console.log(`    ${k.trim()}: ${v.trim().substring(0, 20)}...`);
          }
        });
      }
    }
  } else {
// TODO: Replace with structured logging - console.log(`❌ ${key}: Not found`);
  }
}

// TODO: Replace with structured logging - console.log('\n=== End Debug ===');