# 🔐 Google OAuth Mobile Setup Guide

This document provides the complete setup for Google OAuth across all three platforms (Web, iOS, Android) using the current Google Console configuration.

## 📋 Current Google Console Configuration Analysis

### Current Client Configuration
**Client Type**: Web Application  
**Client ID**: `59100460814-lvqieq6hjuhvhe0t3gue41cpbp499kr4.apps.googleusercontent.com`  
**Client Secret**: `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`  

### Current Authorized JavaScript Origins
✅ **KEEP**: `http://localhost:8081` - Required for web development

### Current Authorized Redirect URIs

#### ✅ **KEEP - Valid URIs**:
1. `http://localhost:8081/api/auth/callback/google` - Web development callback
2. `https://auth.expo.io/@anonymous/expo-fullstack-starter/auth/callback/google` - Expo Go fallback
3. `https://auth.expo.io/@siva9177/expo-starter/auth/callback/google` - Expo managed OAuth
4. `https://auth.expo.io/@siva9177/expo-starter` - Expo base callback

#### ❌ **REMOVE - Invalid URI**:
5. `expo-starter://auth-callback` - **Invalid** (Google doesn't support custom schemes for web clients)

## 🔧 Required Google Console Changes

### 1. Remove Invalid Redirect URI
**Action**: Remove `expo-starter://auth-callback` from the current web client
**Reason**: Google OAuth web clients don't support custom URI schemes

### 2. Add Additional URIs for Network Development
**Add to Authorized JavaScript Origins**:
```
http://localhost:8081
http://localhost:8082
http://192.168.1.104:8081
http://192.168.1.104:8082
```

**Add to Authorized Redirect URIs**:
```
http://localhost:8081/api/auth/callback/google
http://localhost:8082/api/auth/callback/google
http://192.168.1.104:8081/api/auth/callback/google
http://192.168.1.104:8082/api/auth/callback/google
```

### 3. Keep Existing Expo URIs
These are required for Expo's OAuth proxy system:
```
https://auth.expo.io/@anonymous/expo-fullstack-starter/auth/callback/google
https://auth.expo.io/@siva9177/expo-starter/auth/callback/google
https://auth.expo.io/@siva9177/expo-starter
```

## 📱 Mobile OAuth Strategy

### For Development Builds
Mobile development builds use **Expo's OAuth proxy system**, not custom URI schemes with Google directly. The flow is:

1. **Mobile App** → Initiates OAuth
2. **Google OAuth** → Redirects to Expo proxy (`https://auth.expo.io/...`)
3. **Expo Proxy** → Handles OAuth completion and redirects to app
4. **Mobile App** → Receives OAuth result via Expo's system

### Why This Works
- Uses the **same web client** for all platforms
- **No custom URI schemes** needed in Google Console
- **Expo handles** the mobile-specific redirect logic
- **Consistent OAuth flow** across web and mobile

## 🌐 Environment Variables Setup

### Complete .env.local Configuration

```env
# Database Configuration
DATABASE_URL=your_postgresql_connection_string

# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-key-minimum-32-characters
BETTER_AUTH_BASE_URL=http://localhost:8081/api/auth
BETTER_AUTH_URL=http://localhost:8081

# Google OAuth - Single Web Client for All Platforms
GOOGLE_CLIENT_ID=59100460814-lvqieq6hjuhvhe0t3gue41cpbp499kr4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Expo Public Variables (accessible in the app)
EXPO_PUBLIC_API_URL=http://192.168.1.104:8081
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=59100460814-lvqieq6hjuhvhe0t3gue41cpbp499kr4.apps.googleusercontent.com

# Development Network (update with your local IP)
LOCAL_IP=192.168.1.104

# App Configuration
EXPO_PUBLIC_APP_NAME=Full-Stack Expo Starter
EXPO_PUBLIC_APP_SCHEME=expo-starter
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug

# Optional: Additional OAuth Providers
# APPLE_CLIENT_ID=your-apple-client-id
# APPLE_CLIENT_SECRET=your-apple-client-secret
# MICROSOFT_CLIENT_ID=your-microsoft-client-id
# MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

## 📋 Final Google Console Configuration

### Authorized JavaScript Origins (4 entries)
```
http://localhost:8081
http://localhost:8082
http://192.168.1.104:8081
http://192.168.1.104:8082
```

### Authorized Redirect URIs (7 entries)
```
http://localhost:8081/api/auth/callback/google
http://localhost:8082/api/auth/callback/google
http://192.168.1.104:8081/api/auth/callback/google
http://192.168.1.104:8082/api/auth/callback/google
https://auth.expo.io/@anonymous/expo-fullstack-starter/auth/callback/google
https://auth.expo.io/@siva9177/expo-starter/auth/callback/google
https://auth.expo.io/@siva9177/expo-starter
```

## 🚀 Platform-Specific OAuth Flows

### Web Development (localhost:8081)
```
User clicks "Sign in with Google"
↓
Redirects to Google OAuth
↓
User authenticates with Google
↓
Google redirects to: http://localhost:8081/api/auth/callback/google
↓
Better Auth processes callback
↓
User logged in to web app
```

### Mobile Development Build
```
User taps "Sign in with Google"
↓
App opens browser/WebView with Google OAuth
↓
User authenticates with Google
↓
Google redirects to: https://auth.expo.io/@siva9177/expo-starter/auth/callback/google
↓
Expo proxy processes OAuth and redirects to mobile app
↓
App receives OAuth result via Expo's linking system
↓
App fetches session via tRPC
↓
User logged in to mobile app
```

### Production Deployment
For production, you'll need to:
1. Update redirect URIs to your production domain
2. Add production JavaScript origins
3. Update environment variables for production API URLs

## 🔧 Implementation Verification

### Auth Client Configuration
The auth client is already properly configured to use the web client for all platforms:

```typescript
// lib/auth/auth-client.ts
export const authClient = createAuthClient({
  baseURL: `${BASE_URL}/api/auth`,
  plugins: [
    expoClient({
      scheme: "expo-starter", // Matches app.json
      storagePrefix: "better-auth",
      storage: Platform.OS === 'web' ? webStorage : mobileStorage,
    }),
  ],
});
```

### Better Auth Configuration
The server auth configuration uses the single web client:

```typescript
// lib/auth/auth.ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID, // Web client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Web client secret
    scope: ["openid", "email", "profile"],
  },
}
```

## ✅ Setup Checklist

Before building mobile development builds:

- [ ] Remove `expo-starter://auth-callback` from Google Console
- [ ] Add additional JavaScript origins for network development
- [ ] Add additional redirect URIs for network development
- [ ] Create `.env.local` with the configuration above
- [ ] Verify app.json has correct scheme: `expo-starter`
- [ ] Confirm owner in app.json: `siva9177`
- [ ] Test web OAuth flow works on localhost:8081

## 🎯 Why This Approach Works

1. **Single Client**: One Google OAuth client works for all platforms
2. **Expo Proxy**: Handles mobile OAuth redirects seamlessly
3. **No Custom Schemes**: Google Console doesn't need custom URI schemes
4. **Consistent Flow**: Same OAuth logic across web and mobile
5. **Development Ready**: Works in both Expo Go and development builds

## 🚨 Important Notes

- **Expo Go Limitation**: OAuth may not work in Expo Go due to bundle ID restrictions
- **Development Builds**: Required for full mobile OAuth functionality
- **Network Development**: Use your local IP address in redirect URIs
- **Security**: Never commit OAuth secrets to version control

---

**Next Steps**: Apply the Google Console changes above, then create development builds for mobile testing.