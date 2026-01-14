#!/bin/bash

# Start script optimized for Expo Go (no dev client)

echo "🚀 Starting in Expo Go mode (no dev client)..."
echo "=========================================="
echo ""

# Temporarily use app.expo-go.json which doesn't have expo-dev-client plugin
cp app.expo-go.json app.json

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Restoring original app.json..."
    cp app.json.backup app.json 2>/dev/null || true
    rm -f app.json.backup
    exit 0
}

trap cleanup EXIT INT TERM

# Backup original app.json
cp app.json app.json.backup

# Detect local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
else
    LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
fi

# Setup healthcare
echo "🏥 Setting up healthcare..."
APP_ENV=local DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev" bun run scripts/setup-healthcare-local.ts

# Set environment
export APP_ENV=local
export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
export EXPO_GO=1
export EXPO_USE_DEV_CLIENT=false
export REACT_NATIVE_PACKAGER_HOSTNAME=$LOCAL_IP
export EXPO_PUBLIC_API_URL="http://$LOCAL_IP:8081"
export BETTER_AUTH_URL="http://localhost:8081"
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"

echo ""
echo "📱 Expo Go URLs:"
echo "  iOS/Android: exp://$LOCAL_IP:8081"
echo "  Web: http://localhost:8081"
echo ""

# Start Expo in Go mode
exec npx expo start --host lan --go --clear