# Google OAuth Fix Guide

## Issue Summary
When clicking the Google Sign-In button, Expo Router intercepts the OAuth URL (`/api/auth/sign-in/provider/google`) and shows "This screen does not exist" instead of redirecting to Google's OAuth page.

## Root Cause
Expo Router's file-based routing system is intercepting API routes as client-side routes. The OAuth endpoint is an API route that should bypass Expo Router entirely.

## Solution

### 1. Use Better Auth Client (Implemented)
The `GoogleSignInButton` component has been updated to use the Better Auth client's `signIn.social()` method instead of direct navigation:

```typescript
// Updated implementation in GoogleSignInButton.tsx
const result = await defaultAuthClient.signIn.social({
  provider: 'google',
  callbackURL,
});
```

This approach:
- Uses Better Auth's built-in OAuth flow
- Automatically handles redirects without Expo Router interference
- Maintains proper session management

### 2. Verify Environment Configuration

Ensure your `.env.local` file has the correct Google OAuth credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=same-as-GOOGLE_CLIENT_ID
```

### 3. Check Google Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID

#### Authorized JavaScript Origins
Add these origins:
- `http://localhost:8081`
- `http://localhost:8082`
- `http://127.0.0.1:8081`
- `http://127.0.0.1:8082`
- Your local IP: `http://192.168.x.x:8081` (for mobile testing)

#### Authorized Redirect URIs
Add these redirect URIs:
- `http://localhost:8081/api/auth/callback/google`
- `http://localhost:8081/auth-callback`
- `http://127.0.0.1:8081/api/auth/callback/google`
- `http://127.0.0.1:8081/auth-callback`
- `http://192.168.x.x:8081/api/auth/callback/google` (your local IP)
- `http://192.168.x.x:8081/auth-callback` (your local IP)

### 4. Test the Fix

1. Restart the development server:
   ```bash
   bun run dev
   ```

2. Open the browser console (F12)

3. Click the Google Sign-In button

4. Check for these logs:
   - `[AUTH] Starting OAuth with Better Auth client`
   - `[AUTH] Initiating OAuth with Better Auth client`

5. You should be redirected to Google's OAuth consent page

### 5. Troubleshooting

If the issue persists:

1. **Check Network Tab**: 
   - Look for the OAuth request in the Network tab
   - Verify it's going to the correct URL
   - Check the response status and headers

2. **Verify Better Auth is Running**:
   - Check that the auth endpoint returns a response: `http://localhost:8081/api/auth`
   - Look for any errors in the terminal running the dev server

3. **Clear Browser Cache**:
   - Sometimes cached redirects can cause issues
   - Clear cache and cookies for localhost

4. **Check CORS Headers**:
   - The auth API handler includes CORS headers
   - Verify they're being sent in the response

### 6. Alternative Solutions

If the Better Auth client approach doesn't work:

1. **Use a Proxy Route**: Create a dedicated API route that handles the OAuth redirect:
   ```typescript
   // app/api/oauth/google+api.ts
   export async function GET(request: Request) {
     const url = new URL(request.url);
     const callbackURL = url.searchParams.get('callbackURL');
     
     // Construct Google OAuth URL directly
     const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
       `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
       `redirect_uri=${encodeURIComponent('http://localhost:8081/api/auth/callback/google')}&` +
       `response_type=code&` +
       `scope=openid%20email%20profile&` +
       `state=${encodeURIComponent(callbackURL || '/')}`;
     
     return Response.redirect(googleOAuthUrl);
   }
   ```

2. **Use External Window**: Open OAuth in a new window/tab:
   ```typescript
   const oauthWindow = window.open(oauthUrl, '_blank');
   // Monitor the window for completion
   ```

### 7. Expected Behavior

When working correctly:
1. Click Google Sign-In button
2. Loading spinner appears on button
3. Browser redirects to Google's OAuth page
4. User signs in with Google
5. Google redirects back to `/api/auth/callback/google`
6. Better Auth processes the callback
7. User is redirected to `/auth-callback`
8. App checks session and navigates to home or profile completion

## Related Files

- `/components/GoogleSignInButton.tsx` - OAuth button component
- `/lib/auth/auth-client.ts` - Better Auth client configuration
- `/lib/auth/auth.ts` - Better Auth server configuration
- `/app/api/auth/[...auth]+api.ts` - Auth API handler
- `/app/auth-callback.tsx` - OAuth callback handler

## Additional Resources

- [Better Auth OAuth Documentation](https://www.better-auth.com/docs/authentication/social-sign-on)
- [Expo Router API Routes](https://docs.expo.dev/router/reference/api-routes/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)