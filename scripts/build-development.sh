#!/bin/bash

echo "🚀 Creating EAS development builds for OAuth testing..."

# Check if logged in
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to EAS. Please run: eas login"
    exit 1
fi

echo "✅ Logged in to EAS as: $(eas whoami)"

# Configure EAS build if not already configured
if [ ! -f "eas.json" ]; then
    echo "📋 Configuring EAS build..."
    eas build:configure
fi

echo "📱 Building development builds..."

# Build for iOS
echo "🍎 Building iOS development build..."
eas build --profile development --platform ios --non-interactive

# Build for Android  
echo "🤖 Building Android development build..."
eas build --profile development --platform android --non-interactive

echo "✅ Development builds submitted!"
echo ""
echo "📋 Next steps:"
echo "1. Wait for builds to complete (10-20 minutes each)"
echo "2. Install builds on your devices"
echo "3. Test Google OAuth flow"
echo ""
echo "💡 Monitor build progress at: https://expo.dev/accounts/siva9177/projects"