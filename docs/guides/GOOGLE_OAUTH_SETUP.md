# Google OAuth Setup for Full-Stack Expo Starter

## Updated Implementation: Using Expo's Authentication Proxy

The app now properly uses Expo's authentication proxy service for mobile devices, which resolves the Google OAuth redirect URI restrictions.

### Required Redirect URIs in Google Console

You need to add these redirect URIs to your Google OAuth client:

#### 1. For Web Development (Localhost)
- `http://localhost:8081/api/auth/callback/google`

#### 2. For Mobile Development (Expo Auth Proxy)
- `https://auth.expo.io/@anonymous/expo-fullstack-starter/auth/callback/google`

**Important Notes:**
- Google OAuth requires valid web domains (ending in .com, .org, etc.)
- Custom app schemes like `my-expo://` are NOT supported by Google OAuth
- Expo's AuthSession automatically uses the auth proxy for mobile OAuth flows
- The mobile redirect URI will be generated automatically by Expo's AuthSession

### How to Configure:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add both redirect URIs to "Authorized redirect URIs"
6. Save

### Current Implementation Details:

#### Web Flow:
- Uses direct Better Auth API calls to `/api/auth/sign-in/social`
- Redirect URI: `http://localhost:8081/api/auth/callback/google`

#### Mobile Flow:
- Uses Expo's AuthSession with `makeRedirectUri()` 
- Redirect URI: Expo proxy URL (e.g., `https://auth.expo.io/@anonymous/expo-fullstack-starter/auth/callback/google`)
- The proxy handles the OAuth flow and redirects back to the app

### Benefits:
- ✅ Complies with Google's redirect URI requirements (no private IPs)
- ✅ Works on physical devices without localhost issues
- ✅ Uses Expo's secure proxy service for mobile OAuth
- ✅ Maintains separate flows for web and mobile platforms
