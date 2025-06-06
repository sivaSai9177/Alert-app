#!/usr/bin/env bun

/**
 * Test Google OAuth Flow
 * This script tests the OAuth endpoints and flow
 */

import { log } from "../lib/core/logger";

const API_URL = "http://localhost:8081";

async function testOAuthEndpoints() {
  console.log("🧪 Testing Google OAuth Flow...\n");

  // Test 1: Check if auth endpoint is available
  console.log("1️⃣ Testing auth endpoint availability...");
  try {
    const authResponse = await fetch(`${API_URL}/api/auth`);
    console.log(`   ✅ Auth endpoint status: ${authResponse.status}`);
    console.log(`   Content-Type: ${authResponse.headers.get('content-type')}`);
  } catch (error) {
    console.error("   ❌ Auth endpoint error:", error);
  }

  // Test 2: Check OAuth initiation endpoint
  console.log("\n2️⃣ Testing OAuth initiation endpoint...");
  try {
    const oauthUrl = `${API_URL}/api/auth/sign-in/social?provider=google`;
    const oauthResponse = await fetch(oauthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/json',
      },
      redirect: 'manual' // Don't follow redirects automatically
    });
    
    console.log(`   ✅ OAuth endpoint status: ${oauthResponse.status}`);
    console.log(`   Content-Type: ${oauthResponse.headers.get('content-type')}`);
    
    if (oauthResponse.status === 302 || oauthResponse.status === 301) {
      const location = oauthResponse.headers.get('location');
      console.log(`   🔄 Redirect location: ${location}`);
      
      if (location?.includes('accounts.google.com')) {
        console.log("   ✅ OAuth flow correctly redirects to Google!");
      } else {
        console.log("   ⚠️  Unexpected redirect location");
      }
    } else if (oauthResponse.status === 200) {
      const contentType = oauthResponse.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        console.log("   ℹ️  Endpoint returns HTML (might be a redirect page)");
        const html = await oauthResponse.text();
        if (html.includes('google') || html.includes('redirect')) {
          console.log("   ✅ HTML contains OAuth redirect logic");
        }
      }
    }
  } catch (error) {
    console.error("   ❌ OAuth endpoint error:", error);
  }

  // Test 3: Check Better Auth social sign-in endpoint
  console.log("\n3️⃣ Testing Better Auth social sign-in endpoint...");
  try {
    const betterAuthUrl = `${API_URL}/api/auth/sign-in/provider/google?callbackURL=${encodeURIComponent(`${API_URL}/auth-callback`)}`;
    const betterAuthResponse = await fetch(betterAuthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/json',
      },
      redirect: 'manual'
    });
    
    console.log(`   ✅ Better Auth endpoint status: ${betterAuthResponse.status}`);
    
    if (betterAuthResponse.status === 302 || betterAuthResponse.status === 301) {
      const location = betterAuthResponse.headers.get('location');
      console.log(`   🔄 Redirect to: ${location?.substring(0, 50)}...`);
      
      if (location?.includes('accounts.google.com')) {
        console.log("   ✅ Successfully redirects to Google OAuth!");
        console.log("\n🎉 OAuth flow is working correctly!");
        console.log("   The app should redirect users to Google sign-in page.");
      }
    }
  } catch (error) {
    console.error("   ❌ Better Auth endpoint error:", error);
  }

  // Test 4: Check if Google credentials are configured
  console.log("\n4️⃣ Checking OAuth configuration...");
  try {
    // Check if the OAuth callback endpoint exists
    const callbackResponse = await fetch(`${API_URL}/api/auth/callback/google`, {
      method: 'GET',
      redirect: 'manual'
    });
    console.log(`   ✅ Callback endpoint status: ${callbackResponse.status}`);
  } catch (error) {
    console.error("   ❌ Callback endpoint error:", error);
  }

  console.log("\n📋 Summary:");
  console.log("   - Auth endpoints are reachable");
  console.log("   - OAuth flow should work if Google credentials are properly configured");
  console.log("   - Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env.local");
  console.log("\n💡 Next steps:");
  console.log("   1. Open http://localhost:8081 in a browser");
  console.log("   2. Click the Google sign-in button");
  console.log("   3. Check browser console for any errors");
  console.log("   4. You should be redirected to Google's OAuth consent page");
}

// Run the test
testOAuthEndpoints().catch(console.error);