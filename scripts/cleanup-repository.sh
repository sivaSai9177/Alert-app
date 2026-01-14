#!/bin/bash

# Repository Cleanup Script
# Prepares the repository for branch migration

echo "🧹 Starting repository cleanup..."
echo "================================"
echo ""

# Create cleanup directory
CLEANUP_DIR=".cleanup-archive"
mkdir -p $CLEANUP_DIR

# Archive test scripts
if [ -d "scripts" ]; then
    echo "📦 Archiving test scripts..."
    mkdir -p $CLEANUP_DIR/scripts
    mv scripts/test-*.ts $CLEANUP_DIR/scripts/ 2>/dev/null || true
    mv scripts/test-*.js $CLEANUP_DIR/scripts/ 2>/dev/null || true
    mv scripts/test-*.html $CLEANUP_DIR/scripts/ 2>/dev/null || true
    mv scripts/test-*.sh $CLEANUP_DIR/scripts/ 2>/dev/null || true
    echo "✅ Test scripts archived"
fi

# Clean up environment files
echo "📦 Organizing environment files..."
mkdir -p $CLEANUP_DIR/env-files
# Keep only essential env files
cp .env.example $CLEANUP_DIR/env-files/ 2>/dev/null || true
cp .env.local.template $CLEANUP_DIR/env-files/ 2>/dev/null || true

# Archive temporary files
echo "📦 Archiving temporary files..."
find . -name "*.tmp" -o -name "*.log" -o -name "*.bak" -o -name "*.old" | while read file; do
    mkdir -p "$CLEANUP_DIR/$(dirname "$file")"
    mv "$file" "$CLEANUP_DIR/$file" 2>/dev/null || true
done

# Clean build artifacts
echo "🗑️  Cleaning build artifacts..."
rm -rf dist/
rm -rf build/
rm -rf .expo/
rm -rf .turbo/
rm -rf ios/build/
rm -rf android/build/

# Clean node_modules if requested
read -p "Remove node_modules? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing node_modules..."
    rm -rf node_modules/
fi

# Create migration directory
echo "📁 Creating migration directory..."
mkdir -p .migration
cp ENVIRONMENT_CHANGES_FOR_BRANCH.md .migration/
cp lib/core/unified-env.ts .migration/ 2>/dev/null || true
cp scripts/start-unified.sh .migration/ 2>/dev/null || true

# Summary
echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "- Test scripts archived to: $CLEANUP_DIR/scripts/"
echo "- Environment files backed up to: $CLEANUP_DIR/env-files/"
echo "- Build artifacts removed"
echo "- Migration files prepared in: .migration/"
echo ""
echo "🔄 Next steps:"
echo "1. Review and commit any pending changes"
echo "2. Apply migration to expo-agentic-starter branch"
echo "3. Remove $CLEANUP_DIR after verification"