#!/usr/bin/env bun
/**
 * Test the completeProfile endpoint to debug the 500 error
 */

async function testCompleteProfile() {
// TODO: Replace with structured logging - console.log('🧪 Testing completeProfile endpoint...\n');

  const testData = {
    "0": {
      "name": "siva sirigiri",
      "role": "user",
      "acceptTerms": true,
      "acceptPrivacy": true
    }
  };

  try {
    const response = await fetch('http://localhost:8081/api/trpc/auth.completeProfile?batch=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You would need actual session cookies here for a real test
      },
      body: JSON.stringify(testData)
    });

// TODO: Replace with structured logging - console.log('📊 Response Status:', response.status);
// TODO: Replace with structured logging - console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
// TODO: Replace with structured logging - console.log('📊 Response Body:', responseText);

    if (!response.ok) {
// TODO: Replace with structured logging - console.log('\n❌ Request failed with status:', response.status);
      try {
        const errorData = JSON.parse(responseText);
// TODO: Replace with structured logging - console.log('📋 Error Details:', JSON.stringify(errorData, null, 2));
      } catch {
// TODO: Replace with structured logging - console.log('📋 Raw Error Response:', responseText);
      }
    } else {
// TODO: Replace with structured logging - console.log('\n✅ Request succeeded!');
    }

  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testCompleteProfile();