# Android Build Instructions

The iOS preview build has been triggered successfully! ✅

Build URL: https://expo.dev/accounts/siva9177/projects/expo-fullstack-starter/builds/fde5dfbd-fc2d-4af1-9fed-eb91f97d6ec7

## For Android Build

Since this is your first Android build, you need to generate a keystore. Please run this command manually:

```bash
eas build --profile preview --platform android
```

When prompted with "Generate a new Android Keystore?", type: **y**

This will:
1. Generate a new Android keystore
2. Upload it to EAS servers
3. Start the Android build

## Build Status

- ✅ **iOS Build**: In progress (simulator build)
- ⏳ **Android Build**: Waiting for manual keystore generation

## Next Steps

1. **For iOS**: 
   - Wait for build to complete
   - Download the simulator build
   - Install on iOS simulator

2. **For Android**:
   - Run the command above
   - Accept keystore generation
   - Wait for build to complete
   - Download the APK
   - Install on device/emulator

## Testing OAuth

Make sure your local server is running:
```bash
bun run dev
```

For physical device testing, use ngrok:
```bash
ngrok http 8081
```

Then update `EXPO_PUBLIC_API_URL` in `.env.preview` with the ngrok URL.