#!/usr/bin/env bun

// Simple OAuth test without React Native imports
// TODO: Replace with structured logging - console.log('🔍 Testing OAuth Configuration...\n');

// Check environment variables
// TODO: Replace with structured logging - console.log('📋 Environment Variables:');
// TODO: Replace with structured logging - console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
// TODO: Replace with structured logging - console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
// TODO: Replace with structured logging - console.log(`BETTER_AUTH_SECRET: ${process.env.BETTER_AUTH_SECRET ? '✅ Set' : '❌ Missing'}`);
// TODO: Replace with structured logging - console.log(`BETTER_AUTH_BASE_URL: ${process.env.BETTER_AUTH_BASE_URL}`);
// TODO: Replace with structured logging - console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ ' + process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : '❌ Missing'}`);
// TODO: Replace with structured logging - console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
// TODO: Replace with structured logging - console.log('');

// Test OAuth endpoint
async function testOAuth() {
  // Use localhost for OAuth
  const baseUrl = 'http://localhost:8081';
// TODO: Replace with structured logging - console.log(`🌐 Testing OAuth at: ${baseUrl}`);
  
  try {
    // Test if server is running
    const healthResponse = await fetch(`${baseUrl}/api/health`);
// TODO: Replace with structured logging - console.log(`\n✅ Server is running (health check: ${healthResponse.status})`);
  } catch (error) {
    console.error('\n❌ Server is not running at localhost:8081');
    console.error('Please start the server with: bun run local:oauth');
    return;
  }
  
  try {
    // Test social sign-in endpoint
// TODO: Replace with structured logging - console.log('\n📱 Testing /api/auth/sign-in/social endpoint...');
    
    const response = await fetch(`${baseUrl}/api/auth/sign-in/social`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8081',
      },
      body: JSON.stringify({
        provider: 'google',
        callbackURL: `${baseUrl}/auth-callback`,
      }),
    });
    
// TODO: Replace with structured logging - console.log(`Response status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
// TODO: Replace with structured logging - console.log('\nResponse data:', JSON.stringify(responseData, null, 2));
    } catch {
// TODO: Replace with structured logging - console.log('\nResponse (not JSON):', responseText.substring(0, 200) + '...');
    }
    
    if (response.status === 500) {
// TODO: Replace with structured logging - console.log('\n⚠️  OAuth endpoint is returning 500 error');
// TODO: Replace with structured logging - console.log('Possible causes:');
// TODO: Replace with structured logging - console.log('1. Missing Google OAuth credentials');
// TODO: Replace with structured logging - console.log('2. Database connection issue');
// TODO: Replace with structured logging - console.log('3. Better Auth configuration error');
// TODO: Replace with structured logging - console.log('\nTry running: bun run local:oauth');
    }
  } catch (error) {
    console.error('\n❌ Failed to test OAuth endpoint:', error.message);
  }
}

testOAuth();