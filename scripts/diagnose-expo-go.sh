#!/bin/bash

# Diagnostic script for Expo Go connectivity issues

echo "🔍 Expo Go Diagnostic Tool"
echo "=========================="
echo ""

# Check current environment
echo "📋 Environment Variables:"
echo "  APP_ENV: ${APP_ENV:-not set}"
echo "  EXPO_GO: ${EXPO_GO:-not set}"
echo "  EXPO_USE_DEV_CLIENT: ${EXPO_USE_DEV_CLIENT:-not set}"
echo "  REACT_NATIVE_PACKAGER_HOSTNAME: ${REACT_NATIVE_PACKAGER_HOSTNAME:-not set}"
echo ""

# Detect IP addresses
echo "🌐 Network Information:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    EN0=$(ipconfig getifaddr en0 2>/dev/null)
    EN1=$(ipconfig getifaddr en1 2>/dev/null)
    echo "  en0 (WiFi): ${EN0:-not connected}"
    echo "  en1 (Ethernet): ${EN1:-not connected}"
    LOCAL_IP=${EN0:-${EN1:-localhost}}
else
    LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
    echo "  IP: $LOCAL_IP"
fi
echo ""

# Check Expo CLI version
echo "📱 Expo CLI:"
npx expo --version
echo ""

# Check if dev client is installed
echo "🔧 Dev Client Status:"
if grep -q "expo-dev-client" package.json; then
    echo "  expo-dev-client is installed"
    VERSION=$(grep -A1 "expo-dev-client" package.json | grep -o '"[0-9].*"' | tr -d '"')
    echo "  Version: $VERSION"
else
    echo "  expo-dev-client is NOT installed"
fi
echo ""

# Check app.json for dev client plugin
echo "📄 app.json Configuration:"
if grep -q "expo-dev-client" app.json; then
    echo "  ⚠️  expo-dev-client plugin is ENABLED in app.json"
    echo "  This may force development build mode"
else
    echo "  ✅ expo-dev-client plugin is NOT in app.json"
fi
echo ""

# Recommended URLs
echo "🚀 Recommended URLs for iOS Physical Device:"
echo "  Expo Go: exp://$LOCAL_IP:8081"
echo "  Web Preview: http://$LOCAL_IP:8081"
echo ""

# Start command recommendation
echo "💡 Recommended Start Command:"
echo "  EXPO_GO=1 REACT_NATIVE_PACKAGER_HOSTNAME=$LOCAL_IP npx expo start --host lan --go --clear"
echo ""

# Test connectivity
echo "🧪 Testing Local Connectivity:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 | grep -q "200"; then
    echo "  ✅ Expo server is running on localhost:8081"
else
    echo "  ❌ Expo server is NOT running on localhost:8081"
fi

if [ "$LOCAL_IP" != "localhost" ]; then
    if curl -s -o /dev/null -w "%{http_code}" http://$LOCAL_IP:8081 | grep -q "200"; then
        echo "  ✅ Expo server is accessible at $LOCAL_IP:8081"
    else
        echo "  ⚠️  Expo server might not be accessible at $LOCAL_IP:8081"
        echo "     Make sure to use --host lan when starting"
    fi
fi