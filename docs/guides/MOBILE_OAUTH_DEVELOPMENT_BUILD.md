# Mobile OAuth Development Build Guide

**Created**: February 3, 2025  
**Purpose**: Step-by-step guide for creating development builds to test Google OAuth on mobile devices

## 🎯 Why Development Builds are Required

Google OAuth on mobile requires custom URI schemes (like `expo-starter://auth-callback`), which are not supported in Expo Go. You must create a development build to test OAuth functionality.

## 📋 Prerequisites

1. **Expo Account**
   ```bash
   # Create account at https://expo.dev/
   # Login via CLI
   npx expo login
   ```

2. **EAS CLI Installation**
   ```bash
   # Install globally
   npm install -g eas-cli
   
   # Verify installation
   eas --version
   ```

3. **Environment Setup**
   - iOS: Xcode installed (Mac only)
   - Android: Android Studio or Android SDK

## 🚀 Step-by-Step Setup

### 1. Configure EAS Build

The project already includes `eas.json` with proper configuration:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

### 2. Configure Project

```bash
# Initialize EAS in your project
eas build:configure

# This will:
# - Create/update eas.json
# - Add project ID to app.json
# - Set up build profiles
```

### 3. Create Development Builds

#### For iOS (Mac Required)
```bash
# Create iOS development build
eas build --profile development --platform ios

# Follow the prompts:
# - Select "Build for development"
# - Choose provisioning profile or create new
# - Wait for build to complete (10-20 minutes)
```

#### For Android
```bash
# Create Android development build
eas build --profile development --platform android

# Follow the prompts:
# - Select keystore option (create new for development)
# - Wait for build to complete (10-20 minutes)
```

### 4. Install Development Build

#### iOS Installation
1. Once build completes, you'll receive a QR code or link
2. Open link on iOS device
3. Install via TestFlight or direct install
4. Trust developer certificate in Settings > General > Device Management

#### Android Installation
1. Download APK from build link
2. Enable "Install from Unknown Sources" in device settings
3. Install APK directly

## 🔧 Testing OAuth Flow

### 1. Start Development Server
```bash
# Start with clear cache
bun start --clear

# You'll see:
# › Metro waiting on exp://192.168.1.XXX:8081
# › Using development build
```

### 2. Open Development Build
- Launch the installed development build app
- It will connect to your Metro server automatically
- If not, shake device and enter server URL manually

### 3. Test OAuth Flow
1. Navigate to login screen
2. Tap "Continue with Google"
3. Complete authentication in browser
4. App should receive callback at `expo-starter://auth-callback`
5. Navigate to profile completion or home

## 🐛 Troubleshooting

### "OAuth requires dev build" Message
This appears when using Expo Go. Solution: Use development build.

### Build Failures

#### iOS Certificate Issues
```bash
# Clear credentials and retry
eas credentials:configure --platform ios --clear
```

#### Android Keystore Issues
```bash
# Generate new keystore
eas credentials:configure --platform android --clear
```

### OAuth Redirect Issues

1. **Verify Google Console Configuration**
   - Add `expo-starter://auth-callback` to authorized redirect URIs
   - Add your bundle ID schemes

2. **Check app.json**
   ```json
   {
     "expo": {
       "scheme": "expo-starter",
       "ios": {
         "bundleIdentifier": "com.yourcompany.app"
       }
     }
   }
   ```

3. **Verify Redirect URI in Code**
   ```typescript
   // Should output: expo-starter://auth-callback
   console.log(AuthSession.makeRedirectUri({ 
     useProxy: false,
     scheme: 'expo-starter',
     path: 'auth-callback'
   }));
   ```

## 📱 Local Development Tips

### Using Local API
```bash
# Set your local IP in .env
LOCAL_IP=192.168.1.XXX

# The app will use this for API calls
```

### Debug Mode
The development build includes enhanced debugging:
- Shake device to open developer menu
- View console logs in terminal
- Use React DevTools for debugging

### Hot Reload
- Enabled by default in development builds
- Shake device > "Enable Fast Refresh" if disabled

## 🚢 Moving to Production

When ready for production OAuth:

1. **Update Redirect URIs**
   ```typescript
   // Add production schemes
   const redirectUri = __DEV__ 
     ? 'expo-starter://auth-callback'
     : 'com.yourcompany.app://auth-callback';
   ```

2. **Configure Production Build**
   ```bash
   eas build --profile production --platform all
   ```

3. **Update Google Console**
   - Add production bundle IDs
   - Add production redirect URIs
   - Verify OAuth consent screen

## 📚 Additional Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google OAuth with Expo](https://docs.expo.dev/guides/google-authentication/)
- [Custom URI Schemes](https://docs.expo.dev/guides/linking/)

## ✅ Checklist

Before testing OAuth:
- [ ] EAS CLI installed and logged in
- [ ] Development build created and installed
- [ ] Google Console configured with redirect URIs
- [ ] Environment variables set (.env file)
- [ ] Metro server running
- [ ] Device connected to same network as development machine

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Expo Go" limitation | Use development build |
| "HTML not found" error | Update to direct scheme, no proxy |
| Build fails | Clear credentials, check certificates |
| OAuth callback fails | Verify redirect URI configuration |
| Can't connect to Metro | Check IP address and network |

---

**Note**: This guide is specifically for testing Google OAuth during development. For production apps, you'll need to properly configure your app store listings and OAuth consent screens.