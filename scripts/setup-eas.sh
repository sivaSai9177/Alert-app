#!/bin/bash

echo "🚀 Setting up EAS for mobile OAuth testing..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    bun install -g eas-cli
fi

echo "📧 Please run the following command to log in to EAS:"
echo "eas login"
echo ""
echo "Use these credentials when prompted:"
echo "Email: sirigirisiva1@gmail.com"
echo "Password: [your password]"
echo ""
echo "After logging in, run:"
echo "bash scripts/build-development.sh"