# Google OAuth with EAS Build Guide

This guide explains how to properly configure Google OAuth for EAS builds, especially when using ngrok for development.

## Prerequisites

- Google OAuth credentials (Client ID and Secret)
- EAS CLI installed (`npm install -g eas-cli`)
- ngrok installed (for local-ngrok profile)

## Before Building

### 1. Start ngrok (for local-ngrok profile)

```bash
# Start ngrok tunnel
ngrok http 8081

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### 2. Update EAS Configuration

Update the `local-ngrok` profile in `eas.json` with:

1. Your actual ngrok URL
2. Your database URL from `.env.local`
3. Your Better Auth secret from `.env.local`

```json
"local-ngrok": {
  "extends": "development",
  "env": {
    "EXPO_PUBLIC_API_URL_NGROK": "https://YOUR-ACTUAL-NGROK-URL.ngrok.io",
    "BETTER_AUTH_BASE_URL": "https://YOUR-ACTUAL-NGROK-URL.ngrok.io/api/auth",
    "BETTER_AUTH_SECRET": "your-actual-auth-secret",
    "DATABASE_URL": "your-actual-database-url"
  }
}
```

### 3. Get Required Values

```bash
# Get your Better Auth secret
grep BETTER_AUTH_SECRET .env.local

# Get your database URL
grep DATABASE_URL .env.local
```

## Building with EAS

### For iOS with ngrok

```bash
# Build for iOS simulator with ngrok
eas build --profile local-ngrok --platform ios

# Build for physical iOS device with ngrok
eas build --profile local-ngrok --platform ios --clear-cache
```

### For Android with ngrok

```bash
# Build APK with ngrok
eas build --profile local-ngrok --platform android
```

## Google OAuth Flow in EAS Builds

1. **Mobile OAuth** uses Expo's authentication proxy
2. **Redirect URLs** are handled by Expo (no custom schemes needed)
3. **API calls** go to your ngrok URL (or production URL)

## Important URLs

### OAuth Redirect URLs (already configured in Google Console)
- `https://auth.expo.io/@siva9177/expo-starter`
- `https://auth.expo.io/@siva9177/expo-starter/auth-callback`

### API Endpoints (via ngrok or production)
- Auth endpoints: `https://YOUR-URL/api/auth/*`
- tRPC endpoints: `https://YOUR-URL/api/trpc/*`

## Troubleshooting

### OAuth not working in build

1. **Check ngrok is running**: The tunnel must be active
2. **Verify URLs match**: ngrok URL in EAS config must match running tunnel
3. **Check logs**: Use `bun run api:test` to verify connectivity

### Common Issues

1. **"Invalid redirect URI"**: Remove `expo-starter://auth-callback` from Google Console
2. **"Network timeout"**: Ensure ngrok is running and URL is correct
3. **"Authentication failed"**: Check Better Auth secret matches

## Testing OAuth

1. **Install the build** on simulator/device
2. **Open the app** and tap "Sign in with Google"
3. **Complete Google sign-in**
4. **Verify** profile completion flow if needed

## Production Builds

For production, update the `production` profile with:

```json
"production": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://api.yourdomain.com",
    "GOOGLE_CLIENT_ID": "your-production-client-id",
    "GOOGLE_CLIENT_SECRET": "your-production-secret",
    "BETTER_AUTH_SECRET": "your-production-auth-secret",
    "BETTER_AUTH_BASE_URL": "https://api.yourdomain.com/api/auth",
    "DATABASE_URL": "your-production-database-url"
  }
}
```

## Security Notes

- Never commit real secrets to git
- Use EAS Secrets for production credentials
- Rotate secrets regularly
- Use different OAuth apps for dev/staging/production