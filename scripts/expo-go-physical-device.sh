#!/bin/bash

# Script specifically for physical device testing with Expo Go

echo "📱 Starting Expo Go for Physical Device Testing"
echo "============================================="
echo ""

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
    if [ -z "$LOCAL_IP" ]; then
        echo "❌ Could not detect WiFi IP address!"
        echo "Make sure you're connected to WiFi"
        exit 1
    fi
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo "🌐 Your local IP: $LOCAL_IP"
echo ""

# Setup environment
export APP_ENV=local
export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
export EXPO_USE_DEV_CLIENT=false
export EXPO_GO=1
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export REACT_NATIVE_PACKAGER_HOSTNAME=$LOCAL_IP
export EXPO_PUBLIC_API_URL="http://$LOCAL_IP:8081"
export BETTER_AUTH_URL="http://localhost:8081"
export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"

# Healthcare setup
echo "🏥 Setting up healthcare..."
bun run scripts/setup-healthcare-local.ts

# Clear Metro cache specifically
echo "🧹 Clearing Metro cache..."
rm -rf node_modules/.cache/metro
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# The magic fix - create a custom metro config
cat > metro.config.expo-go.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Force Expo Go behavior
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Force exp:// protocol for QR codes
      if (req.url && req.url.includes('/_expo/loading')) {
        res.writeHead(302, {
          Location: `exp://${req.headers.host}`
        });
        res.end();
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: './app/global.css' });
EOF

# Backup original metro config
mv metro.config.js metro.config.js.original 2>/dev/null || true
cp metro.config.expo-go.js metro.config.js

# Cleanup function
cleanup() {
    echo ""
    echo "🔄 Restoring original configuration..."
    mv metro.config.js.original metro.config.js 2>/dev/null || true
    rm -f metro.config.expo-go.js
}
trap cleanup EXIT

echo ""
echo "📱 IMPORTANT INSTRUCTIONS FOR PHYSICAL DEVICE:"
echo "============================================="
echo ""
echo "1. Make sure your iPhone is on the same WiFi network"
echo "2. Open Expo Go app on your iPhone"
echo "3. The QR code should work now!"
echo ""
echo "📍 Direct URL for manual entry: exp://$LOCAL_IP:8081"
echo ""
echo "If QR still shows loading URL, manually enter:"
echo "👉 exp://$LOCAL_IP:8081"
echo ""

# Start Expo without opening iOS simulator automatically
exec bunx expo start --lan --go --clear