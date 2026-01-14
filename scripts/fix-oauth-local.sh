#!/bin/bash

echo "🔧 Fixing OAuth for local development..."
echo ""

# Load local environment variables
if [ -f .env.local ]; then
    echo "📋 Loading .env.local..."
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "⚠️  .env.local not found, using defaults..."
    # Force localhost for OAuth (Google doesn't allow private IPs)
    export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
    export BETTER_AUTH_URL="http://localhost:8081"
    export EXPO_PUBLIC_API_URL="http://localhost:8081"
fi

# Check Google credentials
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  echo "❌ Missing Google OAuth credentials!"
  echo "Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"
  exit 1
fi

echo "✅ OAuth configured for localhost"
echo "📍 Base URL: $BETTER_AUTH_BASE_URL"
echo "🔑 Google Client ID: ${GOOGLE_CLIENT_ID:0:10}..."
echo ""

# Check if local database is running
if ! docker ps | grep -q "myexpo-postgres-local"; then
    echo "⚠️  Local PostgreSQL is not running!"
    echo "Starting local database services..."
    docker-compose -f docker-compose.local.yml up -d postgres-local redis-local
    sleep 3
fi

echo "✅ Local database running"
echo ""

# Run healthcare setup if needed
echo "Checking healthcare setup..."
if ! docker exec myexpo-postgres-local psql -U myexpo -d myexpo_dev -c "SELECT 1 FROM alerts LIMIT 1;" &>/dev/null; then
    echo "⚠️  Healthcare tables not found. Setting up..."
    APP_ENV=local DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev" bun run scripts/setup-healthcare-local.ts
    echo "✅ Healthcare setup complete!"
fi

echo "✅ Healthcare tables ready"
echo ""

echo "📱 Starting Expo with OAuth-friendly configuration..."
echo ""
echo "🌐 Access the app at: http://localhost:8081"
echo "📧 Demo credentials:"
echo "   - Operator: johncena@gmail.com"
echo "   - Nurse: doremon@gmail.com"
echo "   - Doctor: johndoe@gmail.com"
echo "   - Head Doctor: saipramod273@gmail.com"
echo ""
echo "🔐 OAuth: Click 'Continue with Google' to test OAuth login"
echo ""

# Start Expo with OAuth-friendly settings
exec npx expo start --host localhost --clear --go