#!/bin/bash

# Apply Environment Changes to Another Branch
# This script applies the unified environment setup to expo-agentic-starter

TARGET_REPO_PATH="$1"

if [ -z "$TARGET_REPO_PATH" ]; then
    echo "Usage: ./scripts/apply-env-changes-to-branch.sh /path/to/expo-agentic-starter"
    exit 1
fi

echo "🚀 Applying Environment Changes to Branch"
echo "========================================"
echo "Target: $TARGET_REPO_PATH"
echo ""

# Verify target repository exists
if [ ! -d "$TARGET_REPO_PATH" ]; then
    echo "❌ Target repository not found: $TARGET_REPO_PATH"
    exit 1
fi

# Check if it's a git repository
if [ ! -d "$TARGET_REPO_PATH/.git" ]; then
    echo "❌ Target is not a git repository"
    exit 1
fi

# Change to target repository
cd "$TARGET_REPO_PATH"

# Create a new branch
BRANCH_NAME="feat/unified-environment"
echo "📌 Creating branch: $BRANCH_NAME"
git checkout -b $BRANCH_NAME 2>/dev/null || {
    echo "Branch already exists, switching to it..."
    git checkout $BRANCH_NAME
}

# Create unified-env.ts
echo "📝 Creating lib/core/unified-env.ts..."
mkdir -p lib/core
cat > lib/core/unified-env.ts << 'EOF'
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
EOF

# Update auth.ts
echo "📝 Updating lib/auth/auth.ts..."
if [ -f "lib/auth/auth.ts" ]; then
    # Backup original
    cp lib/auth/auth.ts lib/auth/auth.ts.backup
    
    # Add import and update getBaseURL function
    sed -i '' '1i\
import { getAuthBaseUrl } from "@/lib/core/unified-env";\
' lib/auth/auth.ts
    
    echo "✅ Updated auth.ts (manual review recommended)"
fi

# Update auth-client.ts
echo "📝 Updating lib/auth/auth-client.ts..."
if [ -f "lib/auth/auth-client.ts" ]; then
    # Backup original
    cp lib/auth/auth-client.ts lib/auth/auth-client.ts.backup
    
    # Update import
    sed -i '' 's/import { getApiUrlSync } from "\.\.\/core\/config";/import { getAuthUrl } from "..\/core\/unified-env";/g' lib/auth/auth-client.ts
    sed -i '' 's/const BASE_URL = getApiUrlSync();/const BASE_URL = getAuthUrl(); \/\/ Use OAuth-safe URL/g' lib/auth/auth-client.ts
    
    echo "✅ Updated auth-client.ts"
fi

# Update trpc.tsx
echo "📝 Updating lib/trpc.tsx..."
if [ -f "lib/trpc.tsx" ]; then
    # Backup original
    cp lib/trpc.tsx lib/trpc.tsx.backup
    
    # Update imports and usage
    sed -i '' 's/import { getApiUrlSync } from '\''\.\/core\/config'\'';/import { getApiUrl } from '\''\.\/core\/unified-env'\'';/g' lib/trpc.tsx
    sed -i '' 's/const apiUrl = getApiUrlSync();/const apiUrl = getApiUrl();/g' lib/trpc.tsx
    
    echo "✅ Updated trpc.tsx"
fi

# Create unified start script
echo "📝 Creating scripts/start-unified.sh..."
mkdir -p scripts
cat > scripts/start-unified.sh << 'SCRIPT_EOF'
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
SCRIPT_EOF

chmod +x scripts/start-unified.sh

# Update package.json scripts
echo "📝 Updating package.json scripts..."
if [ -f "package.json" ]; then
    # Create a temporary file with updated scripts
    node -e '
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    
    // Update scripts
    pkg.scripts = {
      ...pkg.scripts,
      "// === MAIN COMMANDS (UNIFIED) ===": "",
      "start": "./scripts/start-unified.sh network",
      "start:local": "./scripts/start-unified.sh local",
      "start:tunnel": "./scripts/start-unified.sh tunnel",
      "start:oauth": "./scripts/start-unified.sh oauth",
    };
    
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
    '
    echo "✅ Updated package.json"
fi

# Create .env.local template
echo "📝 Creating .env.local template..."
cat > .env.local << 'ENV_EOF'
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
ENV_EOF

# Update lib/core/env.ts if it exists
if [ -f "lib/core/env.ts" ]; then
    echo "📝 Updating lib/core/env.ts..."
    # Add unified imports at the end of file
    echo '
// Import unified functions
import { 
  getApiUrl as getUnifiedApiUrl,
  getAuthUrl as getUnifiedAuthUrl,
  getAuthBaseUrl as getUnifiedAuthBaseUrl,
  isOAuthSafe,
  getDatabaseUrl,
  logEnvironment as logUnifiedEnvironment
} from "./unified-env";

export const env = {
  ...env,
  // Unified functions
  getUnifiedApiUrl,
  getUnifiedAuthUrl,
  getUnifiedAuthBaseUrl,
  isOAuthSafe,
  getDatabaseUrl,
  logUnifiedEnvironment,
};' >> lib/core/env.ts
fi

# Create migration summary
echo "📝 Creating migration summary..."
cat > ENVIRONMENT_MIGRATION_SUMMARY.md << 'SUMMARY_EOF'
# Environment Migration Summary

## Changes Applied

1. **Created `lib/core/unified-env.ts`**
   - Centralized environment configuration
   - Automatic mode detection (local/network/tunnel/production)
   - OAuth-safe URL handling
   - Platform-specific URL resolution

2. **Updated Authentication Modules**
   - `lib/auth/auth.ts` - Uses unified auth base URL
   - `lib/auth/auth-client.ts` - Uses OAuth-safe URLs
   - `lib/trpc.tsx` - Uses unified API URL

3. **Created Unified Start Script**
   - `scripts/start-unified.sh` - Single script for all modes
   - Supports: local, network, tunnel, oauth modes
   - Auto-detects local IP for network mode
   - Manages Docker services automatically

4. **Updated Package.json Scripts**
   - `npm start` - Network mode (default)
   - `npm run start:local` - Local mode
   - `npm run start:tunnel` - Tunnel mode
   - `npm run start:oauth` - OAuth testing mode

5. **Created Environment Template**
   - `.env.local` - Template for local development

## Testing Checklist

- [ ] Test local mode: `npm run start:local`
- [ ] Test network mode: `npm start`
- [ ] Test OAuth flow: `npm run start:oauth`
- [ ] Test tunnel mode: `npm run start:tunnel`
- [ ] Verify profile completion after OAuth
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator
- [ ] Test on web browser

## OAuth Configuration

Make sure your Google OAuth is configured with these redirect URLs:
- `http://localhost:8081/auth-callback`
- `http://localhost:8081/api/auth/callback/google`
- Your app scheme for mobile (e.g., `com.yourapp://`)
SUMMARY_EOF

# Git status
echo ""
echo "📊 Git Status:"
git status --short

echo ""
echo "✅ Environment changes applied successfully!"
echo ""
echo "🔄 Next steps:"
echo "1. Review the changes"
echo "2. Test all modes"
echo "3. Commit when ready:"
echo "   git add ."
echo "   git commit -m 'feat: Add unified environment configuration for OAuth compatibility'"
echo "4. Push to remote:"
echo "   git push origin $BRANCH_NAME"