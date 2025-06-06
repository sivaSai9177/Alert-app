#!/bin/bash

# Check if token is provided
if [ -z "$EXPO_TOKEN" ]; then
    echo "❌ EXPO_TOKEN environment variable not set"
    echo ""
    echo "Please run:"
    echo "export EXPO_TOKEN='your-token-here'"
    echo "bash scripts/token-build.sh"
    exit 1
fi

echo "🚀 Starting EAS builds with token authentication..."
echo "📊 Monitor at: https://expo.dev/accounts/siva9177/projects"
echo ""

# Configure EAS if needed
if [ ! -f "eas.json" ] || ! grep -q "development" eas.json; then
    echo "📋 Configuring EAS..."
    eas build:configure --non-interactive
fi

echo "🤖 Building Android development build..."
eas build --profile development --platform android --non-interactive &
ANDROID_PID=$!

echo "🍎 Building iOS development build..."  
eas build --profile development --platform ios --non-interactive &
IOS_PID=$!

echo ""
echo "⏳ Both builds started in parallel..."
echo "🔄 This will take 10-20 minutes per platform"

# Wait for both
wait $ANDROID_PID
wait $IOS_PID

echo ""
echo "✅ Build process complete!"
echo "📧 Check email for download links"