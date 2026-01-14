# Enhanced Debug Panel

## Overview
The Enhanced Debug Panel is a unified debugging tool that combines the best features from multiple debug panels into one comprehensive solution with copy functionality.

## Features

### 1. **Floating Debug Button**
- Shows a 🐛 emoji button in the bottom-right corner
- Displays error count badge when errors are present
- Only visible in development mode (`__DEV__`)

### 2. **Auto-Refresh**
- Logs automatically refresh every second when the panel is open
- Real-time view of application logs

### 3. **Search & Filter**
- Search across log messages, components, and data
- Filter by log level (ERROR, WARN, INFO, DEBUG)
- Shows count for each log level

### 4. **Copy Functionality**
- **Tap any log entry** to copy it to clipboard
- **Long press** for detailed view with copy option
- **Copy All** button to export all logs
- Works on both mobile (React Native) and web

### 5. **Auth State Display**
- Shows current authentication status
- Displays user email and role
- Shows hydration status
- Shows API URL and environment

### 6. **Log Entry Details**
- Timestamp
- Log level with color coding
- Component source
- Message
- Structured data (if any)
- Visual indication of tap/long press actions

## Usage

### Basic Usage
```typescript
import { log } from '@/lib/core/logger';

// Log with different levels
log.error('Something went wrong', 'COMPONENT_NAME', error);
log.warn('Warning message', 'COMPONENT_NAME', { data });
log.info('Info message', 'COMPONENT_NAME');
log.debug('Debug info', 'COMPONENT_NAME', { debugData });
```

### Domain-Specific Logging
```typescript
// Auth logging
log.auth.login('User logged in', { userId: user.id });
log.auth.logout('User logged out', { reason: 'manual' });
log.auth.error('Auth error', error);

// API logging
log.api.request('API call', { endpoint: '/users' });
log.api.response('API response', { status: 200 });
log.api.error('API error', error);

// Store logging
log.store.update('State updated', { newState });
log.store.debug('Store debug', { action: 'UPDATE_USER' });
```

## Color Coding
- 🔴 **ERROR**: #ef4444 (red)
- 🟡 **WARN**: #f59e0b (amber)
- 🔵 **INFO**: #3b82f6 (blue)
- 🟢 **DEBUG**: #10b981 (green)

## Keyboard Shortcuts (Web)
- Click outside modal to close
- Copy logs with browser clipboard API

## Mobile Gestures
- **Tap**: Copy single log entry
- **Long Press**: View details and copy
- **Swipe down**: Close panel (via modal gesture)

## Export Format
When copying logs, they are formatted as:
```
[2025-01-06T10:30:45.123Z] [INFO] [COMPONENT_NAME] Log message
Data: {
  "key": "value"
}
```

## Benefits Over Previous Panels
1. **Unified Interface**: Single debug panel instead of multiple
2. **Copy Support**: Easy to share logs for debugging
3. **Better Performance**: Uses structured logging system
4. **Search Capability**: Find specific logs quickly
5. **Auto-Refresh**: Real-time log updates
6. **No setState Warnings**: Proper async handling

## Technical Details
- Uses `@react-native-clipboard/clipboard` for mobile
- Uses native `navigator.clipboard` API for web
- Integrates with centralized logging system (`lib/core/logger.ts`)
- Filters logs at display time, not capture time
- Maintains last 100 logs in memory