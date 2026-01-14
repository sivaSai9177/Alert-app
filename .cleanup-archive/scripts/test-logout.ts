#!/usr/bin/env bun

async function testLogout() {
// TODO: Replace with structured logging - console.log('🔍 Testing logout functionality...\n');
  
  const baseUrl = 'http://localhost:8081';
  
  // First, check if we can get session
  try {
// TODO: Replace with structured logging - console.log('1. Checking current session...');
    const sessionResponse = await fetch(`${baseUrl}/api/trpc/auth.getSession?batch=1&input=%7B%7D`, {
      credentials: 'include',
    });
    
    const sessionData = await sessionResponse.json();
// TODO: Replace with structured logging - console.log('Session response:', JSON.stringify(sessionData, null, 2));
    
    // Try to sign out with POST and empty body
// TODO: Replace with structured logging - console.log('\n2. Testing sign out with POST...');
    const signOutResponse = await fetch(`${baseUrl}/api/auth/sign-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{}',
      credentials: 'include',
    });
    
// TODO: Replace with structured logging - console.log(`Sign out response: ${signOutResponse.status} ${signOutResponse.statusText}`);
    const signOutResult = await signOutResponse.text();
// TODO: Replace with structured logging - console.log('Sign out result:', signOutResult);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogout();