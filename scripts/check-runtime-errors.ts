#!/usr/bin/env bun
/**
 * Quick script to check for common runtime errors
 */

console.log('🔍 Checking for common runtime errors...\n');

// Check email service
try {
  const emailMock = require('../src/server/services/email-mock');
  console.log('✅ Email mock service loads correctly');
} catch (error) {
  console.error('❌ Email mock service error:', error.message);
}

// Check theme provider
try {
  const theme = require('../lib/theme/provider');
  console.log('✅ Theme provider loads correctly');
} catch (error) {
  console.error('❌ Theme provider error:', error.message);
}

// Check auth imports
try {
  const auth = require('../lib/auth/auth-client');
  console.log('✅ Auth client loads correctly');
} catch (error) {
  console.error('❌ Auth client error:', error.message);
}

// Check API client
try {
  const api = require('../lib/api/trpc');
  console.log('✅ API client loads correctly');
} catch (error) {
  console.error('❌ API client error:', error.message);
}

// Check navigation
try {
  const nav = require('../lib/navigation/navigation');
  console.log('✅ Navigation loads correctly');
} catch (error) {
  console.error('❌ Navigation error:', error.message);
}

console.log('\n✅ Basic runtime checks complete!');