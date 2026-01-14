#!/usr/bin/env bun
/**
 * Test API Health Endpoint
 * Verifies that API routes are accessible
 */

import { log } from '@/lib/core/logger';

async function testAPI() {
  const urls = [
    'http://localhost:8081',
    'http://localhost:8081/api/health',
    'http://localhost:8081/api/auth/get-session',
    'http://localhost:8081/api/trpc/getQueryKey'
  ];

  console.log('🧪 Testing API endpoints...\n');

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, {
        method: url.includes('get-session') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`✅ ${url} - Status: ${response.status}`);
      
      if (response.ok || response.status === 401) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          console.log('   Response:', JSON.stringify(data, null, 2));
        } else if (contentType?.includes('text/html')) {
          console.log('   Response: HTML page');
        }
      }
    } catch (error) {
      console.error(`❌ ${url} - Error: ${error.message}`);
    }
    console.log('');
  }
}

// Run the test
testAPI().catch(console.error);