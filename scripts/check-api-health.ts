#!/usr/bin/env bun

async function checkApiHealth() {
  console.log('🔍 Checking API health...\n');
  
  const baseUrl = 'http://localhost:8081';
  
  // Check endpoints
  const endpoints = [
    '/api/auth',
    '/api/trpc/auth.getSession?batch=1&input=%7B%7D',
    '/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Checking ${baseUrl}${endpoint}...`);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: endpoint.includes('trpc') ? 'GET' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (endpoint === '/api/auth') {
        const text = await response.text();
        console.log(`   Response preview: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
    console.log('');
  }
  
  // Check if server is running
  try {
    const response = await fetch(baseUrl);
    if (response.ok) {
      console.log('✅ Expo server is running');
    }
  } catch (error) {
    console.log('❌ Expo server is not running. Start it with: bun start');
  }
}

checkApiHealth();