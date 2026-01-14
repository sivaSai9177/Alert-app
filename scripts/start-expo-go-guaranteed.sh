#!/bin/bash

# Guaranteed Expo Go mode - fixes loading URL issue

echo "🚀 Starting in GUARANTEED Expo Go mode..."
echo "======================================"
echo ""

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
else
    LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
fi

# Setup environment
export APP_ENV=local
export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
export EXPO_USE_DEV_CLIENT=false
export EXPO_GO=1
export REACT_NATIVE_PACKAGER_HOSTNAME=$LOCAL_IP
export EXPO_PUBLIC_API_URL="http://$LOCAL_IP:8081"
export BETTER_AUTH_URL="http://localhost:8081"
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"

# Healthcare setup
echo "🏥 Setting up healthcare..."
bun run scripts/setup-healthcare-local.ts

# Complete cleanup
echo "🧹 Complete cleanup..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.expo/web-build
pkill -f "expo" 2>/dev/null || true

# Temporarily remove prebuild folders
if [ -d "ios" ]; then
    echo "📱 Temporarily renaming ios folder..."
    mv ios ios.prebuild
fi
if [ -d "android" ]; then
    echo "🤖 Temporarily renaming android folder..."
    mv android android.prebuild
fi

# Create minimal app.json for Expo Go
cat > app.json << 'EOF'
{
  "expo": {
    "name": "Hospital Alert System",
    "slug": "hospital-alert-system",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/images/favicon.png",
      "bundler": "metro",
      "output": "server"
    },
    "plugins": [
      "expo-router"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 EXPO GO URLS:"
echo "  QR Code URL: exp://$LOCAL_IP:8081"
echo "  Manual Entry: exp://$LOCAL_IP:8081"
echo "  Web: http://localhost:8081"
echo ""
echo "⚠️  The QR code MUST show: exp://$LOCAL_IP:8081"
echo "   NOT: http://$LOCAL_IP:8081/_expo/loading"
echo ""

# Cleanup on exit
cleanup() {
    echo ""
    echo "🔄 Restoring folders..."
    if [ -d "ios.prebuild" ]; then
        mv ios.prebuild ios
    fi
    if [ -d "android.prebuild" ]; then
        mv android.prebuild android
    fi
    cp app.json.backup app.json 2>/dev/null || true
}
trap cleanup EXIT

# Backup original app.json
cp app.json.backup app.json.backup 2>/dev/null || true

# Start Expo with minimal config
exec bunx expo start --lan --go --clear