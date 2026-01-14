#!/bin/bash

# Setup standard development dependencies for industry-standard scripts

echo "📦 Setting up standard development dependencies..."
echo "=============================================="
echo ""

# Check if bun is available
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
    ADD_CMD="add"
else
    PACKAGE_MANAGER="npm"
    ADD_CMD="install"
fi

echo "Using package manager: $PACKAGE_MANAGER"
echo ""

# Install dev dependencies for standard scripts
echo "📥 Installing development dependencies..."

# Core development tools
$PACKAGE_MANAGER $ADD_CMD -D \
    concurrently \
    cross-env \
    prettier \
    @types/node

# Git hooks and automation
$PACKAGE_MANAGER $ADD_CMD -D \
    husky \
    lint-staged

# Additional helpful tools
$PACKAGE_MANAGER $ADD_CMD -D \
    dotenv-cli \
    rimraf

echo ""
echo "🔧 Setting up configurations..."

# Create prettier config if it doesn't exist
if [ ! -f ".prettierrc" ]; then
    echo '{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}' > .prettierrc
    echo "✅ Created .prettierrc"
fi

# Create prettier ignore file
if [ ! -f ".prettierignore" ]; then
    echo 'node_modules
.expo
dist
build
coverage
*.log
.DS_Store
.env*
android
ios' > .prettierignore
    echo "✅ Created .prettierignore"
fi

# Setup husky and lint-staged
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bunx husky install
else
    npx husky install
fi

# Create pre-commit hook
mkdir -p .husky
echo '#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged' > .husky/pre-commit
chmod +x .husky/pre-commit

# Add lint-staged config to package.json
echo ""
echo "📝 Add this to your package.json:"
echo ""
echo '  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }'

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now use:"
echo "  - bun format         # Format all files"
echo "  - bun lint:fix       # Fix linting issues"
echo "  - Git hooks will automatically format staged files"
echo ""
echo "📚 See SCRIPTS_GUIDE_V2.md for more information"