#!/bin/bash

# Execute git commands for expo-agentic-starter from current directory

TARGET="../expo-agentic-starter"

echo "🚀 Committing changes to expo-agentic-starter"
echo "==========================================="
echo ""

# Function to run git commands in target directory
git_in_target() {
    git -C "$TARGET" "$@"
}

# Check if directory exists
if [ ! -d "$TARGET" ]; then
    echo "❌ expo-agentic-starter not found at $TARGET"
    exit 1
fi

# Check current status
echo "📊 Current status:"
git_in_target status --short
echo ""

# Clean up backup files
echo "🧹 Cleaning up backup files..."
rm -f "$TARGET/lib/auth/auth.ts.backup"
rm -f "$TARGET/lib/auth/auth-client.ts.backup"  
rm -f "$TARGET/lib/trpc.tsx.backup"

# Check current branch
CURRENT_BRANCH=$(git_in_target branch --show-current)
echo "📌 Current branch: $CURRENT_BRANCH"

# Ensure we're on the feature branch
if [ "$CURRENT_BRANCH" != "feat/unified-environment" ]; then
    echo "Switching to feat/unified-environment..."
    git_in_target checkout -b feat/unified-environment
fi

# Stage all changes
echo ""
echo "📝 Staging all changes..."
git_in_target add -A

# Show what will be committed
echo ""
echo "📋 Files to be committed:"
git_in_target diff --cached --name-status
echo ""

# Commit with comprehensive message
echo "💾 Creating commit..."
git_in_target commit -m "feat: Add unified environment configuration for OAuth compatibility

This commit introduces a unified environment system that solves OAuth authentication
issues with private IP addresses while maintaining mobile device connectivity.

BREAKING CHANGE: Environment configuration has been unified. Update your local
environment files according to .env.local.example.

## Problem Solved
- Google OAuth doesn't accept private IP addresses (192.168.x.x)
- Multiple environment files caused confusion
- Mobile devices couldn't connect when using localhost for OAuth

## Solution
Implemented a unified environment system that:
- Automatically detects environment mode (local/network/tunnel/production)
- Uses localhost for auth endpoints when on private networks
- Allows API access via network IP for mobile devices
- Provides clear, mode-based configuration

## Changes
- Add lib/core/unified-env.ts for centralized configuration
- Update auth modules to use OAuth-safe URLs
- Create unified start script for all scenarios
- Add new npm scripts for different modes
- Update existing modules to use unified configuration

## New Commands
\`\`\`bash
bun start:oauth    # OAuth testing (localhost only)
bun start          # Network mode (mobile + OAuth)
bun start:local    # Local development
bun start:tunnel   # Remote access
\`\`\`

## Migration Guide
1. Copy .env.local.example to .env.local
2. Update with your credentials
3. Use new unified commands
4. Remove old environment-specific files

Refs: #oauth-fix #environment-cleanup" || {
    echo "⚠️  Commit failed or no changes to commit"
    exit 1
}

echo ""
echo "✅ Changes committed successfully!"
echo ""

# Show the commit
echo "📄 Commit details:"
git_in_target log -1 --stat
echo ""

# Prepare push command
echo "📤 Ready to push!"
echo ""
echo "To push to remote, run:"
echo "cd $TARGET && git push origin feat/unified-environment"
echo ""
echo "Or use this command from here:"
echo "git -C $TARGET push origin feat/unified-environment"
echo ""
echo "After pushing, create a Pull Request at:"
echo "https://github.com/sivaSai9177/expo-agentic-starter/pulls"