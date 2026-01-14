#!/usr/bin/env bun

// TODO: Replace with structured logging - console.log('🔍 Testing Authentication on Mobile...\n');

// Test the debug endpoint
const apiUrl = 'http://localhost:8081/api/debug/auth-check';

// TODO: Replace with structured logging - console.log('📡 Making request to:', apiUrl);

fetch(apiUrl)
  .then(res => res.json())
  .then(data => {
// TODO: Replace with structured logging - console.log('\n📋 API Response:');
// TODO: Replace with structured logging - console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error('❌ API call failed:', err));

// Also test the test session endpoint
const testUrl = 'http://localhost:8081/api/test/session';

// TODO: Replace with structured logging - console.log('\n📡 Testing session endpoint:', testUrl);

fetch(testUrl)
  .then(res => res.json())
  .then(data => {
// TODO: Replace with structured logging - console.log('\n📋 Session Test Response:');
// TODO: Replace with structured logging - console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error('❌ Session test failed:', err));