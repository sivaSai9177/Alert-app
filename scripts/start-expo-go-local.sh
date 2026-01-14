#!/bin/bash

# Start Expo Go with local database configuration
# This script ensures Expo Go mode is used with local PostgreSQL

echo "🚀 Starting Expo Go with local database..."
echo ""

# Check if local database is running using docker
if ! docker ps | grep -q "myexpo-postgres-local"; then
    echo "⚠️  Local PostgreSQL is not running!"
    echo ""
    echo "Starting local database services..."
    docker-compose -f docker-compose.local.yml up -d postgres-local redis-local
    
    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    sleep 3
fi

echo "✅ Local services running:"
echo "   📦 Database: postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
echo "   🔴 Redis: localhost:6379"
echo "   🌐 API: http://localhost:8081"
echo ""

# Export environment variables for local database
export APP_ENV=local
export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
export LOCAL_DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"

# IMPORTANT: Use localhost for OAuth (Google doesn't allow private IPs)
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
export BETTER_AUTH_URL="http://localhost:8081"
export EXPO_PUBLIC_API_URL="http://localhost:8081"

# Load Google OAuth credentials from .env if not already set
if [ -z "$GOOGLE_CLIENT_ID" ]; then
    if [ -f .env ]; then
        export $(cat .env | grep -E '^GOOGLE_|^EXPO_PUBLIC_GOOGLE_' | xargs)
    fi
fi

# Clear any conflicting environment variables
unset EXPO_PUBLIC_API_URL_NGROK
unset NEON_DATABASE_URL

# Force Expo Go mode (not development build)
export EXPO_USE_DEV_CLIENT=false

echo "📱 Starting in Expo Go mode..."
echo ""

# Check if healthcare tables exist by looking for the alerts table
echo "Checking healthcare setup..."
if ! docker exec myexpo-postgres-local psql -U myexpo -d myexpo_dev -c "SELECT 1 FROM alerts LIMIT 1;" &>/dev/null; then
    echo "⚠️  Healthcare tables not found. Setting up..."
    APP_ENV=local DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev" bun run scripts/setup-healthcare-local.ts
    echo "✅ Healthcare setup complete!"
else
    echo "✅ Healthcare tables already exist"
fi

echo ""

# Start Expo with explicit flags for Expo Go
exec npx expo start \
  --host lan \
  --clear \
  --go