# Preview Build Guide

## 🚀 Triggering Preview Builds

I've set up everything for your preview builds. Here's how to proceed:

### Option 1: Run the Script (Recommended)
```bash
./trigger-preview-builds.sh
```

### Option 2: Manual Commands
```bash
# Android build
eas build --profile preview --platform android

# iOS build  
eas build --profile preview --platform ios
```

## 📱 Build Configuration

### Android
- **Build Type**: APK (for easy distribution)
- **Distribution**: Internal
- **Keystore**: Will be generated on first build (select "Yes" when prompted)

### iOS
- **Build Type**: Simulator build
- **Distribution**: Internal
- **Note**: Can be installed on simulators and devices registered with your Apple Developer account

## 🔧 Current Settings

### API Configuration
- **URL**: `http://localhost:8081`
- **Environment**: Preview
- **Debug Mode**: Enabled

### OAuth Configuration
- ✅ Google OAuth credentials included
- ✅ Redirect URIs configured
- ✅ Better Auth setup complete

## ⚠️ Important Notes

1. **First Android Build**: You'll be prompted to generate a keystore. Select "Yes"

2. **API Access**: The preview build uses `localhost:8081`
   - For testing on physical devices, use ngrok:
   ```bash
   ngrok http 8081
   ```
   - Update `EXPO_PUBLIC_API_URL` in `.env.preview` with ngrok URL

3. **OAuth Testing**:
   - Ensure your server is running: `bun run dev`
   - Google OAuth will redirect to your local server
   - Use ngrok URL for physical device testing

## 📊 Build Progress

Monitor your builds at:
https://expo.dev/accounts/siva9177/projects/expo-fullstack-starter/builds

## 🧪 Testing the Builds

### Android
1. Download the APK from EAS
2. Install on device/emulator
3. Test Google OAuth flow

### iOS
1. Download the simulator build
2. Drag to simulator or install via Xcode
3. Test all features

## 🐛 Troubleshooting

### OAuth Not Working
- Ensure server is running
- Check redirect URIs in Google Console
- Use ngrok for physical devices

### API Connection Issues
- Verify server is running on port 8081
- Check firewall settings
- Use ngrok URL for remote access

### Build Failures
- Check EAS build logs
- Verify all environment variables
- Ensure credentials are correct

## 📝 Next Steps

After successful builds:
1. Test OAuth flow thoroughly
2. Verify all features work
3. Check debug panel functionality
4. Test on multiple devices

Ready to build? Run: `./trigger-preview-builds.sh`