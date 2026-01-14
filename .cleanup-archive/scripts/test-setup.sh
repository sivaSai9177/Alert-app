#!/bin/bash

echo "🧪 Testing Expo Modern Starter Kit Setup"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check command
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
    else
        echo -e "${RED}✗${NC} $1 is missing"
        return 1
    fi
}

# Function to check docker container
check_container() {
    if docker ps | grep -q "$1"; then
        echo -e "${GREEN}✓${NC} Docker container $1 is running"
    else
        echo -e "${RED}✗${NC} Docker container $1 is not running"
        return 1
    fi
}

echo ""
echo "1. Checking dependencies..."
echo "------------------------"
check_command "bun"
check_command "docker"
check_command "expo"

echo ""
echo "2. Checking environment files..."
echo "-----------------------------"
check_file ".env"
check_file ".env.development"
check_file "package.json"
check_file "app.json"

echo ""
echo "3. Checking Docker containers..."
echo "------------------------------"
check_container "postgres"
check_container "redis"

echo ""
echo "4. Checking database connection..."
echo "--------------------------------"
bun run db:push:local > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Database connection successful"
else
    echo -e "${RED}✗${NC} Database connection failed"
fi

echo ""
echo "5. Checking TypeScript compilation..."
echo "-----------------------------------"
bun tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} TypeScript compilation successful"
else
    echo -e "${YELLOW}⚠${NC} TypeScript has some errors (see bun tsc --noEmit)"
fi

echo ""
echo "6. Quick start commands:"
echo "---------------------"
echo "  • Start with Expo Go:     ${GREEN}bun start${NC}"
echo "  • Start with local DB:    ${GREEN}bun local${NC}"
echo "  • Start with cloud DB:    ${GREEN}bun dev${NC}"
echo "  • Open iOS Simulator:     ${GREEN}bun ios${NC}"
echo "  • Open Android:           ${GREEN}bun android${NC}"
echo "  • Open Web:               ${GREEN}bun web${NC}"
echo ""
echo "  • Reset database:         ${GREEN}bun db:reset${NC}"
echo "  • Run tests:              ${GREEN}bun test${NC}"
echo ""

echo "========================================"
echo "Setup check complete!"