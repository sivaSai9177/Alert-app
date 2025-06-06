#!/bin/bash

echo "🚀 Automated EAS Build Process"
echo "================================"

# Check if already logged in
if eas whoami &> /dev/null; then
    echo "✅ Already logged in to EAS as: $(eas whoami)"
else
    echo "❌ Not logged in to EAS"
    echo ""
    echo "Please run the following command in your terminal:"
    echo "eas login"
    echo ""
    echo "Use these credentials:"
    echo "Email: sirigirisiva1@gmail.com"
    echo "Password: Sivasai@123"
    echo ""
    echo "Then run this script again or use: bun run eas:build:dev"
    exit 1
fi

echo ""
echo "🔧 Configuring EAS build..."

# Configure EAS build if needed
if [ ! -f "eas.json" ] || ! grep -q "development" eas.json; then
    echo "Setting up eas.json configuration..."
    eas build:configure --non-interactive
fi

echo ""
echo "📱 Starting development builds..."
echo "This will take 10-20 minutes per platform"
echo ""

# Build both platforms
echo "🤖 Building Android development build..."
eas build --profile development --platform android --non-interactive &
ANDROID_PID=$!

echo "🍎 Building iOS development build..."
eas build --profile development --platform ios --non-interactive &
IOS_PID=$!

echo ""
echo "⏳ Both builds started in parallel..."
echo "📊 Monitor progress at: https://expo.dev/accounts/siva9177/projects"
echo ""

# Wait for both builds
wait $ANDROID_PID
ANDROID_EXIT_CODE=$?

wait $IOS_PID
IOS_EXIT_CODE=$?

echo ""
echo "📊 Build Results:"
echo "=================="

if [ $ANDROID_EXIT_CODE -eq 0 ]; then
    echo "✅ Android build: SUCCESS"
else
    echo "❌ Android build: FAILED (exit code: $ANDROID_EXIT_CODE)"
fi

if [ $IOS_EXIT_CODE -eq 0 ]; then
    echo "✅ iOS build: SUCCESS"
else
    echo "❌ iOS build: FAILED (exit code: $IOS_EXIT_CODE)"
fi

echo ""
echo "🎉 Build process complete!"
echo "💡 Check your email or Expo dashboard for download links"