#!/bin/bash

# Script to start healthcare setup for iOS physical devices

echo "📱 Hospital Alert System - iOS Device Setup"
echo "=========================================="
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
export APP_ENV=local
export EXPO_PUBLIC_ENABLE_WS=true
export EXPO_PUBLIC_WS_PORT=3001
export EXPO_PUBLIC_WS_URL="ws://$LOCAL_IP:3001"
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
echo "🔧 Setting up healthcare tables and data..."
bun run scripts/setup-healthcare-local.ts

# Start WebSocket server in background (optional, skip if it fails)
echo ""
echo "🌐 Starting WebSocket server on port 3001..."
# Try to start WebSocket server but don't fail if it doesn't work
(bun run scripts/start-websocket-server.ts 2>/dev/null &)
WS_PID=$!
if [ $? -eq 0 ]; then
    echo "WebSocket server started with PID: $WS_PID"
else
    echo "⚠️  WebSocket server couldn't start (optional feature)"
    WS_PID=""
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    if [ -n "$WS_PID" ]; then
        echo "🛑 Stopping WebSocket server..."
        kill $WS_PID 2>/dev/null
    fi
    exit
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

echo ""
echo "🚀 Starting Expo with network host: $LOCAL_IP"
echo ""
echo "📱 To connect your iOS device:"
echo "   1. Make sure your iPhone is on the same WiFi network"
echo "   2. Open Expo Go app"
echo "   3. Tap 'Enter URL manually'"
echo "   4. Enter: exp://$LOCAL_IP:8081"
echo ""
echo "📡 WebSocket endpoint: ws://$LOCAL_IP:3001"
echo ""

# Start Expo in LAN mode (it will use the network IP automatically)
exec bunx expo start --lan --clear --go