# Environment Setup Changes for expo-agentic-starter

## Overview
These are the environment and OAuth fixes that need to be applied to the `expo-agentic-starter` branch.

## Step 1: Create Unified Environment Module

Create `lib/core/unified-env.ts`:

```typescript
/**
 * Unified Environment Configuration
 * Handles all environment scenarios: local, network, tunnel, OAuth
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

export type EnvironmentMode = 'local' | 'network' | 'tunnel' | 'production';

interface EnvConfig {
  apiUrl: string;
  authUrl: string;
  authBaseUrl: string;
  databaseUrl: string;
  mode: EnvironmentMode;
  isOAuthSafe: boolean;
}

/**
 * Detect current environment mode
 */
function detectEnvironmentMode(): EnvironmentMode {
  // Check if we're in tunnel mode
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname.includes('.exp.direct') || hostname.includes('.exp.host')) {
      return 'tunnel';
    }
  }
  
  // Check environment variables
  const appEnv = process.env.APP_ENV;
  if (appEnv === 'production' || process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  // Check if explicitly set to local
  if (appEnv === 'local' || process.env.EXPO_PUBLIC_API_URL?.includes('localhost')) {
    return 'local';
  }
  
  // Default to network mode for development
  return 'network';
}

/**
 * Get unified environment configuration
 */
export function getUnifiedEnvConfig(): EnvConfig {
  const mode = detectEnvironmentMode();
  
  switch (mode) {
    case 'local':
      return {
        apiUrl: 'http://localhost:8081',
        authUrl: 'http://localhost:8081',
        authBaseUrl: 'http://localhost:8081/api/auth',
        databaseUrl: process.env.LOCAL_DATABASE_URL || 'postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev',
        mode: 'local',
        isOAuthSafe: true, // localhost is OAuth-safe
      };
      
    case 'tunnel':
      const tunnelUrl = getTunnelUrl();
      return {
        apiUrl: tunnelUrl,
        authUrl: tunnelUrl,
        authBaseUrl: `${tunnelUrl}/api/auth`,
        databaseUrl: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '',
        mode: 'tunnel',
        isOAuthSafe: true, // Public URLs are OAuth-safe
      };
      
    case 'production':
      const prodUrl = process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'https://api.myapp.com';
      return {
        apiUrl: prodUrl,
        authUrl: prodUrl,
        authBaseUrl: `${prodUrl}/api/auth`,
        databaseUrl: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '',
        mode: 'production',
        isOAuthSafe: true, // Production URLs are OAuth-safe
      };
      
    case 'network':
    default:
      // Network mode - detect best URL
      const networkUrl = getNetworkUrl();
      const isPrivateIP = networkUrl.includes('192.168') || networkUrl.includes('10.0');
      
      return {
        apiUrl: networkUrl,
        authUrl: isPrivateIP ? 'http://localhost:8081' : networkUrl, // Use localhost for auth if private IP
        authBaseUrl: isPrivateIP ? 'http://localhost:8081/api/auth' : `${networkUrl}/api/auth`,
        databaseUrl: process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL || '',
        mode: 'network',
        isOAuthSafe: !isPrivateIP, // Private IPs are not OAuth-safe
      };
  }
}

/**
 * Get tunnel URL
 */
function getTunnelUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  
  // Check environment variable
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && (envUrl.includes('.exp.direct') || envUrl.includes('.exp.host'))) {
    return envUrl;
  }
  
  return 'http://localhost:8081'; // Fallback
}

/**
 * Get network URL based on platform
 */
function getNetworkUrl(): string {
  // Web always uses origin
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Check environment variable first
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Android emulator
  if (Platform.OS === 'android' && __DEV__) {
    return 'http://10.0.2.2:8081';
  }
  
  // iOS simulator or device
  return 'http://localhost:8081';
}

/**
 * Get API URL for general use
 */
export function getApiUrl(): string {
  const config = getUnifiedEnvConfig();
  return config.apiUrl;
}

/**
 * Get Auth URL (OAuth-safe)
 */
export function getAuthUrl(): string {
  const config = getUnifiedEnvConfig();
  return config.authUrl;
}

/**
 * Get Auth Base URL for Better Auth
 */
export function getAuthBaseUrl(): string {
  const config = getUnifiedEnvConfig();
  return config.authBaseUrl;
}

/**
 * Check if current environment is OAuth-safe
 */
export function isOAuthSafe(): boolean {
  const config = getUnifiedEnvConfig();
  return config.isOAuthSafe;
}

/**
 * Get database URL
 */
export function getDatabaseUrl(): string {
  const config = getUnifiedEnvConfig();
  return config.databaseUrl;
}

/**
 * Log current environment (debug)
 */
export function logEnvironment(): void {
  const config = getUnifiedEnvConfig();
  console.log('[UNIFIED ENV] Configuration:', {
    mode: config.mode,
    apiUrl: config.apiUrl,
    authUrl: config.authUrl,
    authBaseUrl: config.authBaseUrl,
    isOAuthSafe: config.isOAuthSafe,
    platform: Platform.OS,
    isDev: __DEV__,
  });
}
```

## Step 2: Update Auth Module

Update `lib/auth/auth.ts`:

Replace:
```typescript
// Dynamic base URL based on request context
const getBaseURL = () => {
  // For OAuth callbacks, always use localhost to avoid Google's private IP restriction
  if (typeof process !== 'undefined') {
    const url = process.env.BETTER_AUTH_BASE_URL;
    if (url && url.includes('192.168')) {
      // Replace private IP with localhost for OAuth compatibility
      return url.replace(/192\.168\.\d+\.\d+/, 'localhost');
    }
    return url || "http://localhost:8081/api/auth";
  }
  return "http://localhost:8081/api/auth";
};
```

With:
```typescript
import { getAuthBaseUrl } from '@/lib/core/unified-env';

// Dynamic base URL based on unified environment configuration
const getBaseURL = () => {
  // Use unified environment configuration
  return getAuthBaseUrl();
};
```

## Step 3: Update Auth Client

Update `lib/auth/auth-client.ts`:

Replace:
```typescript
import { getApiUrlSync } from "../core/config";
const BASE_URL = getApiUrlSync();
```

With:
```typescript
import { getAuthUrl } from "../core/unified-env";
const BASE_URL = getAuthUrl(); // Use OAuth-safe URL
```

## Step 4: Update tRPC Configuration

Update `lib/trpc.tsx`:

Replace:
```typescript
import { getApiUrlSync } from './core/config';
```

With:
```typescript
import { getApiUrl } from './core/unified-env';
```

And replace:
```typescript
const apiUrl = getApiUrlSync();
```

With:
```typescript
const apiUrl = getApiUrl();
```

## Step 5: Create Unified Start Script

Create `scripts/start-unified.sh`:

```bash
#!/bin/bash

# Unified Start Script - Works for all scenarios
# Usage: ./scripts/start-unified.sh [mode]
# Modes: local, network, tunnel, oauth

MODE=${1:-network}  # Default to network mode

echo "🚀 Starting in $MODE mode..."
echo "================================"
echo ""

# Function to detect local IP
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost"
    else
        # Linux
        hostname -I | awk '{print $1}' || echo "localhost"
    fi
}

# Function to check if local services are running
check_local_services() {
    if ! docker ps | grep -q "myexpo-postgres-local"; then
        echo "⚠️  Local PostgreSQL is not running!"
        echo "Starting local database services..."
        docker-compose -f docker-compose.local.yml up -d postgres-local redis-local
        sleep 3
    fi
    echo "✅ Local services running"
}

# Load base environment
if [ -f .env ]; then
    # Load Google OAuth credentials
    export GOOGLE_CLIENT_ID=$(grep '^GOOGLE_CLIENT_ID=' .env | cut -d '=' -f2)
    export GOOGLE_CLIENT_SECRET=$(grep '^GOOGLE_CLIENT_SECRET=' .env | cut -d '=' -f2)
    export BETTER_AUTH_SECRET=$(grep '^BETTER_AUTH_SECRET=' .env | cut -d '=' -f2)
fi

case $MODE in
    "local")
        echo "📍 LOCAL MODE - Using localhost for everything"
        check_local_services
        
        export APP_ENV=local
        export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
        export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
        export BETTER_AUTH_URL="http://localhost:8081"
        export EXPO_PUBLIC_API_URL="http://localhost:8081"
        
        echo "🌐 Access at: http://localhost:8081"
        exec npx expo start --host localhost --clear
        ;;
        
    "network")
        echo "📍 NETWORK MODE - Using local IP for mobile devices"
        check_local_services
        
        LOCAL_IP=$(get_local_ip)
        echo "🌐 Local IP: $LOCAL_IP"
        
        export APP_ENV=local
        export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
        export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"  # OAuth still uses localhost
        export BETTER_AUTH_URL="http://localhost:8081"
        export EXPO_PUBLIC_API_URL="http://$LOCAL_IP:8081"
        
        echo "🌐 Web access: http://localhost:8081"
        echo "📱 Mobile access: http://$LOCAL_IP:8081"
        exec npx expo start --host lan --clear
        ;;
        
    "tunnel")
        echo "📍 TUNNEL MODE - Using Expo tunnel for remote access"
        # Use cloud database for tunnel mode
        export APP_ENV=development
        export DATABASE_URL=$NEON_DATABASE_URL
        
        echo "☁️  Using cloud database"
        exec npx expo start --tunnel --clear
        ;;
        
    "oauth")
        echo "📍 OAUTH MODE - Optimized for OAuth testing"
        check_local_services
        
        export APP_ENV=local
        export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
        export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
        export BETTER_AUTH_URL="http://localhost:8081"
        export EXPO_PUBLIC_API_URL="http://localhost:8081"
        
        echo "🔐 OAuth configured for localhost"
        echo "🌐 Access at: http://localhost:8081"
        exec npx expo start --host localhost --clear
        ;;
        
    *)
        echo "❌ Unknown mode: $MODE"
        echo "Available modes: local, network, tunnel, oauth"
        exit 1
        ;;
esac
```

Make it executable:
```bash
chmod +x scripts/start-unified.sh
```

## Step 6: Update package.json Scripts

Update the scripts section:

```json
{
  "scripts": {
    "// === MAIN COMMANDS (UNIFIED) ===": "",
    "start": "./scripts/start-unified.sh network",
    "start:local": "./scripts/start-unified.sh local",
    "start:tunnel": "./scripts/start-unified.sh tunnel",
    "start:oauth": "./scripts/start-unified.sh oauth",
    "android": "EXPO_GO=1 expo start --android --host lan --go",
    "ios": "EXPO_GO=1 expo start --ios --host lan --go",
    "web": "EXPO_GO=1 expo start --web --go",
    // ... rest of your scripts
  }
}
```

## Step 7: Create .env.local (Optional)

Create `.env.local` for local development with OAuth:

```bash
# Local Development Environment Configuration
# This file is loaded when running 'bun run local' commands

# ================================
# DATABASE CONFIGURATION
# ================================
# Local Docker PostgreSQL
DATABASE_URL=postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev
LOCAL_DATABASE_URL=postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev

# ================================
# BETTER AUTH CONFIGURATION
# ================================
# IMPORTANT: Use localhost for OAuth (Google doesn't allow private IPs)
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_BASE_URL=http://localhost:8081/api/auth
BETTER_AUTH_URL=http://localhost:8081

# ================================
# API CONFIGURATION
# ================================
# Use localhost for OAuth compatibility
EXPO_PUBLIC_API_URL=http://localhost:8081

# ================================
# GOOGLE OAUTH CONFIGURATION
# ================================
# Copy from your main .env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ================================
# DEVELOPMENT SETTINGS
# ================================
NODE_ENV=development
APP_ENV=local
```

## Step 8: Update lib/core/env.ts (Optional)

Add unified functions to the exports:

```typescript
// Import unified functions
import { 
  getApiUrl as getUnifiedApiUrl,
  getAuthUrl as getUnifiedAuthUrl,
  getAuthBaseUrl as getUnifiedAuthBaseUrl,
  isOAuthSafe,
  getDatabaseUrl,
  logEnvironment as logUnifiedEnvironment
} from './unified-env';

export const env = {
  // ... existing exports
  // Unified functions
  getUnifiedApiUrl,
  getUnifiedAuthUrl,
  getUnifiedAuthBaseUrl,
  isOAuthSafe,
  getDatabaseUrl,
  logUnifiedEnvironment,
};
```

## Applying Changes to the Branch

```bash
# 1. Switch to the expo-agentic-starter repository
cd /path/to/expo-agentic-starter

# 2. Create a new branch for the changes
git checkout -b feat/unified-environment

# 3. Apply the changes listed above

# 4. Test the changes
bun start:local   # Test local mode
bun start        # Test network mode
bun start:oauth  # Test OAuth

# 5. Commit the changes
git add .
git commit -m "feat: Add unified environment configuration for OAuth compatibility

- Add unified-env.ts for centralized URL resolution
- Update auth modules to use OAuth-safe URLs
- Create unified start script for all scenarios
- Fix OAuth issues with private IP addresses"

# 6. Push to remote
git push origin feat/unified-environment
```

## Testing Checklist

- [ ] Local mode works: `bun start:local`
- [ ] Network mode works: `bun start`
- [ ] OAuth works: `bun start:oauth`
- [ ] Tunnel mode works: `bun start:tunnel`
- [ ] Profile completion flow works after OAuth
- [ ] Mobile devices can connect in network mode
- [ ] Web access works in all modes

## Summary

These changes create a unified environment system that:
1. Automatically detects the current mode (local/network/tunnel/production)
2. Uses appropriate URLs for each service
3. Ensures OAuth compatibility by using localhost when needed
4. Works across all platforms (iOS, Android, Web)
5. Handles WiFi switching and different networks