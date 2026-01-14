# Mobile OAuth Setup Guide

## Overview

This guide explains how to properly configure Google OAuth for mobile apps using Expo AuthSession without the deprecated proxy service.

## Key Changes

### 1. **Stop Using Expo Auth Proxy**

The `auth.expo.io` proxy service is deprecated. We've updated the redirect URI configuration:

```typescript
// Before (deprecated)
return 'https://auth.expo.io/@anonymous/expo-fullstack-starter/auth/callback/google';

// After (direct scheme)
return AuthSession.makeRedirectUri({ 
  useProxy: false,
  scheme: 'expo-starter',
  path: 'auth-callback'
});
```

### 2. **Redirect URI Format**

For mobile, the redirect URI will be:
- iOS: `expo-starter://auth-callback`
- Android: `expo-starter://auth-callback`

### 3. **Google Cloud Console Configuration**

You need to add these redirect URIs to your Google OAuth client:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add the following Authorized redirect URIs:
   ```
   expo-starter://auth-callback
   expo-starter://
   com.yourcompany.app://
   ```

### 4. **Testing Requirements**

- **Cannot use Expo Go**: OAuth requires a development build
- **Create a development build**:
  ```bash
  eas build --profile development --platform ios
  eas build --profile development --platform android
  ```

### 5. **Code Updates**

The GoogleSignInButton component now:
- Uses `useProxy: false`
- Specifies the app scheme explicitly
- Handles the OAuth response directly in the component

### 6. **OAuth Flow on Mobile**

1. User taps "Continue with Google"
2. Opens browser with Google OAuth
3. User completes authentication
4. Google redirects to `expo-starter://auth-callback`
5. App receives the authorization code
6. App sends code to backend `/api/auth/google-mobile-callback`
7. Backend exchanges code for tokens and creates session
8. App navigates to profile completion or home

## Troubleshooting

### "HTML not found" Error
This occurs when:
- Using the deprecated proxy service
- Redirect URI not properly configured in Google Console
- Trying to use Expo Go instead of a development build

### Solution
1. Use development build
2. Set `useProxy: false`
3. Configure redirect URIs in Google Console
4. Ensure app scheme matches in all places

## Environment Variables

Make sure these are set:
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Testing Locally

1. Start the development server:
   ```bash
   bun start
   ```

2. Use a development build (not Expo Go)

3. The redirect URI will be logged in the console when you tap the Google button

4. Make sure your local IP is in the allowedOrigins in app.json