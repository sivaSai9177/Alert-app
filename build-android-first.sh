#!/bin/bash

echo "🤖 Android Preview Build"
echo "========================"
echo ""
echo "This will start an Android preview build."
echo "You'll be prompted to generate a keystore if this is your first build."
echo ""
echo "When prompted 'Generate a new Android Keystore?', type: y"
echo ""
echo "Starting build in 3 seconds..."
sleep 3

# Run Android build with TTY support
echo "y" | eas build --profile preview --platform android

echo ""
echo "✅ Android build triggered!"
echo "Monitor progress at: https://expo.dev/accounts/siva9177/projects/expo-fullstack-starter/builds"