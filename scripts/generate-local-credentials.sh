#!/bin/bash

echo "🔐 Generating Local Credentials for EAS Build"
echo "============================================="

# Create credentials directory
mkdir -p credentials

# Generate Android keystore
echo ""
echo "📱 Generating Android Keystore..."
echo "You'll be prompted for keystore information."
echo ""

keytool -genkey -v \
  -keystore ./credentials/android-keystore.jks \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass android123 \
  -keypass android123 \
  -dname "CN=Expo Development, OU=Development, O=Expo, L=San Francisco, ST=CA, C=US"

if [ $? -eq 0 ]; then
    echo "✅ Android keystore generated successfully!"
    echo "📍 Location: ./credentials/android-keystore.jks"
    echo "🔑 Keystore password: android123"
    echo "🔑 Key password: android123"
    echo "🔑 Alias: upload"
else
    echo "❌ Failed to generate Android keystore"
    exit 1
fi

# Create credentials.json
echo ""
echo "📝 Creating credentials.json..."

cat > credentials.json << EOF
{
  "android": {
    "keystore": {
      "keystorePath": "./credentials/android-keystore.jks",
      "keystorePassword": "android123",
      "keyAlias": "upload",
      "keyPassword": "android123"
    }
  }
}
EOF

echo "✅ credentials.json created!"

# Update .gitignore
echo ""
echo "🔒 Updating .gitignore for security..."

if ! grep -q "credentials/" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Local credentials" >> .gitignore
    echo "credentials/" >> .gitignore
    echo "credentials.json" >> .gitignore
    echo "*.jks" >> .gitignore
    echo "*.p12" >> .gitignore
    echo "*.mobileprovision" >> .gitignore
    echo "✅ .gitignore updated!"
else
    echo "✅ .gitignore already configured!"
fi

echo ""
echo "🎉 Local credentials setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'"
echo "2. Run: eas build --profile development --platform android --local"
echo ""
echo "📱 For iOS builds, you'll need to add iOS certificates manually"
echo "📖 See: https://docs.expo.dev/app-signing/local-credentials/"