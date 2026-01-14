# 📱 Mobile Debugging Guide

## Fixed Issues

### 1. **Avatar Component Error** ✅
Fixed the "Cannot read property 'trim' of undefined" error:
```typescript
// Added null/undefined checks
if (!name || typeof name !== 'string') {
  return 'U'; // Default to 'U' for User
}
```

### 2. **Debug Console Logging** ✅
Fixed console logging with undefined data in debug.ts

### 3. **Added Mobile Debugger** ✅
New floating debug button (🐛) with comprehensive logging

## Using the Mobile Debugger

### Features
1. **Floating Debug Button** - Shows 🐛 in bottom right
2. **Log Filtering** - Filter by error, warn, info, debug
3. **Log Details** - Tap any log to see full details
4. **Clear/Export** - Clear logs or export to console
5. **Environment Info** - Shows current API URL and environment

### How to Use
1. The debug button appears automatically in development
2. Tap 🐛 to open the debug console
3. See all console logs with timestamps
4. Filter by log level
5. Tap any log for full details

## Debugging Commands

### Start with Debug Mode
```bash
# iOS with enhanced debugging
bun debug:ios

# Android with enhanced debugging
bun debug:android
```

### View Native Logs
```bash
# iOS logs (requires Xcode)
bun logs:ios

# Android logs (requires adb)
bun logs:android
```

### Using React Native Debugger
1. Install React Native Debugger:
   ```bash
   brew install react-native-debugger
   ```

2. Start the debugger:
   ```bash
   open "rndebugger://set-debugger-loc?host=localhost&port=8081"
   ```

3. In the app, shake device or press Cmd+D (iOS) / Cmd+M (Android)
4. Select "Debug with Chrome" or "Debug"

## Common Debugging Scenarios

### 1. Network Requests
```typescript
// The mobile debugger will show all network requests
console.log('[Network]', method, url, response.status);
```

### 2. State Changes
```typescript
// Track state changes
console.log('[State Update]', { 
  component: 'AuthStore',
  oldState: prevState,
  newState: currentState 
});
```

### 3. Navigation
```typescript
// Track navigation events
console.log('[Navigation]', {
  from: currentRoute,
  to: newRoute,
  params: routeParams
});
```

### 4. Errors
```typescript
// Errors are automatically highlighted in red
console.error('[Component Error]', error.message, error.stack);
```

## Using Flipper (Alternative)

1. Install Flipper Desktop: https://fbflipper.com/
2. Start your app with:
   ```bash
   bun ios
   ```
3. Flipper will auto-connect
4. Use plugins:
   - React DevTools
   - Network Inspector
   - Logs Viewer
   - Layout Inspector

## Performance Debugging

### React DevTools
```bash
# Install globally
npm install -g react-devtools

# Run standalone
react-devtools
```

### Performance Monitor
- Shake device → Show Perf Monitor
- Shows:
  - FPS (should be 60)
  - JS thread FPS
  - Memory usage
  - View count

## Remote Debugging

### For Physical Devices
1. Ensure device and computer on same network
2. Update API URL:
   ```bash
   bun setup:env:expo
   ```
3. Shake device → Debug Settings → Debug server host
4. Enter: `YOUR_IP:8081`

### Using Chrome DevTools
1. Open: http://localhost:8081/debugger-ui
2. Console shows all logs
3. Sources tab for breakpoints
4. Network tab for API calls

## Debugging Checklist

### Before Debugging
- [ ] Clear Metro cache: `expo start --clear`
- [ ] Check environment: `echo $EXPO_PUBLIC_API_URL`
- [ ] Verify device connection: `adb devices` or Xcode
- [ ] Enable debug mode in app

### During Debugging
- [ ] Use Mobile Debugger for quick logs
- [ ] Check Network tab for API failures
- [ ] Monitor console for errors
- [ ] Check Redux/Zustand state

### Common Issues

#### "Cannot connect to development server"
```bash
# Reset everything
watchman watch-del-all
rm -rf node_modules
bun install
bun expo:ios
```

#### Logs not showing
1. Check log level filter
2. Ensure `__DEV__` is true
3. Try clearing logs and refreshing

#### Performance issues
1. Check for console.log in loops
2. Remove unnecessary re-renders
3. Use React.memo for heavy components

## Production Debugging

### Sentry Integration (Future)
```typescript
// Will capture errors in production
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  debug: false,
  environment: 'production',
});
```

### Crash Reporting
- Use EAS Build crash reports
- Check device logs via Xcode/Android Studio
- Use Firebase Crashlytics

## Quick Reference

```bash
# Start with debugging
bun debug:ios

# View native logs
bun logs:ios

# Clear everything
expo start --clear

# Check environment
echo $EXPO_PUBLIC_API_URL
```

## Tips

1. **Always use the Mobile Debugger** in development
2. **Filter logs** to reduce noise
3. **Export logs** before clearing for investigation
4. **Use breakpoints** in Chrome DevTools
5. **Monitor performance** regularly

The Mobile Debugger (🐛) is now your best friend for debugging on mobile!