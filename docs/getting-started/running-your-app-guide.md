# 📱 Complete Guide: Running Your Expo App

## Overview
There are multiple ways to run your Expo app, each serving different purposes:

1. **Expo Go** - Quick development testing (limited features)
2. **Development Build** - Full features with dev menu
3. **Preview Build** - Production-like testing
4. **Production Build** - App Store ready

## 🚀 Quick Start Commands

### For Immediate Testing (Expo Go)
```bash
# Run in Expo Go on iOS Simulator
bun expo:ios

# Run in Expo Go on Android Emulator  
bun expo:android

# Start server and scan QR code with Expo Go app
bun expo:go
```

### For Development (with all features)
```bash
# iOS development
bun ios

# Android development
bun android
```

### For Preview Testing
```bash
# Build preview version (cloud)
bun preview:ios

# Build preview version (local - faster)
bun preview:ios:local

# Run latest preview build
bun preview:run:ios
```

## 📊 Comparison Table

| Feature | Expo Go | Dev Build | Preview Build | Production |
|---------|----------|-----------|---------------|------------|
| Quick Start | ✅ Instant | ❌ Needs build | ❌ Needs build | ❌ Needs build |
| Dev Menu | ✅ | ✅ | ❌ | ❌ |
| Hot Reload | ✅ | ✅ | ❌ | ❌ |
| Native Modules | ❌ Limited | ✅ | ✅ | ✅ |
| OAuth/Auth | ❌ Limited | ✅ | ✅ | ✅ |
| Performance | 🟡 Good | 🟡 Good | ✅ Fast | ✅ Fastest |
| Error Details | ✅ | ✅ | ✅ | ❌ |

## 🎯 When to Use Each Method

### Use Expo Go When:
- Testing UI changes quickly
- Developing new screens
- Testing basic functionality
- You don't need native modules

```bash
# Clear cache and run
bunx expo start --clear

# Then press 'i' for iOS or 'a' for Android
```

### Use Development Build When:
- Testing OAuth/social login
- Using native modules
- Need full app features
- Active development

```bash
# First time setup (builds locally)
bunx expo run:ios

# Subsequent runs
bun ios
```

### Use Preview Build When:
- Testing before release
- Sharing with testers
- Performance testing
- Final validation

```bash
# Option 1: Cloud build (no Xcode needed)
bun preview:ios

# Option 2: Local build (faster, needs Xcode)
bun preview:ios:local

# After build completes
bun preview:run:ios
```

## 🛠️ Setup Requirements

### For Expo Go
- Install Expo Go from App Store
- No additional setup needed

### For Development Builds
- Xcode installed (iOS)
- Android Studio (Android)
- Run once: `bunx expo run:ios`

### For Preview Builds
- EAS CLI: `npm install -g eas-cli`
- Expo account: `eas login`
- Apple Developer account (for App Store)

## 🔧 Troubleshooting

### "No code signing certificates"
This happens with `expo run:ios`. Solutions:
1. Open project in Xcode and select a team
2. Or use Expo Go instead: `bun expo:ios`

### "Device has no app to handle URI"
The development client isn't installed:
1. Run `bunx expo run:ios` once to install
2. Or use Expo Go: `bun expo:go`

### Can't see OAuth/Google Sign In
OAuth doesn't work in Expo Go. You need:
```bash
# Build development client
bunx expo run:ios

# Then run normally
bun ios
```

### Changes not showing
```bash
# Clear all caches
bunx expo start --clear

# For preview builds, you need to rebuild
bun preview:ios:local
```

## 📝 Complete Workflow Example

### 1. Initial Development (Expo Go)
```bash
# Start with Expo Go for quick iteration
bun expo:ios

# Make UI changes, test quickly
# Hot reload works automatically
```

### 2. Feature Development (Dev Build)
```bash
# When you need OAuth or native features
bunx expo run:ios  # First time only

# Then use
bun ios
```

### 3. Testing (Preview Build)
```bash
# Create preview build
bun preview:ios:local

# Install and test
bun preview:run:ios
```

### 4. Share with Testers
```bash
# Cloud build for testers
bun preview:ios

# Share link from EAS dashboard
```

## 🎉 Your Current Setup

Based on your configuration:
- ✅ Expo Go ready: `bun expo:ios`
- ✅ Dev builds configured
- ✅ Preview builds configured
- ✅ OAuth setup for dev/preview
- ✅ Settings icon in tab 3
- ✅ Logout error fixed

## 💡 Pro Tips

1. **Fastest Development**: Use Expo Go until you need native features
2. **OAuth Testing**: Requires dev or preview build
3. **Performance Testing**: Always use preview builds
4. **Clear Cache**: Add `--clear` when things act weird
5. **Multiple Simulators**: Specify device with `--device "iPhone 15"`

## 🚨 Important Notes

- **Expo Go Limitations**: No custom native modules, limited OAuth
- **Dev Build Required**: For Google Sign In, SecureStore, etc.
- **Preview vs Production**: Preview uses Release config but with debug endpoints
- **Simulator vs Device**: Some features only work on real devices

## Next Steps

1. For quick testing: `bun expo:ios`
2. For full features: `bunx expo run:ios` then `bun ios`
3. For release testing: `bun preview:ios:local`