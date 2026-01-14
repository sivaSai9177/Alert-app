# Google OAuth Tunnel Setup

## Problem
When using Expo tunnel mode (`bun start:tunnel`), Google OAuth fails because the tunnel URL (e.g., `https://yl8p0iw-siva9177-8081.exp.direct`) is not configured as an authorized redirect URI in Google Console.

## Solution Options

### Option 1: Use Localhost (Recommended)
Instead of using the tunnel URL for web OAuth:
1. Run `bun start:tunnel`
2. For web, open `http://localhost:8081` instead of pressing 'w'
3. Or run `bun web:open` in another terminal

This works because localhost is already configured in your Google OAuth settings.

### Option 2: Add Tunnel URL to Google Console (Temporary)
Since tunnel URLs change each time you restart:

1. Start tunnel: `bun start:tunnel`
2. Note your tunnel URL (e.g., `https://yl8p0iw-siva9177-8081.exp.direct`)
3. Go to [Google Cloud Console](https://console.cloud.google.com/)
4. Navigate to: APIs & Services → Credentials → Your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   ```
   https://yl8p0iw-siva9177-8081.exp.direct
   ```
6. Add to **Authorized redirect URIs**:
   ```
   https://yl8p0iw-siva9177-8081.exp.direct/api/auth/callback/google
   ```
7. Save changes

**Note**: You'll need to do this every time the tunnel URL changes.

### Option 3: Use OAuth Proxy (Best for Development)
The project already has OAuth proxy configured. To use it:

1. Ensure your `.env` has:
   ```
   BETTER_AUTH_BASE_URL=http://localhost:8081/api/auth
   ```

2. The OAuth proxy will handle the redirect through a stable URL

### Option 4: Use Ngrok (Stable URL)
For a stable tunnel URL that doesn't change:

1. Setup ngrok: `bun ngrok:setup`
2. Start ngrok: `bun ngrok:start`
3. Add the stable ngrok URL to Google Console once
4. Use: `bun web:ngrok`

## Current Status

I've updated the code to:
1. ✅ Accept tunnel URLs in CORS headers
2. ✅ Detect and allow tunnel domains dynamically
3. ✅ Log tunnel domain detection for debugging

However, Google OAuth still requires the redirect URL to be pre-configured in Google Console.

## Recommended Workflow

### For Web Development with OAuth:
```bash
# Start tunnel for mobile
bun start:tunnel

# For web, use localhost
bun web:open
# Or manually open: http://localhost:8081
```

### For Mobile Development:
```bash
# Tunnel mode works fine for mobile OAuth
bun start:tunnel
# Press 's' for Expo Go
# Use the exp:// URL in Expo Go app
```

## Why This Happens

Google OAuth has strict security requirements:
- All redirect URLs must be pre-registered
- Dynamic URLs (like Expo tunnel) can't be wildcarded
- This is a security feature, not a bug

The best practice is to use stable URLs (localhost, ngrok, or production domains) for OAuth testing.