# Google OAuth Solution

## Problem Summary
The Google OAuth button is making a POST request to `/api/auth/sign-in/social` which returns 200 OK but doesn't redirect to Google. This is happening because:

1. Better Auth's `signIn.social()` method expects the server to handle the redirect
2. The server is returning success but not actually redirecting
3. Expo Router might be intercepting the response

## Solution

### Option 1: Direct Navigation (Recommended)
Instead of using the Better Auth client for OAuth, navigate directly to the OAuth endpoint:

```typescript
// In GoogleSignInButton.tsx
const handleGoogleSignIn = async () => {
  // For web, navigate directly to the OAuth endpoint
  if (Platform.OS === 'web') {
    const callbackURL = `${window.location.origin}/auth-callback`;
    const oauthUrl = `${window.location.origin}/api/auth/signin/google?callbackURL=${encodeURIComponent(callbackURL)}`;
    
    // Direct navigation - bypasses any client-side routing
    window.location.href = oauthUrl;
  }
};
```

### Option 2: Use a Link/Anchor Tag
Replace the button with a direct link:

```tsx
<a 
  href="/api/auth/signin/google?callbackURL=/auth-callback"
  className="button-styles"
>
  Continue with Google
</a>
```

### Option 3: Check Server Configuration
Ensure Better Auth is properly configured to handle OAuth:

1. Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are loaded
2. Verify the OAuth callback URLs in Google Console
3. Check server logs for any Better Auth errors

## Testing Steps

1. **Check if OAuth endpoint works directly**:
   Open in browser: `http://localhost:8081/api/auth/signin/google?callbackURL=http://localhost:8081/auth-callback`
   
   If this redirects to Google, the server is working correctly.

2. **Check browser console**:
   Look for the logs when clicking the button:
   - `OAuth initiated, result:` - Check what Better Auth returns
   - Any network errors or CORS issues

3. **Try the test page**:
   Open `scripts/test-direct-oauth.html` in your browser to test different OAuth URL patterns

## Root Cause

The issue appears to be that Better Auth's client-side `signIn.social()` method expects a different response format than what the server is providing. The server should either:
- Return a redirect (302) response
- Return a JSON response with the OAuth URL
- Handle the OAuth flow entirely server-side

## Immediate Fix

Update `GoogleSignInButton.tsx` to use direct navigation:

```typescript
const handleGoogleSignIn = async () => {
  setIsLoading(true);
  
  try {
    if (Platform.OS === 'web') {
      // Direct navigation to OAuth endpoint
      window.location.href = '/api/auth/signin/google?callbackURL=' + 
        encodeURIComponent(window.location.origin + '/auth-callback');
    } else {
      // Mobile OAuth (unchanged)
      await defaultAuthClient.signIn.social({
        provider: 'google',
        callbackURL: '/auth-callback',
      });
    }
  } catch (error) {
    console.error('OAuth error:', error);
    setIsLoading(false);
  }
};
```

This bypasses the Better Auth client for web and navigates directly to the OAuth endpoint, which should trigger the proper redirect to Google.