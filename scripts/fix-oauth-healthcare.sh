#!/bin/bash

# Fix OAuth with Healthcare Setup
# This script ensures OAuth works properly with healthcare setup

echo "🔐 OAuth + Healthcare Fix"
echo "=========================="
echo ""

# Function to check required variables
check_oauth_vars() {
    if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
        echo "❌ Google OAuth credentials not found!"
        echo "Please ensure .env or .env.local has:"
        echo "  GOOGLE_CLIENT_ID=your-client-id"
        echo "  GOOGLE_CLIENT_SECRET=your-client-secret"
        exit 1
    fi
    echo "✅ OAuth credentials found"
}

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
    echo "📋 Loading .env.local..."
    # Export variables from .env.local
    export $(grep -v '^#' .env.local | xargs)
elif [ -f .env ]; then
    echo "📋 Loading .env..."
    # Export variables from .env
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ No .env or .env.local file found!"
    exit 1
fi

# Check OAuth variables
check_oauth_vars

# Check if local database is running
if ! docker ps | grep -q "myexpo-postgres-local"; then
    echo "⚠️  Local PostgreSQL is not running!"
    echo "Starting local database services..."
    docker-compose -f docker-compose.local.yml up -d postgres-local redis-local
    sleep 3
fi

echo "✅ Local services running"

# Setup healthcare tables
echo ""
echo "🏥 Setting up healthcare tables..."
APP_ENV=local DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev" bun run scripts/setup-healthcare-local.ts

# Set all required environment variables for OAuth
export APP_ENV=local
export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
export BETTER_AUTH_URL="http://localhost:8081"
export EXPO_PUBLIC_API_URL="http://localhost:8081"
export EXPO_PUBLIC_DEBUG_MODE=true
export NODE_ENV=development

# Display configuration
echo ""
echo "🔧 Configuration:"
echo "  API URL: http://localhost:8081"
echo "  Auth URL: http://localhost:8081/api/auth"
echo "  Google OAuth: Configured ✓"
echo "  Healthcare: Setup complete ✓"
echo ""

echo "🚀 Starting Expo with OAuth + Healthcare..."
echo "=================================="
echo ""
echo "📱 Access the app at:"
echo "  🌐 Web: http://localhost:8081"
echo "  📱 Mobile: Press 's' to switch to Expo Go"
echo ""
echo "🔐 OAuth Test:"
echo "  1. Open http://localhost:8081 in browser"
echo "  2. Click 'Continue with Google'"
echo "  3. Complete OAuth flow"
echo "  4. Test healthcare features"
echo ""

# Start Expo with all environment variables
exec npx expo start --host localhost --clear --go