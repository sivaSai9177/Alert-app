# 🛸 Expo Orbit Build Guide

Perfect! Since you have Expo Orbit installed and logged in, here's how to use it for our development builds:

## 🚀 **Using Expo Orbit for Builds**

### **Method 1: Start Builds from Orbit**

1. **Open Expo Orbit** (should be in your menu bar)
2. **Click your project**: `expo-fullstack-starter` 
3. **Click "Build"** → **"Development Build"**
4. **Select Platform**: Android or iOS (or both)
5. **Choose**: "Generate credentials automatically"
6. **Start Build**

### **Method 2: Terminal + Orbit**

**Start builds from terminal:**
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas build --profile development --platform android
eas build --profile development --platform ios
```

**Monitor in Orbit:**
- Builds will appear in Orbit automatically
- You'll see progress updates
- Download and install directly from Orbit

## 📱 **Orbit Advantages:**

✅ **Automatic Discovery**: Finds your builds automatically  
✅ **One-Click Install**: Install builds directly to connected devices  
✅ **Simulator Support**: Install to iOS Simulator  
✅ **Build Monitoring**: Real-time progress updates  
✅ **Device Management**: See all connected devices  

## 🎯 **Current Project Setup:**

- **Project**: `@siva9177/expo-fullstack-starter`
- **Bundle ID**: `com.siva9177.expofullstackstarter`
- **Scheme**: `expo-starter` 
- **OAuth Redirect**: `expo-starter://auth-callback`

## 📊 **Build Configuration:**

```json
{
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "android": {
      "buildType": "apk"
    },
    "ios": {
      "simulator": false
    }
  }
}
```

## 🔄 **Complete Workflow:**

1. **Start Builds** (Orbit or Terminal)
2. **Wait 10-20 minutes** for builds to complete
3. **Orbit notification** when builds are ready
4. **Connect device** to your Mac
5. **Install from Orbit** with one click
6. **Test OAuth flow** with `expo-starter://auth-callback`

## 🎯 **Testing OAuth After Install:**

1. **Start Metro**: `bun start`
2. **Open development build** on device
3. **Navigate to login**
4. **Tap "Continue with Google"**
5. **Verify redirect**: `expo-starter://auth-callback`

**Orbit makes everything easier!** Which method do you prefer - starting builds from Orbit or terminal?