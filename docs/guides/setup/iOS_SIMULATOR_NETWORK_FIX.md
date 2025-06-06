# iOS Simulator Network Timeout Fix

## Problem
The iOS simulator shows tRPC requests timing out after 30 seconds when trying to reach the API at different IP addresses (e.g., 192.168.1.18 and 192.168.1.101).

## Root Cause
When your local network IP address changes (e.g., when reconnecting to WiFi or changing networks), the app may still try to use the old IP address from:
1. Cached environment variables
2. Metro bundler cache
3. Expo's cached manifest

## Solution

### 1. Quick Fix Script
Run the provided network fix script:
```bash
bun run scripts/fix-mobile-network.ts
```

This script will:
- Detect your current local IP address
- Update the EXPO_PUBLIC_API_URL in .env
- Test the API connection
- Provide next steps

### 2. Manual Fix
If the script doesn't work, manually update your IP:

1. Find your current IP:
   ```bash
   ipconfig getifaddr en0
   # or
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Update `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_IP:8081
   ```

3. Restart Expo with cache clear:
   ```bash
   bun run ios --clear
   ```

### 3. Debug Panel
The app includes an EnhancedDebugPanel that provides comprehensive debugging information including network status and API connectivity.

## How the App Determines API URL

The app tries to find the API URL in this order:
1. **EXPO_PUBLIC_API_URL** environment variable (most reliable)
2. Dynamic detection from Expo's `hostUri`
3. Fallback to `localhost:8081`

## Common Issues

### Issue: Old IP Address Cached
**Symptoms**: App tries to connect to old IP even after updating .env
**Solution**: 
```bash
# Clear all caches
bun run ios --clear
# Or reset the simulator
# Device → Erase All Content and Settings
```

### Issue: API Not Accessible
**Symptoms**: Connection test fails even with correct IP
**Check**:
1. Is Expo running? (`bun run ios`)
2. Is port 8081 accessible? (`lsof -i :8081`)
3. Firewall settings allowing local connections?
4. Are you on the same WiFi network?

### Issue: Dynamic IP Detection Not Working
**Symptoms**: App falls back to localhost instead of using network IP
**Solution**: Always set EXPO_PUBLIC_API_URL explicitly in .env

## Prevention

1. **Use Static IP**: Configure your router to assign a static IP to your development machine
2. **Use Script**: Run the fix script whenever you change networks
3. **Monitor Network**: Use the EnhancedDebugPanel to catch issues early

## API URL Configuration Reference

```typescript
// lib/core/config.ts
export function getApiUrlSync(): string {
  // Web uses window.location.origin
  if (Platform.OS === "web") {
    return window.location.origin;
  }
  
  // Mobile checks env variable first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Then tries dynamic detection
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostname = hostUri.split(":")[0];
    return `http://${hostname}:8081`;
  }
  
  // Finally falls back
  return "http://localhost:8081";
}
```

## Testing Connection

You can test the API connection manually:
```bash
# Test tRPC endpoint
curl -X GET "http://YOUR_IP:8081/api/trpc/auth.getSession?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D"

# Should return:
# [{"result":{"data":null}}]
```

## Related Documentation
- [Mobile Development Setup](./MOBILE_ENVIRONMENT_SOLUTION.md)
- [Environment Configuration](./ENVIRONMENT_SETUP_GUIDE.md)
- [Running Your App](./RUNNING_YOUR_APP_GUIDE.md)