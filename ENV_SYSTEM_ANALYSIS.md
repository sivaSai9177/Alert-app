# Environment System Analysis & OAuth Fix

## Current Environment Files Overview

### 1. **lib/core/env.ts** (Main Entry Point)
- **Purpose**: Primary environment API that other parts of the app use
- **Dependencies**: 
  - `api-resolver.ts` - For dynamic API URL resolution
  - `env-config.ts` - For environment detection
  - `tunnel-config.ts` - For Expo tunnel support
- **Key Functions**: 
  - `getApiUrl()` - Async API URL resolution with caching
  - `getApiUrlSync()` - Sync fallback for compatibility
- **Should Keep**: YES - This is the main API interface

### 2. **lib/core/env-config.ts** (Environment Configuration)
- **Purpose**: Detailed environment configuration with database settings
- **Features**:
  - Environment detection (local, dev, staging, prod)
  - Database configuration (local Docker vs Neon cloud)
  - API endpoint building with priorities
  - Caching mechanism
- **Should Keep**: YES - Essential for multi-environment support

### 3. **lib/core/api-resolver.ts** (Dynamic API Resolution)
- **Purpose**: Intelligent API endpoint discovery with fallback
- **Features**:
  - Tests multiple endpoints in parallel
  - Caches working endpoints
  - Network-aware endpoint discovery
  - Health checks
- **Should Keep**: YES - Critical for mobile development with changing IPs

### 4. **lib/core/tunnel-config.ts** (Expo Tunnel Support)
- **Purpose**: Handle Expo tunnel URLs for development
- **Should Keep**: YES - Required for Expo tunnel development

### 5. **lib/core/network-config.ts** (Multi-Network Support)
- **Purpose**: Support for multiple WiFi networks
- **Features**: Network detection, IP discovery
- **Should Keep**: OPTIONAL - Only if you switch networks often

## OAuth Issue Analysis

The 500 error on `/api/auth/sign-in/social` is likely due to:

1. **Missing Google OAuth Credentials**: Check if `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. **Redirect URI Mismatch**: Google OAuth requires exact redirect URI matching
3. **Environment Detection Issue**: The API might be using wrong URLs

## Fix for OAuth

### Step 1: Verify Environment Variables

```bash
# Check if OAuth credentials are set
echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET"
```

### Step 2: Update OAuth Configuration

Create a simplified OAuth configuration for local development:

```typescript
// lib/auth/auth-local-config.ts
export function getOAuthConfig() {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const baseUrl = isDevelopment ? 'http://localhost:8081' : process.env.PRODUCTION_URL;
  
  return {
    redirectUri: `${baseUrl}/api/auth/callback/google`,
    // For local dev, always use localhost (not IP addresses)
    authUrl: `${baseUrl}/api/auth`,
  };
}
```

### Step 3: Fix Better Auth Configuration

Update `lib/auth/auth.ts`:

```typescript
// Dynamic base URL that works for OAuth
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'development') {
    // Always use localhost for OAuth in development
    return "http://localhost:8081/api/auth";
  }
  return process.env.BETTER_AUTH_BASE_URL || "http://localhost:8081/api/auth";
};
```

## Simplification Recommendations

### What to Keep:
1. **env.ts** - Main API interface
2. **env-config.ts** - Environment detection
3. **api-resolver.ts** - Dynamic API resolution

### What Can Be Removed:
1. **network-config.ts** - Unless you need multi-network support
2. Complex tunnel detection - Simplify to basic checks

### Simplified Environment System:

```typescript
// lib/core/simple-env.ts
export function getApiUrl(): string {
  // For web, use same origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // For mobile, use environment variable or localhost
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081';
}

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || 'postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev';
}

export function isLocalDev(): boolean {
  return process.env.APP_ENV === 'local';
}
```

## OAuth Setup for Local Development

### 1. Google Cloud Console Setup
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Add these redirect URIs:
  - `http://localhost:8081/api/auth/callback/google`
  - `http://localhost:8081/auth-callback`
  - `https://auth.expo.io/@your-username/your-app-slug`

### 2. Environment Variables
```bash
# .env.local
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_BASE_URL=http://localhost:8081/api/auth
```

### 3. Test OAuth
```bash
# Start with local database
bun run local:healthcare

# Access at http://localhost:8081
# Click "Continue with Google"
```

## Quick Fix Script

Create `scripts/fix-oauth-local.sh`:

```bash
#!/bin/bash

echo "🔧 Fixing OAuth for local development..."

# Ensure we're using localhost
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
export EXPO_PUBLIC_API_URL="http://localhost:8081"

# Check Google credentials
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  echo "❌ Missing Google OAuth credentials!"
  echo "Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local"
  exit 1
fi

echo "✅ OAuth configured for localhost"
echo "📱 Starting app..."

# Start with healthcare setup
./scripts/start-with-healthcare.sh
```

## Summary

The environment system is actually well-designed but complex. The OAuth issue is likely due to:
1. Missing OAuth credentials
2. IP address vs localhost mismatch (Google doesn't allow private IPs)
3. CORS/redirect URI configuration

To fix OAuth:
1. Always use `localhost` for OAuth in development
2. Ensure Google credentials are set
3. Add correct redirect URIs in Google Console
4. Use the simplified environment detection for OAuth endpoints