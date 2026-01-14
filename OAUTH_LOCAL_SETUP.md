# OAuth Local Development Setup

## The Issue
Google OAuth doesn't work with private IP addresses (like 192.168.x.x). It requires either:
- `localhost` / `127.0.0.1` for local development
- Public domain names for production
- Ngrok tunnels for testing

## The Solution

### Method 1: Use the OAuth-Specific Start Command (Recommended)
```bash
bun run local:oauth
```

This command:
1. Forces all URLs to use `localhost` instead of IP addresses
2. Loads Google OAuth credentials from `.env`
3. Checks and starts local PostgreSQL
4. Sets up healthcare tables if needed
5. Starts Expo with `--host localhost`

### Method 2: Manual Environment Override
```bash
# Override the IP-based URLs with localhost
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
export BETTER_AUTH_URL="http://localhost:8081"
export EXPO_PUBLIC_API_URL="http://localhost:8081"

# Then start normally
bun run local
```

## Environment Files Structure

### `.env` (Main configuration)
Contains your OAuth credentials and default configuration. This file uses IP addresses which work for everything except OAuth.

### `.env.local` (Local overrides)
Created specifically for local development with OAuth support. Uses `localhost` instead of IP addresses.

### `.env.development` 
Additional development settings like CSRF disabling.

## OAuth Configuration Requirements

### 1. Google Cloud Console
Add these redirect URIs:
- `http://localhost:8081/api/auth/callback/google`
- `http://localhost:8081/auth-callback`
- `http://127.0.0.1:8081/api/auth/callback/google`
- `http://127.0.0.1:8081/auth-callback`

### 2. Environment Variables Required
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
BETTER_AUTH_SECRET=your-secret-key
```

## Testing OAuth

1. Start with OAuth support:
   ```bash
   bun run local:oauth
   ```

2. Open browser at: http://localhost:8081

3. Click "Continue with Google"

4. You should be redirected to Google's OAuth consent screen

## Troubleshooting

### Still Getting 500 Error?

1. **Check server logs**: The console where you ran `bun run local:oauth` should show detailed error messages

2. **Verify credentials are loaded**:
   ```bash
   # Check if env vars are set
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```

3. **Check Better Auth is configured**:
   Look for this log message when starting:
   ```
   [AUTH CONFIG] Initializing Better Auth
   googleConfigured: true
   ```

4. **Try the test script**:
   ```bash
   bun run scripts/test-oauth-simple.ts
   ```

### Common Issues

1. **"Missing required config"**: OAuth credentials not loaded
   - Solution: Ensure `.env` has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

2. **"Invalid redirect URI"**: Google doesn't recognize the callback URL
   - Solution: Add `http://localhost:8081/api/auth/callback/google` to Google Console

3. **CORS errors**: Cross-origin issues
   - Solution: Use `bun run local:oauth` which sets proper CORS headers

## Summary

For OAuth to work locally:
1. Always use `localhost`, never IP addresses
2. Use `bun run local:oauth` command
3. Ensure Google credentials are in `.env`
4. Add localhost redirect URIs to Google Console