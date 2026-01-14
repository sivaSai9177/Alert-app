# Google OAuth Test Instructions

## Manual Testing Steps

Since the automated tests show that the OAuth endpoint is returning HTML instead of redirecting, let's test the OAuth flow manually through the browser.

### Step 1: Open the App
1. Open your browser (Chrome recommended)
2. Navigate to: http://localhost:8081
3. Open Developer Tools (F12) and go to the Console tab

### Step 2: Navigate to Login
1. If you see the home screen, you should be redirected to the login page
2. Look for the "Continue with Google" button

### Step 3: Test OAuth Flow
1. Before clicking the button, clear the console
2. Click the "Continue with Google" button
3. Watch for console logs:
   - `[AUTH] Starting OAuth with Better Auth client`
   - `[AUTH] Initiating OAuth with Better Auth client`

### Step 4: Expected Behavior

**If OAuth is working correctly:**
- You should be redirected to Google's sign-in page (accounts.google.com)
- The URL should look like: `https://accounts.google.com/o/oauth2/v2/auth?client_id=...`
- After signing in, you'll be redirected back to the app

**If OAuth is NOT working:**
- The button will show a loading spinner
- You'll see "This screen does not exist" error
- Or the page will reload without redirecting to Google

### Step 5: Check Network Tab
1. Open Network tab in Developer Tools
2. Click the Google sign-in button
3. Look for requests to:
   - `/api/auth/sign-in/social`
   - `/api/auth/sign-in/provider/google`
4. Check the response status and headers

### Step 6: Console Debugging

Paste this in the browser console to test the auth client:

```javascript
// Check if auth client is available
if (window.authClient || window.defaultAuthClient) {
  console.log('✅ Auth client found');
  
  // Try to initiate OAuth
  const client = window.authClient || window.defaultAuthClient;
  console.log('Attempting OAuth...');
  
  client.signIn.social({
    provider: 'google',
    callbackURL: '/auth-callback'
  }).then(result => {
    console.log('OAuth result:', result);
  }).catch(error => {
    console.error('OAuth error:', error);
  });
} else {
  console.log('❌ Auth client not found in window');
}
```

### Troubleshooting

If OAuth is not working:

1. **Check Environment Variables**
   - Ensure `.env` file has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Restart the server after changing env variables

2. **Check Google Console**
   - Verify redirect URIs include:
     - `http://localhost:8081/api/auth/callback/google`
     - `http://localhost:8081/auth-callback`

3. **Check Browser Console Errors**
   - Look for CORS errors
   - Check for 404 errors on API routes
   - Look for JavaScript errors

4. **Check Server Logs**
   - Look for `[AUTH API]` logs in the terminal
   - Check for Better Auth initialization errors

### Current Status

Based on the tests:
- ✅ OAuth endpoints are accessible (returning 200)
- ✅ Environment variables are configured
- ❌ OAuth redirect is not happening (returns HTML instead)
- 🔍 Need to check if Better Auth is properly initialized

The issue appears to be that the OAuth endpoint is returning the Expo app HTML instead of initiating the OAuth flow. This suggests either:
1. The API route is not being properly handled by Better Auth
2. Expo Router is intercepting the API request
3. Better Auth is not configured correctly

### Next Steps

1. Test the OAuth flow manually in the browser
2. Check console and network logs
3. Report any errors you see
4. We can then debug based on the specific error