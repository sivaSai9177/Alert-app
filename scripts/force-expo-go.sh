#!/bin/bash

# Force Expo Go mode with correct URLs

echo "🚀 Starting in Expo Go mode (forced)..."
echo "====================================="
echo ""

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
else
    LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
fi

# Set environment to force Expo Go
export EXPO_USE_DEV_CLIENT=false
export EXPO_GO=1
export EXPO_DEV_CLIENT_NETWORK_INSPECTOR=0
export REACT_NATIVE_PACKAGER_HOSTNAME=$LOCAL_IP

# Clear any cached settings
rm -rf .expo/settings.json 2>/dev/null
rm -rf .expo/devices.json 2>/dev/null

echo "📱 URLs for Expo Go:"
echo "  QR Code: exp://$LOCAL_IP:8081"
echo "  Web: http://localhost:8081"
echo ""
echo "⚠️  Make sure your iOS device is on the same WiFi network!"
echo ""

# Start Expo with explicit settings
exec bunx expo start \
  --host lan \
  --go \
  --clear \
  --dev-client=false