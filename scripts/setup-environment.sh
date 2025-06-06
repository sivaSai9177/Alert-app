#!/bin/bash

# Environment Setup Script
# This script helps set up the correct environment for different build types

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get local IP address
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost")
    else
        # Linux
        LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
    fi
    echo $LOCAL_IP
}

# Function to update API URL with local IP
update_api_url() {
    local env_file=$1
    local ip=$2
    
    if [ -f "$env_file" ]; then
        # Update EXPO_PUBLIC_API_URL with the local IP
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=http://$ip:8081|g" "$env_file"
        else
            sed -i "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=http://$ip:8081|g" "$env_file"
        fi
        echo -e "${GREEN}✅ Updated $env_file with IP: $ip${NC}"
    fi
}

# Main script
echo -e "${BLUE}🔧 Setting up environment configuration${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    if [ -f ".env.local.template" ]; then
        cp .env.local.template .env.local
        echo -e "${GREEN}✅ Created .env.local from template${NC}"
    else
        echo -e "${RED}❌ .env.local.template not found${NC}"
        exit 1
    fi
fi

# Get the current environment
ENV_TYPE=${1:-development}
LOCAL_IP=$(get_local_ip)

echo -e "${BLUE}📱 Local IP Address: $LOCAL_IP${NC}"
echo -e "${BLUE}🌍 Environment: $ENV_TYPE${NC}"

case "$ENV_TYPE" in
    "development"|"dev")
        echo -e "${GREEN}Setting up development environment${NC}"
        update_api_url ".env.development" "$LOCAL_IP"
        ;;
    "preview")
        echo -e "${GREEN}Setting up preview environment${NC}"
        update_api_url ".env.preview" "$LOCAL_IP"
        ;;
    "production"|"prod")
        echo -e "${GREEN}Setting up production environment${NC}"
        echo -e "${YELLOW}⚠️  Remember to update EXPO_PUBLIC_API_URL in .env.production${NC}"
        ;;
    "expo-go")
        echo -e "${GREEN}Setting up for Expo Go${NC}"
        # For Expo Go, we need to use the local IP
        update_api_url ".env.development" "$LOCAL_IP"
        echo -e "${YELLOW}📱 Use this URL in Expo Go: exp://$LOCAL_IP:8081${NC}"
        ;;
    *)
        echo -e "${RED}❌ Unknown environment: $ENV_TYPE${NC}"
        echo "Usage: $0 [development|preview|production|expo-go]"
        exit 1
        ;;
esac

# Show current configuration
echo -e "\n${BLUE}📋 Current Configuration:${NC}"
echo -e "Local IP: $LOCAL_IP"
echo -e "API URL: http://$LOCAL_IP:8081"
echo -e "Environment: $ENV_TYPE"

# Platform-specific instructions
echo -e "\n${BLUE}📱 Platform-Specific Instructions:${NC}"
echo -e "${YELLOW}For iOS Simulator:${NC}"
echo "  • Localhost works fine: http://localhost:8081"
echo -e "${YELLOW}For Android Emulator:${NC}"
echo "  • Use special IP: http://10.0.2.2:8081"
echo -e "${YELLOW}For Physical Device:${NC}"
echo "  • Use your computer's IP: http://$LOCAL_IP:8081"
echo "  • Make sure your device is on the same network"

echo -e "\n${GREEN}✅ Environment setup complete!${NC}"