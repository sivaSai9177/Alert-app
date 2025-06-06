#!/bin/bash

# EAS Initialization Script
# This script initializes EAS for the project

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Initializing EAS for your project${NC}"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli
fi

# Check if logged in to EAS
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}📱 Please login to Expo${NC}"
    eas login
fi

# Initialize EAS with automatic yes
echo -e "${GREEN}✅ Creating EAS project...${NC}"
yes | eas init || true

# Show the project ID
if grep -q "projectId" app.json; then
    echo -e "${GREEN}✅ EAS initialized successfully!${NC}"
    PROJECT_ID=$(grep -o '"projectId": "[^"]*"' app.json | cut -d'"' -f4)
    echo -e "${BLUE}Project ID: $PROJECT_ID${NC}"
else
    echo -e "${YELLOW}⚠️  Project ID not found. You may need to run 'eas init' manually${NC}"
fi

echo -e "${GREEN}✅ EAS initialization complete!${NC}"
echo -e "${BLUE}You can now run:${NC}"
echo "  • bun run preview:ios:local    # Local iOS build"
echo "  • bun run preview:android:local # Local Android build"
echo "  • bun run preview:ios          # Cloud iOS build"
echo "  • bun run preview:android      # Cloud Android build"