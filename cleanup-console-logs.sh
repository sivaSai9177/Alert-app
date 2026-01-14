#!/bin/bash

# Script to remove console.log statements from source files
# Excludes test files, scripts, and essential debugging files

echo "🧹 Starting cleanup of console.log statements..."

# Define directories to clean
DIRS=(
  "app"
  "components"
  "lib"
  "src"
)

# Define files to exclude (debugging tools, test files)
EXCLUDE_PATTERNS=(
  "*/test/*"
  "*/__tests__/*"
  "*/scripts/*"
  "*/debug.ts"
  "*/logger.ts"
  "*/logger-server.ts"
  "*/suppress-warnings.ts"
  "*/MobileDebugger.tsx"
  "*/SimpleMobileDebugger.tsx"
  "*/ErrorBoundary.tsx"
  "*/test+api.ts"
  "*/test-simple+api.ts"
)

# Create backup directory
BACKUP_DIR="./cleanup-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Created backup directory: $BACKUP_DIR"

# Function to check if file should be excluded
should_exclude() {
  local file=$1
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ $file == $pattern ]]; then
      return 0
    fi
  done
  return 1
}

# Counter for removed lines
removed_count=0
file_count=0

# Process each directory
for dir in "${DIRS[@]}"; do
  echo "🔍 Processing $dir directory..."
  
  # Find all TypeScript and JavaScript files
  find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    # Skip if file should be excluded
    if should_exclude "$file"; then
      continue
    fi
    
    # Check if file contains console.log
    if grep -q "console\.log" "$file"; then
      # Create backup
      cp "$file" "$BACKUP_DIR/$(basename $file).bak"
      
      # Count console.log occurrences
      count=$(grep -c "console\.log" "$file")
      removed_count=$((removed_count + count))
      file_count=$((file_count + 1))
      
      echo "  📝 Processing: $file (found $count console.log statements)"
      
      # Remove console.log lines
      # This removes entire lines containing console.log
      sed -i '' '/console\.log/d' "$file"
      
      # Alternative: Comment out instead of remove (uncomment if preferred)
      # sed -i '' 's/console\.log/\/\/ console.log/g' "$file"
    fi
  done
done

echo ""
echo "✅ Cleanup complete!"
echo "📊 Summary:"
echo "   - Files modified: $file_count"
echo "   - Console.log statements removed: $removed_count"
echo "   - Backup location: $BACKUP_DIR"
echo ""
echo "💡 To restore files, copy from the backup directory:"
echo "   cp $BACKUP_DIR/*.bak ."