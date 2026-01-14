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

2. **EAS Environment Variables**: 
   - Cannot have empty string values
   - Use placeholder values like "https://placeholder.ngrok.io"
   - Update with actual values when needed

3. **API Access**: The preview build uses `localhost:8081`
   - For testing on physical devices, use ngrok:
   ```bash
   bun run ngrok:start
   bun run ngrok:update-eas
   bun run ngrok:build:android
   ```

4. **OAuth Testing**:
   - Use the ngrok workflow for Android OAuth testing
   - See [OAuth Android Preview Guide](../testing/OAUTH_ANDROID_PREVIEW_GUIDE.md)
   - Keep ngrok running during entire test session

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
- Follow the [OAuth Android Preview Guide](../testing/OAUTH_ANDROID_PREVIEW_GUIDE.md)
- Ensure ngrok is running and URL is updated
- Check redirect URIs in Google Console match ngrok URL

### API Connection Issues
- Verify server is running on port 8081
- Check ngrok tunnel is active: `curl https://your-ngrok-url.ngrok-free.app/api/health`
- Ensure EAS config has been updated with `bun run ngrok:update-eas`

### Build Failures
- Check EAS build logs for specific errors
- Ensure no empty string environment variables in eas.json
- Run with `--clear-cache` flag if needed
- Verify credentials: `eas credentials`

### Environment Variable Errors
- Replace empty strings with placeholder values
- Example: `"EXPO_PUBLIC_API_URL_NGROK": "https://placeholder.ngrok.io"`
- Update with actual values before building

## 📝 Next Steps

After successful builds:
1. Test OAuth flow thoroughly
2. Verify all features work
3. Check debug panel functionality
4. Test on multiple devices

## 📦 Bundle Size Optimization

Recent optimizations:
- **Removed**: lucide-react and lucide-react-native (saved 73MB)
- **Using**: @expo/vector-icons for all icons
- **Result**: Significantly smaller bundle size

To check bundle size:
```bash
# Analyze bundle
npx expo export --platform android --output-dir dist
# Check dist folder size
```

## 🔄 Package Updates

Latest versions (as of June 2025):
- Expo SDK: 53.0.10
- React Native: 0.79.3
- React: 19.0.0
- All dependencies updated to latest compatible versions

Ready to build? Run: `./trigger-preview-builds.sh`