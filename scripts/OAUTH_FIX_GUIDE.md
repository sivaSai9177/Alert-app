# OAuth Fix Guide

## Problem
You're getting a 500 error when trying to use Google OAuth:
```
POST http://localhost:8081/api/auth/sign-in/social - 500 Internal Server Error
```

## Root Cause
The Better Auth server is not receiving the Google OAuth credentials (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) because the environment variables aren't being loaded properly when using `bun run local:healthcare`.

## Solution

### Option 1: Use the New Fix Script (Recommended)
```bash
./scripts/fix-oauth-healthcare.sh
```

This script:
1. Loads all environment variables from .env.local
2. Verifies OAuth credentials are present
3. Starts local PostgreSQL if needed
4. Sets up healthcare tables
5. Starts Expo with all variables properly exported

### Option 2: Manual Fix
```bash
# 1. Load environment variables
source .env.local

# 2. Verify they're loaded
echo $GOOGLE_CLIENT_ID  # Should show your client ID

# 3. Start with explicit exports
GOOGLE_CLIENT_ID="59100460814-lvqieq6hjuhvhe0t3gue41cpbp499kr4.apps.googleusercontent.com" \
GOOGLE_CLIENT_SECRET="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" \
bun run local:healthcare
```

### Option 3: Update package.json script
Update the `local:healthcare` script in package.json to:
```json
"local:healthcare": "source .env.local && APP_ENV=local ./scripts/start-with-healthcare.sh"
```

## Verification

1. After starting with the fix, check the console for:
   ```
   [AUTH MODULE] Environment variables:
   GOOGLE_CLIENT_ID: 5910046081...
   GOOGLE_CLIENT_SECRET: SET
   ```

2. Test OAuth:
   - Open http://localhost:8081 in browser
   - Click "Continue with Google"
   - Should redirect to Google's OAuth page

## Why This Happens

1. **Expo Go mode**: When using `--go` flag, environment variables need to be explicitly exported
2. **Script execution**: Shell scripts don't automatically inherit parent process env vars
3. **Better Auth**: Requires OAuth credentials at server startup, not just runtime

## Script Organization

### Primary Scripts
- `fix-oauth-healthcare.sh` - Fixes OAuth with healthcare (NEW)
- `start-unified.sh` - Unified starter for all modes
- `start-with-healthcare.sh` - Healthcare-specific starter

### Environment Modes
- **local**: Everything on localhost (OAuth-friendly)
- **network**: API on network IP, auth on localhost
- **tunnel**: Public URL via Expo
- **oauth**: Optimized for OAuth testing

### Best Practices
1. Always use localhost for OAuth testing
2. Ensure env vars are exported, not just set
3. Check server logs for credential loading
4. Use the unified scripts for consistency