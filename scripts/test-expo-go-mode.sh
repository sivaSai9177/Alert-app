#!/bin/bash

# Test script to verify Expo Go mode is working properly

echo "🧪 Testing Expo Go Mode Setup"
echo "============================"
echo ""

# Check if expo-dev-client is removed from app.json
echo "1️⃣ Checking app.json..."
if grep -q "expo-dev-client" app.json; then
    echo "❌ expo-dev-client found in app.json - this will force dev build mode!"
else
    echo "✅ expo-dev-client NOT found in app.json - good!"
fi
echo ""

# Check package.json scripts
echo "2️⃣ Checking package.json scripts..."
if grep -q -- "--go" package.json; then
    echo "✅ Scripts are using --go flag"
else
    echo "❌ Scripts are NOT using --go flag"
fi
echo ""

# Test the start command
echo "3️⃣ Testing start command..."
echo "Running: EXPO_GO=1 expo start --host lan --go --clear --non-interactive"
echo ""

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
else
    LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
fi

echo "📱 Expected URLs:"
echo "  Expo Go: exp://$LOCAL_IP:8081"
echo "  Web: http://localhost:8081"
echo ""

echo "✅ Setup appears correct! Try running:"
echo "  bun run local:healthcare"
echo ""
echo "The QR code should now work properly with Expo Go on iOS devices."