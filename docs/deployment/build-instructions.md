# 🚀 Manual Build Instructions

I've prepared everything for the EAS builds, but we need to run a few interactive commands that require your input.

## ✅ **What I've Already Done:**

1. ✅ Installed `expo-dev-client`
2. ✅ Created EAS project: `@siva9177/expo-fullstack-starter`
3. ✅ Updated app.json with proper bundle IDs
4. ✅ Fixed iOS encryption setting
5. ✅ Added dev-client plugin
6. ✅ Set your authentication token

## 🎯 **Commands for You to Run:**

### Step 1: Build Android Development App
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas build --profile development --platform android
```

**When prompted:**
- "Generate a new Android Keystore?" → **Yes**
- Follow any additional prompts

### Step 2: Build iOS Development App
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas build --profile development --platform ios
```

**When prompted:**
- Choose credential options (typically auto-generate)
- Follow any additional prompts

## 📊 **Monitor Progress:**
- **Dashboard**: https://expo.dev/accounts/siva9177/projects/expo-fullstack-starter
- **Email**: Check sirigirisiva1@gmail.com for build notifications

## 🎯 **Expected Results:**
- Build time: 10-20 minutes each
- Download links will be available in Expo dashboard
- You'll receive email notifications when complete

## 📱 **After Builds Complete:**
1. Download and install development builds on your devices
2. Start Metro server: `bun start`
3. Test Google OAuth flow with the new redirect URI scheme

## 🔧 **Project Configuration:**
- **Bundle ID**: `com.siva9177.expofullstackstarter`
- **Scheme**: `expo-starter`
- **OAuth Redirect**: `expo-starter://auth-callback`

Copy and paste the commands above - they have your token pre-configured!