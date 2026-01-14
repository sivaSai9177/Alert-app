#!/usr/bin/env bun

import { 
  getUnifiedEnvConfig, 
  getApiUrl, 
  getAuthUrl, 
  getAuthBaseUrl,
  isOAuthSafe,
  getDatabaseUrl,
  logEnvironment 
} from '@/lib/core/unified-env';

// TODO: Replace with structured logging - console.log('🧪 Testing Unified Environment Configuration\n');
// TODO: Replace with structured logging - console.log('============================================\n');

// Test different scenarios by setting APP_ENV
const scenarios = [
  { name: 'Local Mode', env: 'local' },
  { name: 'Network Mode', env: undefined },
  { name: 'Production Mode', env: 'production' },
];

// Save current APP_ENV
const originalAppEnv = process.env.APP_ENV;
const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

scenarios.forEach(scenario => {
// TODO: Replace with structured logging - console.log(`\n📍 Testing ${scenario.name}:`);
// TODO: Replace with structured logging - console.log('----------------------------');
  
  // Set environment
  if (scenario.env) {
    process.env.APP_ENV = scenario.env;
  } else {
    delete process.env.APP_ENV;
    // Simulate network mode with IP
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.101:8081';
  }
  
  // Get configuration
  const config = getUnifiedEnvConfig();
  
// TODO: Replace with structured logging - console.log('Mode:', config.mode);
// TODO: Replace with structured logging - console.log('API URL:', getApiUrl());
// TODO: Replace with structured logging - console.log('Auth URL:', getAuthUrl());
// TODO: Replace with structured logging - console.log('Auth Base URL:', getAuthBaseUrl());
// TODO: Replace with structured logging - console.log('OAuth Safe:', isOAuthSafe() ? '✅ Yes' : '❌ No');
// TODO: Replace with structured logging - console.log('Database URL:', getDatabaseUrl() ? '✅ Configured' : '❌ Not set');
});

// Restore environment
process.env.APP_ENV = originalAppEnv;
process.env.EXPO_PUBLIC_API_URL = originalApiUrl;

// TODO: Replace with structured logging - console.log('\n\n🔍 Current Environment:');
// TODO: Replace with structured logging - console.log('======================');
logEnvironment();

// TODO: Replace with structured logging - console.log('\n✅ Test complete!');