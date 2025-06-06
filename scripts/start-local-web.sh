#!/bin/bash

# Start web with local database configuration

echo "🚀 Starting web with local database..."

# Check if local database is running using docker
if ! docker ps | grep -q "myexpo-postgres-local"; then
    echo "⚠️  Local PostgreSQL is not running!"
    echo "Start it with: bun run db:local:up"
    exit 1
fi

echo "✅ Using local database"
echo "📦 Database: postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
echo "🌐 API: http://localhost:8081"
echo ""

# Export environment variables for local database
export APP_ENV=local
export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
export BETTER_AUTH_URL="http://localhost:8081"
export EXPO_PUBLIC_API_URL="http://localhost:8081"

# Clear any ngrok URL to avoid conflicts
unset EXPO_PUBLIC_API_URL_NGROK

# Start Expo web with clear cache
exec expo start --web --host lan --clear