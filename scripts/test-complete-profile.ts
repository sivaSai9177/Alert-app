#!/usr/bin/env bun
/**
 * Test the completeProfile endpoint to debug the 500 error
 */

async function testCompleteProfile() {
  console.log('🧪 Testing completeProfile endpoint...\n');

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

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Response Body:', responseText);

    if (!response.ok) {
      console.log('\n❌ Request failed with status:', response.status);
      try {
        const errorData = JSON.parse(responseText);
        console.log('📋 Error Details:', JSON.stringify(errorData, null, 2));
      } catch {
        console.log('📋 Raw Error Response:', responseText);
      }
    } else {
      console.log('\n✅ Request succeeded!');
    }

  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testCompleteProfile();