#!/bin/bash

# Quick copy script for expo-agentic-starter
# Usage: ./copy-to-expo-agentic.sh

TARGET="../expo-agentic-starter"

if [ ! -d "$TARGET" ]; then
    echo "❌ expo-agentic-starter not found at $TARGET"
    echo "Please clone it first:"
    echo "cd .. && git clone https://github.com/sivaSai9177/expo-agentic-starter.git"
    exit 1
fi

echo "📦 Copying files to expo-agentic-starter..."

# Create directories
mkdir -p $TARGET/lib/core
mkdir -p $TARGET/scripts

# Copy files
cp lib/core/unified-env.ts $TARGET/lib/core/
cp scripts/start-unified.sh $TARGET/scripts/
cp .env.local $TARGET/.env.local.example

# Make script executable
chmod +x $TARGET/scripts/start-unified.sh

# Copy documentation
cp ENVIRONMENT_MIGRATION_GUIDE.md $TARGET/
cp APPLY_TO_GITHUB_REPO.md $TARGET/

echo "✅ Files copied!"
echo ""
echo "📝 Next steps:"
echo "1. cd $TARGET"
echo "2. git checkout -b feat/unified-environment"
echo "3. Update the following files manually:"
echo "   - lib/auth/auth.ts"
echo "   - lib/auth/auth-client.ts"
echo "   - lib/trpc.tsx"
echo "   - package.json"
echo ""
echo "See APPLY_TO_GITHUB_REPO.md for detailed instructions"