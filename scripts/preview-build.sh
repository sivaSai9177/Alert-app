#!/bin/bash

# Preview Build Script for Expo
# This script creates and runs preview builds for testing

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default platform
PLATFORM=${1:-ios}
LOCAL_BUILD=${2:-false}

echo -e "${BLUE}🚀 Starting Preview Build Process${NC}"
echo -e "${BLUE}Platform: $PLATFORM${NC}"
echo -e "${BLUE}Local Build: $LOCAL_BUILD${NC}"

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

# Function to build preview
build_preview() {
    local platform=$1
    local local_flag=""
    
    if [ "$LOCAL_BUILD" = "true" ]; then
        local_flag="--local"
        echo -e "${YELLOW}🔨 Building locally (faster but requires Xcode/Android SDK)${NC}"
    else
        echo -e "${YELLOW}☁️  Building on EAS servers${NC}"
    fi
    
    echo -e "${GREEN}📦 Creating preview build for $platform...${NC}"
    
    if [ "$platform" = "ios" ]; then
        eas build --profile preview --platform ios $local_flag
    elif [ "$platform" = "android" ]; then
        eas build --profile preview --platform android $local_flag
    else
        echo -e "${RED}❌ Invalid platform: $platform${NC}"
        exit 1
    fi
}

# Function to run preview build
run_preview() {
    local platform=$1
    
    echo -e "${GREEN}📱 Installing and running preview build on $platform...${NC}"
    
    if [ "$platform" = "ios" ]; then
        # Check if simulator is running
        if ! xcrun simctl list devices | grep -q "Booted"; then
            echo -e "${YELLOW}📱 Starting iOS Simulator...${NC}"
            open -a Simulator
            sleep 5
        fi
        
        # Run the latest build
        eas build:run -p ios --latest
        
    elif [ "$platform" = "android" ]; then
        # Check if emulator is running
        if ! adb devices | grep -q "emulator"; then
            echo -e "${YELLOW}📱 Please start an Android emulator first${NC}"
            echo "Run: emulator -avd <your-avd-name>"
            exit 1
        fi
        
        # Run the latest build
        eas build:run -p android --latest
    fi
}

# Main flow
case "$PLATFORM" in
    "ios"|"android")
        build_preview "$PLATFORM"
        
        # Wait for user confirmation
        echo -e "${YELLOW}⏳ Build submitted. Press Enter when build is complete to install...${NC}"
        read -r
        
        run_preview "$PLATFORM"
        ;;
    "both")
        # Build both platforms
        build_preview "ios"
        build_preview "android"
        
        echo -e "${GREEN}✅ Both builds submitted!${NC}"
        echo -e "${YELLOW}Run 'npm run preview:run:ios' or 'npm run preview:run:android' when builds complete${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid platform: $PLATFORM${NC}"
        echo "Usage: $0 [ios|android|both] [true|false]"
        echo "Example: $0 ios true  # Local iOS build"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Preview build process complete!${NC}"

# Show helpful commands
echo -e "\n${BLUE}📝 Helpful commands:${NC}"
echo "• Check build status: eas build:list --status=in_queue"
echo "• View build logs: eas build:view"
echo "• Download build: eas build:download --platform=$PLATFORM"
echo "• Install on device: eas build:run -p $PLATFORM --latest"

# For iOS specific
if [ "$PLATFORM" = "ios" ]; then
    echo -e "\n${BLUE}📱 iOS specific:${NC}"
    echo "• Install Expo Orbit for easier installation"
    echo "• Submit to TestFlight: eas submit -p ios --profile preview"
fi

# For Android specific
if [ "$PLATFORM" = "android" ]; then
    echo -e "\n${BLUE}🤖 Android specific:${NC}"
    echo "• Download APK: eas build:download --platform=android"
    echo "• Install manually: adb install <path-to-apk>"
fi