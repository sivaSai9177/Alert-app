# 🌍 Environment Setup Guide

## Overview
This guide explains how to properly configure environments for all build types: Expo Go, Development, Preview, and Production.

## 🚨 Quick Fix for Your Current Issue

The build is failing because it's trying to use a development client URL. Here's how to fix it:

### For Expo Go (Immediate Testing)
```bash
# 1. Setup environment for Expo Go
bun setup:env:expo

# 2. Start with Expo Go
bun expo:go

# 3. In the terminal, press 'i' for iOS
# This will open in Expo Go app, not development client
```

### For Development Build
```bash
# 1. Build development client first
bunx expo run:ios --device "iPhone 15 Pro"

# 2. Then use regular commands
bun ios
```

## 📋 Environment Configuration

### Environment Files Created
- `.env.local` - Your local secrets (not committed)
- `.env.development` - Development settings
- `.env.preview` - Preview/staging settings
- `.env.production` - Production settings

### Key Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `EXPO_PUBLIC_API_URL` | API endpoint | `http://192.168.1.101:8081` |
| `EXPO_PUBLIC_ENVIRONMENT` | Current environment | `development`, `preview`, `production` |
| `EXPO_PUBLIC_DEBUG_MODE` | Enable debug features | `true` or `false` |

## 🛠️ Setup Commands

### Automatic Setup
```bash
# Setup for different environments
bun setup:env:dev      # Development builds
bun setup:env:preview  # Preview builds
bun setup:env:expo     # Expo Go
```

### Manual IP Configuration
If automatic IP detection fails:

1. Find your IP:
   ```bash
   # macOS
   ipconfig getifaddr en0

   # Or
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Update `.env.development`:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:8081
   ```

## 📱 Platform-Specific Configuration

### iOS Simulator
- Can use `localhost` or `127.0.0.1`
- No special configuration needed

### Android Emulator
- Must use `10.0.2.2` instead of localhost
- Update `.env.development`:
  ```
  EXPO_PUBLIC_API_URL=http://10.0.2.2:8081
  ```

### Physical Device
- Must use your computer's IP address
- Device must be on same network
- Update with your IP:
  ```
  EXPO_PUBLIC_API_URL=http://192.168.1.101:8081
  ```

## 🚀 Complete Workflow

### 1. Expo Go Development
```bash
# Setup environment
bun setup:env:expo

# Start Expo Go
bun expo:go

# Press 'i' for iOS or 'a' for Android
```

### 2. Development Build
```bash
# Setup environment
bun setup:env:dev

# First time - build client
bunx expo run:ios

# Subsequent runs
bun ios
```

### 3. Preview Build
```bash
# Setup environment
bun setup:env:preview

# Build preview
bun preview:ios:local

# Run preview
bun preview:run:ios
```

## 🔧 Troubleshooting

### "Device has no app to handle URI"
This means you're trying to open a development client that doesn't exist.

**Solution**:
```bash
# Use Expo Go instead
bun expo:go

# Or build development client first
bunx expo run:ios
```

### "Cannot connect to API"
Your API URL is incorrect for your device.

**Solution**:
```bash
# Update environment
bun setup:env:expo

# Check your IP
ifconfig | grep "inet "
```

### Build Failures
Often caused by missing environment variables.

**Solution**:
1. Check EAS dashboard for build logs
2. Ensure all required env vars are in eas.json
3. Use correct profile: `development`, `preview`, or `production`

## 📊 Environment Matrix

| Build Type | Command | Dev Menu | OAuth | API URL |
|------------|---------|----------|-------|---------|
| Expo Go | `bun expo:go` | ✅ | ❌ | Local IP |
| Dev Build | `bun ios` | ✅ | ✅ | Local IP |
| Preview | `bun preview:ios` | ❌ | ✅ | Staging |
| Production | `eas build -p ios` | ❌ | ✅ | Production |

## 🎯 Best Practices

1. **Always run setup before building**:
   ```bash
   bun setup:env:dev && bun ios
   ```

2. **Use correct build profile**:
   - `development` - For dev builds with dev client
   - `preview` - For testing without dev menu
   - `production` - For App Store

3. **Keep environments separate**:
   - Don't mix production secrets in dev
   - Use different OAuth clients per environment

4. **For team development**:
   - Share `.env.*.template` files
   - Never commit `.env.local`
   - Document required variables

## 📝 Quick Reference

```bash
# Expo Go (no build needed)
bun setup:env:expo && bun expo:go

# Development (after building client)
bun setup:env:dev && bun ios

# Preview build
bun setup:env:preview && bun preview:ios:local

# Check current environment
echo $EXPO_PUBLIC_API_URL
```

## 🆘 Need Help?

1. Check build logs: `eas build:list`
2. View detailed logs: Click build link in EAS dashboard
3. Clear cache: `expo start --clear`
4. Reset everything: `watchman watch-del-all && rm -rf node_modules && bun install`