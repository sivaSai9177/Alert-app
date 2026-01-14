# iOS Physical Device Network Setup Guide

## Problem
iOS physical devices cannot connect to `localhost` - they need your development machine's actual network IP address. When you see "Network request failed" errors, it's because the app is trying to reach `localhost:8081` which refers to the iOS device itself, not your computer.

## Solutions

### Solution 1: Use the iOS-Specific Script (Recommended)
```bash
bun run ios:healthcare
```

This script:
- Automatically detects your network IP address
- Sets up all required environment variables
- Configures the API endpoints correctly
- Starts the healthcare demo with proper networking

### Solution 2: In-App Configuration
1. Start the app with any command (e.g., `bun run local:healthcare`)
2. If you can get past the login screen, navigate to Settings
3. Look for "Developer Tools" section (only visible on iOS in dev mode)
4. Tap "Configure iOS Device API URL"
5. Either:
   - Tap "Auto-Detect IP" to automatically find your network IP
   - Or manually enter your computer's IP (e.g., `http://192.168.1.9:8081`)
6. Save the configuration
7. Restart the app

### Solution 3: Manual Environment Setup
```bash
# Find your IP address
# On macOS:
ipconfig getifaddr en0  # or en1 for some networks

# Export the IP
export REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.9  # Replace with your IP

# Start the app
bun run local:healthcare
```

## How It Works

### Runtime Configuration System
The app now includes a runtime configuration system (`lib/core/runtime-config.ts`) that:
- Detects network configuration at startup
- Persists settings between app restarts
- Can be updated without rebuilding the app
- Prioritizes configurations in this order:
  1. Runtime config (persisted)
  2. Expo config extra (from expo.config.js)
  3. Environment variables
  4. Auto-detection from manifest

### Environment Detection
The unified environment system (`lib/core/unified-env.ts`) checks multiple sources:
1. Runtime configuration (highest priority for iOS)
2. Expo configuration extras
3. Environment variables
4. Expo manifest URLs
5. React Native packager hostname

## Troubleshooting

### Still Getting "Network request failed"?
1. **Check WiFi**: Ensure both your iPhone and computer are on the same network
2. **Firewall**: Make sure your firewall allows connections on port 8081
3. **IP Address**: Verify the IP address is correct (it changes when you switch networks)
4. **Clear Cache**: Try clearing the Expo cache with `expo start -c`
5. **Restart**: Sometimes a full restart of Expo helps

### Debug Information
The app logs extensive debug information. Check the logs for:
- `[ENV] iOS Environment Detection` - Shows what the app detected
- `[UNIFIED ENV] Configuration` - Shows the final configuration
- `[AUTH_CLIENT] Auth client initialized` - Shows the auth endpoint being used

### Common Issues
- **Wrong IP**: If you switch WiFi networks, your IP changes
- **Localhost URLs**: Some parts of the app might still use localhost (being fixed)
- **Cached Config**: Old configuration might be cached - use the in-app tool to update

## Architecture Details

### Files Involved
- `/lib/core/runtime-config.ts` - Runtime configuration management
- `/lib/core/unified-env.ts` - Environment detection and URL resolution
- `/expo.config.js` - Dynamic Expo configuration
- `/app/dev-config.tsx` - In-app configuration UI
- `/scripts/ios-healthcare.sh` - iOS-specific startup script

### Configuration Priority
1. **Runtime Config** (stored in AsyncStorage)
2. **Expo Config Extra** (from expo.config.js)
3. **Environment Variables** (EXPO_PUBLIC_API_URL)
4. **Auto-Detection** (from Expo manifest)
5. **Fallback** (localhost)

This multi-layered approach ensures the app can always find a working configuration, even if one method fails.