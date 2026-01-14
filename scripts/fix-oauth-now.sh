#!/bin/bash

echo "🔧 Fixing OAuth Configuration..."

# 1. Ensure we're using localhost (required for Google OAuth)
export EXPO_PUBLIC_API_URL="http://localhost:8081"
export EXPO_PUBLIC_AUTH_URL="http://localhost:8081"
export BETTER_AUTH_URL="http://localhost:8081"
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"

# 2. Set development mode to disable CSRF
export NODE_ENV="development"

# 3. Check if Google credentials exist
if [ -z "$GOOGLE_CLIENT_ID" ]; then
  echo "⚠️  Loading Google credentials from .env.local..."
  if [ -f .env.local ]; then
    export $(cat .env.local | grep -E '^GOOGLE_' | xargs)
  fi
fi

# 4. Kill any existing Expo process
echo "🛑 Stopping existing Expo process..."
pkill -f "expo start" || true

# 5. Clear Expo cache
echo "🧹 Clearing Expo cache..."
rm -rf .expo/
rm -rf node_modules/.cache/

# 6. Start with OAuth-friendly configuration
echo "✅ Starting Expo with OAuth configuration..."
echo "📍 Access at: http://localhost:8081"
echo "🔐 OAuth will redirect to: http://localhost:8081/api/auth/callback/google"
echo ""

# Start Expo with localhost binding
APP_ENV=local EXPO_GO=1 NODE_ENV=development expo start --host localhost --go --clear