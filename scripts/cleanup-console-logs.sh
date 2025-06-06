#!/bin/bash

# Script to systematically replace console.log with proper logging
# This will help us clean up the codebase

echo "🧹 Starting console.log cleanup..."

# Count current console statements
echo "📊 Current console usage:"
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -l "console\." | wc -l

echo "Files with console statements:"
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -l "console\."

echo "✅ Manual cleanup required for context-specific replacements"
echo "📝 Key replacements to make:"
echo "  - console.log('[AUTH]' -> log.auth.debug/info"
echo "  - console.error('[AUTH]' -> log.auth.error"
echo "  - console.log('[SECURITY]' -> log.api.debug/info"
echo "  - console.error -> log.error"
echo "  - console.warn -> log.warn"