# 🚀 Manual Commands to Run

## 🎯 **Current Status:**
- ✅ **Android**: Building successfully with local credentials
- 🍎 **iOS**: Needs credential setup (requires your input)

## 📋 **Commands You Need to Run:**

### **Step 1: iOS Credentials Setup**
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas credentials --platform ios
```

**When prompted:**
1. **"Which build profile?"** → Select `development`
2. **"What would you like to do?"** → Select `Set up a new iOS Distribution Certificate`
3. **Follow prompts** to generate certificate and provisioning profile

### **Step 2: Sync Android Credentials (Optional)**
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas credentials --platform android
```

**When prompted:**
1. **"Which build profile?"** → Select `development`
2. **"What would you like to do?"** → Select `Upload a keystore`
3. **Keystore path:** `./credentials/android-keystore.jks`
4. **Keystore password:** `android123`
5. **Key alias:** `upload`
6. **Key password:** `android123`

### **Step 3: Build iOS Development App**
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas build --profile development --platform ios
```

## 🛸 **Alternative: Use Expo Orbit**

Since you have Orbit installed:

1. **Open Expo Orbit** (menu bar)
2. **Find project:** `expo-fullstack-starter`
3. **Click "Build"** → **"Development Build"**
4. **Select "iOS"**
5. **Choose:** "Generate credentials automatically"
6. **Start Build**

## 📱 **Expected Results:**

After running these commands:
- ✅ **iOS Development Certificate** created
- ✅ **iOS Provisioning Profile** generated  
- ✅ **Android Keystore** uploaded to EAS
- ✅ **Both builds** available in Orbit
- ✅ **OAuth testing** ready with `expo-starter://auth-callback`

## 🎯 **Current Android Build:**

Your Android build should be completing soon! You can check status at:
- **Dashboard**: https://expo.dev/accounts/siva9177/projects/expo-fullstack-starter
- **Orbit**: Should show progress automatically

## 🚀 **Priority Actions:**

1. **Run Step 1** (iOS credentials) - **Most Important**
2. **Wait for Android** to complete
3. **Test OAuth** on both platforms

**The iOS credentials setup is the only step that requires your interactive input!**