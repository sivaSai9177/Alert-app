# 🍎 iOS Credentials Setup Commands

## 🎯 **Current Status:**
- ✅ **Android**: Building with local credentials (in progress)
- 🍎 **iOS**: Ready to configure credentials
- 🔄 **Sync**: Ready to upload to EAS for team sharing

## 🚀 **Step 1: Configure iOS Credentials**

**Option A: Automatic EAS Generation (Recommended)**
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas credentials --platform ios
```
*Select "development" profile when prompted*

**Option B: Use Xcode (Alternative)**
1. Open Xcode
2. Create new project with bundle ID: `com.siva9177.expofullstackstarter`
3. Sign in with your Apple ID
4. Xcode generates certificates automatically

## 🔄 **Step 2: Sync Android Credentials to EAS**

Upload your local Android keystore to EAS:
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas credentials --platform android
```

**When prompted:**
- Select: "Upload a keystore"
- Path: `./credentials/android-keystore.jks`
- Keystore password: `android123`
- Key alias: `upload`
- Key password: `android123`

## 🏗️ **Step 3: Build iOS Development App**

After iOS credentials are configured:
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas build --profile development --platform ios
```

## 📊 **Verify Everything**

Check both platforms have credentials:
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas credentials --platform android
eas credentials --platform ios
```

## 🎯 **Complete Build Commands**

**Build both platforms:**
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas build --profile development --platform all
```

**Or individually:**
```bash
# Android (can use local or EAS credentials)
eas build --profile development --platform android

# iOS (uses EAS credentials after setup)
eas build --profile development --platform ios
```

## 📱 **Expected Results:**

1. **iOS Development Certificate**: Generated for your Apple ID
2. **iOS Provisioning Profile**: Created for bundle ID `com.siva9177.expofullstackstarter`
3. **Android Keystore**: Uploaded to EAS for team sharing
4. **Build Capabilities**: Can build on any machine with EAS access

## 🛸 **Monitor in Expo Orbit:**

After credentials are set up:
- Builds appear automatically in Orbit
- One-click install to connected devices
- Real-time progress monitoring

## 🎯 **Next Commands to Run:**

Copy and paste these in order:

1. **iOS Credentials:**
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o' && eas credentials --platform ios
```

2. **Android Sync:**
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o' && eas credentials --platform android
```

3. **iOS Build:**
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o' && eas build --profile development --platform ios
```

**Run these commands and you'll have both Android and iOS development builds ready for OAuth testing!**