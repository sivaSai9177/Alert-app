#!/bin/bash

# Start the app with healthcare setup based on environment
# This script auto-detects the environment and database configuration

# Cleanup function for graceful exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    
    # Restore prebuild folders if they were renamed
    if [ -d "ios.bak" ]; then
        mv ios.bak ios 2>/dev/null || true
    fi
    if [ -d "android.bak" ]; then
        mv android.bak android 2>/dev/null || true
    fi
    
    # Restore original app.json if backup exists
    if [ -f "app.json.backup" ]; then
        cp app.json.backup app.json 2>/dev/null || true
    fi
    
    exit 0
}

# Set up trap to call cleanup on script exit
trap cleanup EXIT INT TERM

echo "🏥 Hospital Alert System - Starting with Healthcare Setup"
echo "========================================================="
echo ""

# Load environment variables from .env.local or .env
if [ -f .env.local ]; then
    echo "📋 Loading environment from .env.local..."
    set -a
    source .env.local
    set +a
elif [ -f .env ]; then
    echo "📋 Loading environment from .env..."
    set -a
    source .env
    set +a
fi

# Determine environment
if [ -n "$APP_ENV" ]; then
    ENV=$APP_ENV
elif [ -n "$EXPO_PUBLIC_ENVIRONMENT" ]; then
    ENV=$EXPO_PUBLIC_ENVIRONMENT
else
    ENV="local"
fi

echo "📍 Environment: $ENV"

# Set database URL based on environment
case $ENV in
    "local")
        export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
        export APP_ENV="local"
        
        # Check if local database is running
        if ! docker ps | grep -q "myexpo-postgres-local"; then
            echo "⚠️  Local PostgreSQL is not running!"
            echo "Starting local database services..."
            docker-compose -f docker-compose.local.yml up -d postgres-local redis-local
            sleep 3
        fi
        
        echo "✅ Using local PostgreSQL"
        ;;
        
    "development"|"staging"|"production")
        if [ -z "$DATABASE_URL" ] && [ -n "$NEON_DATABASE_URL" ]; then
            export DATABASE_URL=$NEON_DATABASE_URL
        fi
        echo "☁️  Using Neon Cloud Database"
        ;;
        
    *)
        echo "❌ Unknown environment: $ENV"
        exit 1
        ;;
esac

# Display database info (hide password)
DB_DISPLAY=$(echo $DATABASE_URL | sed 's/:[^:@]*@/:****@/')
echo "🗄️  Database: $DB_DISPLAY"
echo ""

# Run healthcare setup
echo "🔧 Setting up healthcare tables and data..."
bun run scripts/setup-healthcare-local.ts

if [ $? -eq 0 ]; then
    echo "✅ Healthcare setup completed successfully!"
else
    echo "⚠️  Healthcare setup encountered issues, but continuing..."
fi

# No need for separate API server - Expo Router API routes work with Expo Go

# WebSocket server will be started by the API server when EXPO_PUBLIC_ENABLE_WS=true
if [ "$EXPO_PUBLIC_ENABLE_WS" = "true" ]; then
    echo ""
    echo "🔌 WebSocket server initialized by the API server on port ${EXPO_PUBLIC_WS_PORT:-3001}"
fi

echo ""
echo "🚀 Starting Expo..."
echo ""

# Ensure OAuth credentials are available
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "⚠️  Warning: Google OAuth credentials not found!"
    echo "   OAuth sign-in will not work without proper credentials."
fi

# Start based on environment
if [ "$ENV" = "local" ]; then
    # Force Expo Go mode for local
    export EXPO_USE_DEV_CLIENT=false
    export EXPO_GO=1
    
    # Always detect local IP for better device support (iOS and Android)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
    else
        # Linux/Windows
        LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
    fi
    
    # Export iOS-specific environment variables
    export REACT_NATIVE_PACKAGER_HOSTNAME=$LOCAL_IP
    export IOS_PHYSICAL_DEVICE=true
    
    # Ensure all OAuth-related vars are exported
    # For iOS devices, we need to use the actual IP for auth too
    export BETTER_AUTH_BASE_URL="http://$LOCAL_IP:8081/api/auth"
    export BETTER_AUTH_URL="http://$LOCAL_IP:8081"
    export EXPO_PUBLIC_API_URL="http://$LOCAL_IP:8081"
    export EXPO_PUBLIC_AUTH_URL="http://$LOCAL_IP:8081"
    
    # Clear any expo cache and prebuild folders
    rm -rf .expo/devices.json .expo/settings.json 2>/dev/null
    rm -rf .expo/web/cache 2>/dev/null
    
    # Temporarily rename prebuild folders to force Expo Go
    if [ -d "ios" ]; then
        mv ios ios.bak 2>/dev/null || true
    fi
    if [ -d "android" ]; then
        mv android android.bak 2>/dev/null || true
    fi
    
    # Backup original app.json and use Expo Go specific config
    cp app.json app.json.backup 2>/dev/null || true
    cp app.expo-go.json app.json
    
    # Show connection instructions based on detected IP
    if [ "$LOCAL_IP" != "localhost" ]; then
        echo "📱 Device Connection Info:"
        echo "================================"
        echo "🌐 Network IP: $LOCAL_IP"
        echo ""
        echo "For iOS devices:"
        echo "📱 Expo Go URL: exp://$LOCAL_IP:8081"
        echo "1. Make sure your iPhone is on the same WiFi network"
        echo "2. Open Expo Go app"
        echo "3. Tap 'Enter URL manually'"
        echo "4. Enter: exp://$LOCAL_IP:8081"
        echo ""
        echo "For Android devices:"
        echo "📱 Scan the QR code that appears, or"
        echo "📱 Enter URL: exp://$LOCAL_IP:8081"
        echo "================================"
    else
        echo "⚠️  Could not detect network IP address"
        echo "   Physical devices won't be able to connect"
        echo "   Make sure you're connected to a network"
    fi
    echo ""
    
    # Use --go flag to ensure Expo Go mode
    # Set dev client to false to ensure Expo Go URLs
    EXPO_USE_DEV_CLIENT=false EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 exec bunx expo start --host lan --clear --go
else
    # For non-local environments, still detect IP for iOS devices
    export EXPO_GO=1
    export EXPO_USE_DEV_CLIENT=false
    
    # Detect IP for device connections
    if [[ "$OSTYPE" == "darwin"* ]]; then
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
    else
        LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
    fi
    
    # Export network configuration
    export REACT_NATIVE_PACKAGER_HOSTNAME=$LOCAL_IP
    export EXPO_PUBLIC_API_URL="http://$LOCAL_IP:8081"
    
    # Show connection info
    if [ "$LOCAL_IP" != "localhost" ]; then
        echo "📱 Device Connection Info:"
        echo "================================"
        echo "🌐 Network IP: $LOCAL_IP"
        echo "📱 Expo Go URL: exp://$LOCAL_IP:8081"
        echo "================================"
        echo ""
    fi
    
    EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 exec bunx expo start --host lan --clear --go
fi