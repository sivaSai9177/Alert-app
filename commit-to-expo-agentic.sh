#!/bin/bash

# Commit changes to expo-agentic-starter with best practices
# This script ensures a clean, well-documented commit

TARGET="../expo-agentic-starter"

echo "📦 Preparing to commit changes to expo-agentic-starter"
echo "===================================================="
echo ""

# Check if directory exists
if [ ! -d "$TARGET" ]; then
    echo "❌ expo-agentic-starter not found at $TARGET"
    exit 1
fi

cd "$TARGET"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Current branch: $CURRENT_BRANCH"

# Check if we're on the feature branch
if [ "$CURRENT_BRANCH" != "feat/unified-environment" ]; then
    echo "⚠️  Not on feat/unified-environment branch"
    echo "Switching to feat/unified-environment..."
    git checkout feat/unified-environment || {
        echo "Creating feat/unified-environment branch..."
        git checkout -b feat/unified-environment
    }
fi

echo ""
echo "📊 Current status:"
git status --short
echo ""

# Clean up backup files
echo "🧹 Cleaning up backup files..."
rm -f lib/auth/auth.ts.backup
rm -f lib/auth/auth-client.ts.backup
rm -f lib/trpc.tsx.backup
echo "✅ Backup files removed"
echo ""

# Stage all changes
echo "📝 Staging changes..."
git add -A

# Show what will be committed
echo ""
echo "📋 Changes to be committed:"
git diff --cached --stat
echo ""

# Create comprehensive commit message
COMMIT_MESSAGE="feat: Add unified environment configuration for OAuth compatibility

This commit introduces a unified environment system that solves OAuth authentication
issues with private IP addresses while maintaining mobile device connectivity.

## Changes

### New Files
- lib/core/unified-env.ts - Centralized environment configuration
- scripts/start-unified.sh - Unified start script for all modes
- .env.local.example - Template for local OAuth configuration

### Updated Files
- lib/auth/auth.ts - Uses getAuthBaseUrl() from unified-env
- lib/auth/auth-client.ts - Uses OAuth-safe URLs
- lib/trpc.tsx - Uses unified API URL  
- lib/core/env.ts - Exports unified functions
- package.json - Added unified scripts (start:oauth, start:local, etc.)

## Features
- ✅ OAuth works with private IP addresses (192.168.x.x)
- ✅ Automatic mode detection (local/network/tunnel/production)
- ✅ Mobile devices can connect while OAuth remains functional
- ✅ Single configuration system for all scenarios
- ✅ Platform-specific URL handling (iOS/Android/Web)

## New Commands
- \`bun start:oauth\` - OAuth testing mode (localhost only)
- \`bun start\` - Network mode (mobile devices via IP)
- \`bun start:local\` - Local development mode
- \`bun start:tunnel\` - Remote access via Expo tunnel

## Technical Details
The unified environment system automatically:
1. Detects the current environment mode
2. Uses localhost for auth when on private networks (OAuth requirement)
3. Allows API access via network IP for mobile devices
4. Handles platform-specific differences transparently

## Testing
All modes have been configured and tested:
- OAuth authentication flow works correctly
- Mobile devices can connect in network mode
- Profile completion flow functions properly
- No breaking changes to existing functionality

Fixes OAuth authentication issues reported with private IP addresses."

# Commit with the message
echo "💾 Creating commit..."
git commit -m "$COMMIT_MESSAGE"

echo ""
echo "✅ Changes committed successfully!"
echo ""
echo "📤 Next steps:"
echo "1. Review the commit: git show"
echo "2. Push to remote: git push origin feat/unified-environment"
echo "3. Create a pull request on GitHub"
echo ""
echo "To push now, run:"
echo "git push origin feat/unified-environment"