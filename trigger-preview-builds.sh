#!/bin/bash

echo "🚀 Starting EAS Preview Builds for iOS and Android"
echo ""
echo "⚠️  Important: This will trigger preview builds on EAS servers"
echo ""
echo "📱 Build Profile: preview"
echo "🔧 API URL: http://localhost:8081"
echo "🔐 OAuth: Google OAuth configured"
echo ""

# First, let's build for Android
echo "🤖 Starting Android build..."
echo "Press 'y' when prompted to generate a new keystore"
echo ""
eas build --profile preview --platform android

# Then build for iOS
echo ""
echo "🍎 Starting iOS build..."
echo "Note: iOS simulator build will be created"
echo ""
eas build --profile preview --platform ios

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