# 🔐 Local Credentials Setup

Following the Expo documentation for local credentials: https://docs.expo.dev/app-signing/local-credentials/

## ✅ **What I've Updated:**

1. ✅ **EAS Configuration**: Added `"credentialsSource": "local"` for both platforms
2. ✅ **Build Configuration**: Ready for local credential generation

## 🚀 **Step-by-Step Local Credentials Setup:**

### **Step 1: Generate Android Keystore**

```bash
# Generate Android keystore locally
keytool -genkey -v -keystore ./android-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

**When prompted:**
- **Keystore password**: Choose a secure password (remember it!)
- **Key password**: Same as keystore password 
- **Name**: Your name
- **Organization**: Your company/personal
- **City, State, Country**: Your location info

### **Step 2: Configure Credentials**

Create `credentials.json`:
```json
{
  "android": {
    "keystore": {
      "keystorePath": "./android-keystore.jks",
      "keystorePassword": "your-keystore-password",
      "keyAlias": "upload",
      "keyPassword": "your-key-password"
    }
  },
  "ios": {
    "provisioningProfilePath": "./ios-profile.mobileprovision",
    "distributionCertificate": {
      "path": "./ios-dist-cert.p12",
      "password": "cert-password"
    }
  }
}
```

### **Step 3: iOS Credentials (Mac Only)**

For iOS development builds, you need:

1. **Apple Developer Account** (free or paid)
2. **Development Certificate**
3. **Development Provisioning Profile**

**Generate via Xcode:**
```bash
# Open Xcode and create a new project with your bundle ID
# Xcode will generate certificates automatically
# Export certificates from Keychain Access
```

## 🎯 **Automated Local Setup Script:**

I'll create a script to generate Android credentials automatically:

```bash
# Run this to generate Android keystore
bash scripts/generate-local-credentials.sh
```

## 📱 **Build with Local Credentials:**

After setup:
```bash
export EXPO_TOKEN='O44NcDtr0qPODrs9b7wkWfH-n073P_bqsnVDDD9o'
eas build --profile development --platform android --local
```

## 🔒 **Security Best Practices:**

1. **Never commit credentials** to git
2. **Add to .gitignore**: `*.jks`, `*.p12`, `*.mobileprovision`
3. **Backup credentials** securely
4. **Use strong passwords**

## 🎯 **Advantages of Local Credentials:**

✅ **No Interactive Prompts**: Build without user input  
✅ **Full Control**: Manage your own certificates  
✅ **Consistent Builds**: Same credentials every time  
✅ **Faster Setup**: No EAS credential management  

**Ready to generate local credentials?**