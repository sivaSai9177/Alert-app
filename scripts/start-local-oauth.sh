#!/bin/bash

echo "🚀 Starting Local Development with OAuth Support"
echo "==============================================="
echo ""

# Check if local database is running
if ! docker ps | grep -q "myexpo-postgres-local"; then
    echo "⚠️  Local PostgreSQL is not running!"
    echo "Starting local database services..."
    docker-compose -f docker-compose.local.yml up -d postgres-local redis-local
    sleep 3
fi

echo "✅ Local services running"
echo ""

# Set environment variables for local development with OAuth
echo "🔧 Configuring environment for OAuth..."

# Database
export APP_ENV=local
export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"

# OAuth - MUST use localhost (not IP addresses)
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
export BETTER_AUTH_URL="http://localhost:8081"
export EXPO_PUBLIC_API_URL="http://localhost:8081"

# Load OAuth credentials from .env
if [ -f .env ]; then
    # Load Google OAuth credentials
    export GOOGLE_CLIENT_ID=$(grep '^GOOGLE_CLIENT_ID=' .env | cut -d '=' -f2)
    export GOOGLE_CLIENT_SECRET=$(grep '^GOOGLE_CLIENT_SECRET=' .env | cut -d '=' -f2)
    export BETTER_AUTH_SECRET=$(grep '^BETTER_AUTH_SECRET=' .env | cut -d '=' -f2)
    
    # Load Expo public variables
    export EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=$(grep '^EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=' .env | cut -d '=' -f2)
    export EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=$(grep '^EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=' .env | cut -d '=' -f2)
    export EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=$(grep '^EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=' .env | cut -d '=' -f2)
fi

# Verify OAuth credentials
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "❌ Missing Google OAuth credentials!"
    echo "Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env"
    exit 1
fi

echo "✅ OAuth credentials loaded"
echo "   Client ID: ${GOOGLE_CLIENT_ID:0:10}..."
echo "   Base URL: $BETTER_AUTH_BASE_URL"
echo ""

# Check healthcare setup
echo "Checking healthcare setup..."
if ! docker exec myexpo-postgres-local psql -U myexpo -d myexpo_dev -c "SELECT 1 FROM alerts LIMIT 1;" &>/dev/null; then
    echo "⚠️  Healthcare tables not found. Setting up..."
    bun run scripts/setup-healthcare-local.ts
    echo "✅ Healthcare setup complete!"
else
    echo "✅ Healthcare tables already exist"
fi

echo ""
echo "📱 Starting Expo with OAuth support..."
echo ""
echo "🌐 Access the app at: http://localhost:8081"
echo ""
echo "📧 Demo credentials (any password):"
echo "   - Operator: johncena@gmail.com"
echo "   - Nurse: doremon@gmail.com"
echo "   - Doctor: johndoe@gmail.com"
echo "   - Head Doctor: saipramod273@gmail.com"
echo ""
echo "🔐 OAuth: Click 'Continue with Google' to test"
echo ""

# Force Expo Go mode
export EXPO_GO=1

# Start Expo with explicit localhost host and --go flag
exec npx expo start --host localhost --clear --go