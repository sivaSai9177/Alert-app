#!/bin/bash

# Start web with preview database configuration

echo "🚀 Starting web with preview database..."

# Export environment variables for preview database
export APP_ENV=preview
export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_preview"
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
export BETTER_AUTH_URL="http://localhost:8081"

# Check if local database is running using docker
if ! docker ps | grep -q "myexpo-postgres-local"; then
    echo "⚠️  Local PostgreSQL is not running!"
    echo "Start it with: bun run db:local:up"
    exit 1
fi

echo "✅ Using preview database"
echo "📦 Database: postgresql://localhost:5432/myexpo_preview"
echo "🌐 API: http://localhost:8081"
echo ""

# Export additional environment variables
export EXPO_PUBLIC_API_URL="http://localhost:8081"

# Clear any ngrok URL to avoid conflicts
unset EXPO_PUBLIC_API_URL_NGROK

# Start Expo web with clear cache
exec expo start --web --host lan --clear