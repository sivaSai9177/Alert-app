#!/bin/bash

# Fix Expo Go URL issue

echo "🔧 Fixing Expo Go URL issue..."
echo "============================="
echo ""

# Clear ALL Expo caches
echo "🧹 Clearing all Expo caches..."
rm -rf .expo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
rm -rf ~/.expo 2>/dev/null

# Kill any existing Expo processes
echo "🛑 Stopping any existing Expo processes..."
pkill -f "expo" 2>/dev/null || true
pkill -f "react-native" 2>/dev/null || true
sleep 2

# Reset watchman
echo "🔄 Resetting watchman..."
watchman watch-del-all 2>/dev/null || true

echo "✅ Cleanup complete!"
echo ""
echo "Now run: bun run local:healthcare"