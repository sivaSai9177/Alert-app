# Mobile OAuth Fix - HTML Not Found Error

**Date**: February 3, 2025  
**Issue**: "HTML not found" error on mobile after Google OAuth  
**Severity**: High - Blocked mobile OAuth authentication  

## 🐛 Bug Description

When attempting Google OAuth on mobile (iOS/Android), users encountered an "HTML not found" error after completing authentication. The logs showed:
- OAuth flow initiated successfully
- Redirect URI using deprecated Expo proxy: `https://auth.expo.io/@anonymous/expo-fullstack-starter/auth/callback/google`
- Browser opened for authentication
- After auth, "HTML not found" error displayed

## 🔍 Root Cause Analysis

### 1. **Deprecated Expo Auth Proxy**
The app was using `auth.expo.io` proxy service which is now deprecated:
```typescript
// Deprecated approach
return 'https://auth.expo.io/@anonymous/expo-fullstack-starter/auth/callback/google';
```

### 2. **Expo Go Limitations**
OAuth with custom URI schemes cannot work in Expo Go - requires a development build.

### 3. **Redirect URI Mismatch**
The hardcoded redirect URI didn't match the app's actual scheme configuration.

## 🔧 Solution Implementation

### 1. **Updated Redirect URI Configuration**
```typescript
// Before (deprecated proxy)
return 'https://auth.expo.io/@anonymous/expo-fullstack-starter/auth/callback/google';

// After (direct app scheme)
return AuthSession.makeRedirectUri({ 
  useProxy: false,
  scheme: 'expo-starter', // Match app.json scheme
  path: 'auth-callback'
});
```

### 2. **Added Expo Go Detection**
```typescript
const isExpoGo = Platform.OS !== 'web' && !global.expo?.modules?.ExpoDevice?.isDevice;

// Show helpful message in Expo Go
if (!request && !global.expo?.modules?.ExpoDevice?.isDevice) {
  showErrorAlert(
    "Development Build Required", 
    "Google OAuth requires a development build. You cannot use Expo Go for OAuth authentication.\n\nPlease create a development build:\neas build --profile development"
  );
}
```

### 3. **Visual Feedback for Expo Go Users**
- Button shows "OAuth requires dev build" instead of "Continue with Google"
- Button is grayed out to indicate it's not functional
- Clear error message when tapped

## ✅ Configuration Steps

### 1. **Google Cloud Console**
Add these redirect URIs to your OAuth client:
```
expo-starter://auth-callback
expo-starter://
com.yourcompany.app://
```

### 2. **Create Development Build**
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Create development builds
eas build --profile development --platform ios
eas build --profile development --platform android
```

### 3. **Environment Variables**
Ensure these are set:
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 📚 Key Learnings

1. **Expo Go Limitations**: OAuth requires custom URI schemes, not supported in Expo Go
2. **Deprecated Services**: Always check for deprecated Expo services
3. **Development Builds**: Essential for testing OAuth and other native features
4. **Clear User Feedback**: Detect environment and show appropriate messages

## 🚀 Testing Guide

### For Development (Expo Go)
- Shows disabled button with "OAuth requires dev build" message
- Displays alert explaining the limitation

### For Production (Development Build)
1. Install development build on device
2. Tap "Continue with Google"
3. Complete Google authentication
4. App receives callback at `expo-starter://auth-callback`
5. Navigates to profile completion or home

## 📊 Impact

- **Users Affected**: All mobile users attempting OAuth
- **Duration**: Since initial implementation
- **Resolution**: Requires development build for full functionality
- **Workaround**: Use email/password auth in Expo Go

## 🔗 Related Files

- `/components/GoogleSignInButton.tsx` - Updated OAuth implementation
- `/app.json` - Scheme configuration
- `/docs/MOBILE_OAUTH_SETUP_GUIDE.md` - Setup guide
- `/api/auth/google-mobile-callback+api.ts` - Mobile callback handler