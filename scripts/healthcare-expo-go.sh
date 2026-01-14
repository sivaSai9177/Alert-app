#!/bin/bash

# Healthcare setup with guaranteed Expo Go mode

echo "🏥 Starting Healthcare with Expo Go..."
echo "===================================="
echo ""

# Load environment
if [ -f .env.local ]; then
    set -a
    source .env.local
    set +a
fi

# Setup local database
export APP_ENV=local
export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"

# Check if local database is running
if ! docker ps | grep -q "myexpo-postgres-local"; then
    echo "⚠️  Starting local database..."
    docker-compose -f docker-compose.local.yml up -d postgres-local redis-local
    sleep 3
fi

# Run healthcare setup
echo "🔧 Setting up healthcare tables..."
bun run scripts/setup-healthcare-local.ts

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
else
    LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
fi

# Set environment for Expo Go
export EXPO_USE_DEV_CLIENT=false
export EXPO_GO=1
export EXPO_DEV_CLIENT_NETWORK_INSPECTOR=0
export REACT_NATIVE_PACKAGER_HOSTNAME=$LOCAL_IP
export EXPO_PUBLIC_API_URL="http://$LOCAL_IP:8081"
export BETTER_AUTH_URL="http://localhost:8081"
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"

# Clear Expo cache
echo "🧹 Clearing Expo cache..."
rm -rf .expo/devices.json .expo/settings.json 2>/dev/null
rm -rf node_modules/.cache/metro 2>/dev/null

echo ""
echo "📱 Expo Go URLs:"
echo "  QR Code should show: exp://$LOCAL_IP:8081"
echo "  Manual entry: exp://$LOCAL_IP:8081"
echo "  Web: http://localhost:8081"
echo ""

# Start with explicit Expo Go settings
exec bunx expo start \
  --lan \
  --go \
  --clear \
  --scheme exp