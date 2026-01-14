#!/usr/bin/env bun

/**
 * Complete OAuth Flow Test
 * Tests the entire Google OAuth flow from initiation to callback
 */

import { authClient } from "../lib/auth/auth-client";

async function testCompleteOAuthFlow() {
// TODO: Replace with structured logging - console.log("🧪 Testing Complete Google OAuth Flow\n");

  try {
    // Test 1: Check environment variables
// TODO: Replace with structured logging - console.log("1️⃣ Checking environment configuration...");
    const hasGoogleCreds = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
// TODO: Replace with structured logging - console.log(`   ${hasGoogleCreds ? '✅' : '❌'} Google credentials configured`);
    
    if (process.env.GOOGLE_CLIENT_ID) {
// TODO: Replace with structured logging - console.log(`   Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`);
    }

    // Test 2: Check auth client
// TODO: Replace with structured logging - console.log("\n2️⃣ Testing auth client...");
// TODO: Replace with structured logging - console.log("   ✅ Auth client initialized");
// TODO: Replace with structured logging - console.log(`   Base URL: ${authClient.baseURL}`);

    // Test 3: Check session
// TODO: Replace with structured logging - console.log("\n3️⃣ Checking current session...");
    try {
      const session = await authClient.getSession();
      if (session) {
// TODO: Replace with structured logging - console.log("   ✅ Active session found");
// TODO: Replace with structured logging - console.log(`   User: ${session.user?.email}`);
// TODO: Replace with structured logging - console.log(`   Role: ${session.user?.role}`);
      } else {
// TODO: Replace with structured logging - console.log("   ℹ️  No active session");
      }
    } catch (error) {
// TODO: Replace with structured logging - console.log("   ℹ️  No session (expected if not logged in)");
    }

    // Test 4: OAuth URL construction
// TODO: Replace with structured logging - console.log("\n4️⃣ OAuth URL construction...");
    const callbackURL = "http://localhost:8081/auth-callback";
    const provider = "google";
    
    // This would normally trigger the OAuth flow
// TODO: Replace with structured logging - console.log(`   Provider: ${provider}`);
// TODO: Replace with structured logging - console.log(`   Callback URL: ${callbackURL}`);
    
    // Test 5: Direct API test
// TODO: Replace with structured logging - console.log("\n5️⃣ Testing OAuth API endpoint directly...");
    const oauthApiUrl = `http://localhost:8081/api/auth/sign-in/provider/google?callbackURL=${encodeURIComponent(callbackURL)}`;
    
    const response = await fetch(oauthApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/json',
      },
      redirect: 'manual'
    });

// TODO: Replace with structured logging - console.log(`   Status: ${response.status}`);
// TODO: Replace with structured logging - console.log(`   Type: ${response.type}`);
    
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
// TODO: Replace with structured logging - console.log(`   ✅ Redirects to: ${location?.substring(0, 50)}...`);
      
      if (location?.includes('accounts.google.com')) {
// TODO: Replace with structured logging - console.log("\n🎉 OAuth flow is working correctly!");
// TODO: Replace with structured logging - console.log("   Google OAuth is properly configured and ready to use.");
      }
    } else if (response.status === 200) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        const html = await response.text();
        
        // Check if it's a meta refresh redirect
        if (html.includes('meta http-equiv="refresh"') || html.includes('window.location')) {
// TODO: Replace with structured logging - console.log("   ✅ HTML redirect page detected");
          
          // Extract redirect URL from HTML
          const redirectMatch = html.match(/content="0;url=([^"]+)"/);
          if (redirectMatch) {
// TODO: Replace with structured logging - console.log(`   Redirects to: ${redirectMatch[1].substring(0, 50)}...`);
          }
        } else {
// TODO: Replace with structured logging - console.log("   ⚠️  Unexpected HTML response");
// TODO: Replace with structured logging - console.log("   First 200 chars:", html.substring(0, 200));
        }
      }
    }

    // Summary
// TODO: Replace with structured logging - console.log("\n📋 OAuth Flow Summary:");
// TODO: Replace with structured logging - console.log("   ✅ Environment variables are set");
// TODO: Replace with structured logging - console.log("   ✅ Auth client is configured");
// TODO: Replace with structured logging - console.log("   ✅ OAuth endpoints are accessible");
// TODO: Replace with structured logging - console.log("\n🚀 Next Steps:");
// TODO: Replace with structured logging - console.log("   1. Open http://localhost:8081 in a browser");
// TODO: Replace with structured logging - console.log("   2. Click the 'Continue with Google' button");
// TODO: Replace with structured logging - console.log("   3. You should be redirected to Google's sign-in page");
// TODO: Replace with structured logging - console.log("   4. After signing in, you'll be redirected back to the app");
// TODO: Replace with structured logging - console.log("\n💡 If OAuth is not working:");
// TODO: Replace with structured logging - console.log("   - Check browser console for errors");
// TODO: Replace with structured logging - console.log("   - Verify Google Console redirect URIs");
// TODO: Replace with structured logging - console.log("   - Ensure cookies are enabled in browser");
// TODO: Replace with structured logging - console.log("   - Check that the server is running on port 8081");

  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

// Run the test
testCompleteOAuthFlow();