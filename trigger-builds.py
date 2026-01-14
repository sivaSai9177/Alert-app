#!/usr/bin/env python3
import subprocess
import time
import sys
import os

def run_build_command(platform):
    """Run EAS build command for specified platform"""
    cmd = ["eas", "build", "--profile", "preview", "--platform", platform]
    
    print(f"\n🚀 Starting {platform.upper()} build...")
    
    # For Android, we need to handle keystore prompt
    if platform == "android":
        print("⚠️  Note: For Android, you need to manually accept the keystore generation.")
        print("   Please run: eas build --profile preview --platform android")
        print("   And select 'Yes' when prompted to generate a keystore")
        return False
    
    # For iOS, we can run non-interactively
    try:
        subprocess.run(cmd + ["--non-interactive"], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed: {e}")
        return False

def main():
    print("🚀 EAS Preview Build Trigger")
    print("============================")
    print("")
    print("📱 Build Profile: preview")
    print("🔧 API URL: http://192.168.1.101:8081")
    print("🔐 OAuth: Google OAuth configured")
    print("")
    
    # Android build
    print("First, let's handle Android...")
    android_success = run_build_command("android")
    
    if not android_success:
        print("\n❗ Android build requires manual interaction.")
        print("After you've generated the Android keystore, you can run:")
        print("   eas build --profile preview --platform ios --non-interactive")
        print("To build for iOS.")
        sys.exit(1)
    
    # iOS build
    time.sleep(2)
    ios_success = run_build_command("ios")
    
    if ios_success:
        print("\n✅ iOS build triggered successfully!")
    
    print("\n📝 Next steps:")
    print("1. Monitor builds at: https://expo.dev/accounts/siva9177/projects/expo-fullstack-starter/builds")
    print("2. Download and install builds when ready")
    print("3. Test OAuth flow with your local server running")

if __name__ == "__main__":
    main()