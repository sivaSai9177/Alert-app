#!/bin/bash

echo "🚀 Starting EAS Preview Builds for iOS and Android"
echo ""
echo "⚠️  Important: This will trigger preview builds on EAS servers"
echo ""
echo "📱 Build Profile: preview"
echo "🔧 API URL: http://192.168.1.101:8081"
echo "🔐 OAuth: Google OAuth configured"
echo ""

# First check if we have Android credentials
echo "🔍 Checking Android credentials..."
ANDROID_KEYSTORE_EXISTS=$(eas credentials --platform android | grep -c "Android Keystore" || true)

if [ "$ANDROID_KEYSTORE_EXISTS" -eq "0" ]; then
    echo "❌ No Android keystore found. Please run this command manually first:"
    echo "   eas build --profile preview --platform android"
    echo "   Select 'Yes' when prompted to generate a new keystore"
    echo ""
    echo "Then re-run this script to build both platforms."
    exit 1
fi

# Build Android
echo "🤖 Starting Android build..."
eas build --profile preview --platform android --non-interactive

# Build iOS
echo ""
echo "🍎 Starting iOS build..."
eas build --profile preview --platform ios --non-interactive

echo ""
echo "✅ Build commands executed!"
echo ""
echo "📝 Next steps:"
echo "1. Monitor build progress at: https://expo.dev/accounts/siva9177/projects/expo-fullstack-starter/builds"
echo "2. Once builds complete, download and install on devices"
echo "3. For Android: Install the APK on your device"
echo "4. For iOS: Install on simulator or device"
echo ""
echo "⚠️  OAuth Notes:"
echo "- Make sure your local server is running when testing OAuth"
echo "- Use ngrok if testing on physical devices: ngrok http 8081"
echo "- Update EXPO_PUBLIC_API_URL with ngrok URL if needed"