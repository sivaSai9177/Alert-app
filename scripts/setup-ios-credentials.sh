#!/bin/bash

echo "🍎 Setting up iOS Credentials for Local Development"
echo "=================================================="

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ iOS development requires macOS"
    exit 1
fi

echo ""
echo "📋 iOS Credential Requirements:"
echo "1. Apple Developer Account (free or paid)"
echo "2. Development Certificate"
echo "3. Development Provisioning Profile"
echo ""

# Create iOS credentials directory
mkdir -p credentials/ios

echo "🔧 Option 1: Generate iOS credentials automatically with EAS"
echo "This will create development certificates and provisioning profiles"
echo ""
echo "Run this command:"
echo "export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'"
echo "eas credentials:configure --platform ios"
echo ""

echo "🔧 Option 2: Use Xcode to generate credentials"
echo "1. Open Xcode"
echo "2. Create new project with bundle ID: com.siva9177.expofullstackstarter"
echo "3. Select your Apple ID in signing"
echo "4. Xcode will generate certificates automatically"
echo "5. Export certificates from Keychain Access"
echo ""

echo "🔧 Option 3: Manual credential setup"
echo "If you have existing certificates:"
echo "1. Export .p12 certificate from Keychain"
echo "2. Download .mobileprovision from Apple Developer Portal"
echo "3. Update credentials.json with paths"
echo ""

# Create iOS credentials template
cat > credentials/ios-template.json << EOF
{
  "ios": {
    "provisioningProfilePath": "./credentials/ios/development.mobileprovision",
    "distributionCertificate": {
      "path": "./credentials/ios/development.p12",
      "password": "your-certificate-password"
    }
  }
}
EOF

echo "📝 Created iOS credentials template: credentials/ios-template.json"
echo ""
echo "🎯 Recommended: Use Option 1 (EAS automatic generation)"
echo "It's the easiest and most reliable method!"
echo ""
echo "🔄 After iOS credentials are ready, run:"
echo "eas build --profile development --platform ios --local"