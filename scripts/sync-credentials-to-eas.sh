#!/bin/bash

echo "🔄 Syncing Local Credentials to EAS for Team Sharing"
echo "====================================================="

export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'

echo ""
echo "📱 Step 1: Upload Android Credentials to EAS"
echo "This will upload your local keystore for team sharing"
echo ""

# Check if Android keystore exists
if [ -f "credentials/android-keystore.jks" ]; then
    echo "✅ Found Android keystore: credentials/android-keystore.jks"
    echo ""
    echo "Running: eas credentials:configure --platform android"
    echo "This will upload your local keystore to EAS"
    echo ""
    
    # Note: This would typically be interactive, but we'll provide the command
    echo "🔧 Manual Command (run this):"
    echo "eas credentials:configure --platform android"
    echo ""
    echo "When prompted:"
    echo "- Select: 'Upload a keystore'"
    echo "- Keystore path: ./credentials/android-keystore.jks"
    echo "- Keystore password: android123"
    echo "- Key alias: upload"
    echo "- Key password: android123"
else
    echo "❌ Android keystore not found. Run generate-local-credentials.sh first"
fi

echo ""
echo "🍎 Step 2: Configure iOS Credentials"
echo "This will set up iOS development certificates"
echo ""

echo "🔧 Command to run:"
echo "eas credentials:configure --platform ios"
echo ""
echo "This will:"
echo "1. Check for existing certificates"
echo "2. Generate new ones if needed"
echo "3. Upload to EAS for team sharing"
echo "4. Download provisioning profiles"

echo ""
echo "📊 Step 3: Verify Credential Sync"
echo ""
echo "🔧 Commands to verify:"
echo "eas credentials --platform android"
echo "eas credentials --platform ios"

echo ""
echo "🎯 Benefits of EAS Credential Sync:"
echo "✅ Team members can access same credentials"
echo "✅ Consistent signing across builds"
echo "✅ Automatic credential management"
echo "✅ Backup of your signing certificates"

echo ""
echo "📋 Next Steps:"
echo "1. Run the Android credential upload command above"
echo "2. Run the iOS credential setup command"
echo "3. Verify both platforms have credentials"
echo "4. Build with either local or remote credentials"

echo ""
echo "🚀 After credential sync, you can build with:"
echo "eas build --profile development --platform ios    # Uses EAS credentials"
echo "eas build --profile development --platform ios --local  # Uses local credentials"