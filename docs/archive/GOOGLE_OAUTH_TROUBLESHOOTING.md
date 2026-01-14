# Google OAuth Troubleshooting Guide

## Issue: Google Sign-In Button Stuck in Loading State

### Symptoms
- Button shows loading spinner after clicking
- Network request to `/api/auth/sign-in/social` returns 200 OK
- No redirect to Google OAuth page occurs
- Button remains in loading state

### Root Cause
The Better Auth OAuth flow is not redirecting to Google's authentication page. This typically happens when:
1. Google OAuth credentials are not properly configured
2. Redirect URIs don't match between Google Console and the app
3. Better Auth is not properly handling the OAuth initiation

### Solution

#### 1. Verify Google OAuth Configuration

Check that your `.env.local` file has all required Google OAuth variables:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

#### 2. Verify Redirect URIs in Google Console

For local development on port 8081, add these Authorized redirect URIs in Google Console:
- `http://localhost:8081/api/auth/callback/google`
- `http://localhost:8081/auth-callback`
- `http://127.0.0.1:8081/api/auth/callback/google`
- `http://127.0.0.1:8081/auth-callback`

#### 3. Check Better Auth Configuration

The auth configuration should include:
```typescript
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scope: ["openid", "email", "profile"],
  }
}
```

#### 4. Direct OAuth URL Approach

The GoogleSignInButton now uses a direct navigation approach for web:
```typescript
const oauthUrl = `${apiUrl}/api/auth/sign-in/google?callbackURL=${encodeURIComponent(callbackURL)}`;
window.location.href = oauthUrl;
```

This should trigger the OAuth flow directly through Better Auth's OAuth endpoint.

### Testing the Fix

1. Open the browser console (F12)
2. Click the Google Sign-In button
3. Check the console for these logs:
   - `[AUTH] Starting OAuth flow with google`
   - `[AUTH] Redirecting to OAuth URL`
4. The browser should navigate to Google's OAuth consent page

### Alternative Solutions

If the direct navigation doesn't work, try:

1. **Manual OAuth URL Construction**:
```typescript
const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent('http://localhost:8081/api/auth/callback/google')}&` +
  `response_type=code&` +
  `scope=openid%20email%20profile`;

window.location.href = googleOAuthUrl;
```

2. **Check CORS Configuration**:
Ensure the auth API handler includes proper CORS headers for OAuth redirects.

3. **Debug Better Auth OAuth Flow**:
Add more logging in `/app/api/auth/[...auth]+api.ts` to see what's happening during the OAuth initiation.

### Common Issues

1. **Mismatched Redirect URIs**: The redirect URI in the request must exactly match one configured in Google Console
2. **Missing OAuth Scopes**: Ensure the required scopes are included in the OAuth request
3. **Browser Blocking Redirects**: Some browser extensions or settings might block OAuth redirects
4. **Invalid Client Configuration**: Double-check that the client ID and secret are correct and not expired

### Next Steps

If the issue persists:
1. Check the Network tab in browser DevTools to see the OAuth request/response
2. Look for any error messages in the response body
3. Verify that Better Auth is properly installed and configured
4. Test with a different OAuth provider to isolate the issue