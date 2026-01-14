#!/usr/bin/env bun

async function checkApiHealth() {
// TODO: Replace with structured logging - console.log('🔍 Checking API health...\n');
  
  const baseUrl = 'http://localhost:8081';
  
  // Check endpoints
  const endpoints = [
    '/api/auth',
    '/api/trpc/auth.getSession?batch=1&input=%7B%7D',
    '/'
  ];
  
  for (const endpoint of endpoints) {
    try {
// TODO: Replace with structured logging - console.log(`Checking ${baseUrl}${endpoint}...`);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: endpoint.includes('trpc') ? 'GET' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
// TODO: Replace with structured logging - console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (endpoint === '/api/auth') {
        const text = await response.text();
// TODO: Replace with structured logging - console.log(`   Response preview: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
// TODO: Replace with structured logging - console.log(`❌ ${endpoint}: ${error.message}`);
    }
// TODO: Replace with structured logging - console.log('');
  }
  
  // Check if server is running
  try {
    const response = await fetch(baseUrl);
    if (response.ok) {
// TODO: Replace with structured logging - console.log('✅ Expo server is running');
    }
  } catch (error) {
// TODO: Replace with structured logging - console.log('❌ Expo server is not running. Start it with: bun start');
  }
}

checkApiHealth();