# Expo Go Authentication Guide

## Important: Expo Go Limitations

When using **Expo Go** (not a development build):
- ❌ Google OAuth won't work (requires development build)
- ✅ Email/password login works
- ✅ Session persistence works after login

## Setup for Expo Go

### 1. Environment Setup

Run the Expo Go specific environment setup:
```bash
bun run setup:env:expo
```

### 2. Start with Expo Go

Use one of these commands:

```bash
# Option 1: Standard Expo Go with cloud database
bun run expo:go

# Option 2: Expo Go with local database (requires Docker)
bun run expo:go:local

# Option 3: Basic start command
bun start
```

### 3. Login Process

Since you're seeing "No active session found", you need to:

1. **Navigate to Login Page**
   - Click the "Re-Login" button in the admin dashboard
   - Or manually navigate to the login screen

2. **Use Email/Password Login**
   - Enter your credentials
   - Do NOT use Google Sign In (won't work in Expo Go)

3. **Complete Login**
   - After successful login, the token will be stored
   - Navigate back to admin dashboard
   - Data should load correctly

## Debugging Session Issues

### Check Current Session Status

From the admin dashboard, use the debug buttons:
- **"Check Token"** - Shows if a token is stored
- **"Fix Session"** - Attempts to recover session
- **"Re-Login"** - Direct route to login page

### Common Issues

1. **"No active session found"**
   - You haven't logged in yet on this device
   - Solution: Click "Re-Login" and login with email/password

2. **"better-auth_cookie: {}"**
   - Empty token storage
   - Solution: Login again to establish new session

3. **401 Unauthorized errors**
   - Missing or expired token
   - Solution: Login again

## Working Flow for Expo Go

```
1. Start app with: bun run expo:go
2. Navigate to admin dashboard
3. See "Auth error detected" with buttons
4. Click "Re-Login"
5. Login with email/password (NOT Google)
6. Return to admin dashboard
7. Data loads successfully
```

## For Full OAuth Support

If you need Google login or other OAuth providers:
```bash
# Build a development build
bun run eas:build:dev

# Or use preview build
eas build --profile preview --platform ios
```

## Environment Variables

Make sure your `.env.local` has:
```bash
# For Expo Go with local network
EXPO_PUBLIC_API_URL=http://192.168.1.101:8081
BETTER_AUTH_BASE_URL=http://192.168.1.101:8081/api/auth

# Or use localhost
EXPO_PUBLIC_API_URL=http://localhost:8081
BETTER_AUTH_BASE_URL=http://localhost:8081/api/auth
```

## Summary

The issue you're seeing is expected - you just need to login first! Expo Go doesn't support OAuth, so use email/password authentication.