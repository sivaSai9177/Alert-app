#!/bin/bash

# Script to start development mode for iOS physical devices

echo "📱 Development Mode - iOS Device Setup"
echo "====================================="
echo ""

# Function to detect local IP
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - try en0 (WiFi) first, then en1
        IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
    else
        # Linux
        IP=$(hostname -I | awk '{print $1}')
    fi
    
    # Fallback to localhost if no IP found
    if [ -z "$IP" ]; then
        IP="localhost"
    fi
    
    echo $IP
}

# Detect local IP
LOCAL_IP=$(get_local_ip)
echo "🌐 Detected IP address: $LOCAL_IP"

# Export required environment variables for iOS
export REACT_NATIVE_PACKAGER_HOSTNAME=$LOCAL_IP
export EXPO_PUBLIC_API_URL="http://$LOCAL_IP:8081"
export APP_ENV=development
export EXPO_USE_DEV_CLIENT=false
export EXPO_GO=1
export IOS_PHYSICAL_DEVICE=true

# Load existing environment
if [ -f .env.local ]; then
    echo "📋 Loading environment from .env.local..."
    set -a
    source .env.local
    set +a
fi

echo ""
echo "🚀 Starting Expo with network host: $LOCAL_IP"
echo ""
echo "📱 To connect your iOS device:"
echo "   1. Make sure your iPhone is on the same WiFi network"
echo "   2. Open Expo Go app"
echo "   3. Tap 'Enter URL manually'"
echo "   4. Enter: exp://$LOCAL_IP:8081"
echo ""

# Start Expo in LAN mode
exec bunx expo start --lan --clear --go