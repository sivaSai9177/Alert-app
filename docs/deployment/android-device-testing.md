# Android Physical Device Testing Guide

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
./setup-ngrok-android.sh
```

### Option 2: Manual Setup

#### 1. Install ngrok
```bash
npm install -g ngrok
```

#### 2. Start Your Server
```bash
bun run dev
```

#### 3. Start ngrok Tunnel
```bash
ngrok http 8081
```

#### 4. Copy the HTTPS URL
You'll see something like:
```
Forwarding  https://abc123def456.ngrok-free.app -> http://localhost:8081
```

#### 5. Update Environment File

**For Preview Builds:**
Edit `.env.preview`:
```env
EXPO_PUBLIC_API_URL=https://abc123def456.ngrok-free.app
```

**For Expo Go Testing:**
Edit `.env`:
```env
EXPO_PUBLIC_API_URL=https://abc123def456.ngrok-free.app
```

## 📱 Testing OAuth on Android

### With Preview Build:
1. Update `.env.preview` with ngrok URL
2. Rebuild: `eas build --profile preview --platform android`
3. Download and install APK on device
4. Test Google OAuth

### With Expo Go (Development):
1. Update `.env` with ngrok URL
2. Restart server: `bun run dev`
3. Open in Expo Go app
4. Test features (Note: OAuth won't work in Expo Go)

## 🔧 Troubleshooting

### "Invalid Host Header" Error
Add to your server config:
```js
// In your API server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
```

### OAuth Redirect Issues
1. Ensure ngrok URL is HTTPS (not HTTP)
2. Check Google OAuth console has correct redirect URIs
3. Verify Better Auth base URL is updated

### Connection Refused
1. Check server is running on port 8081
2. Verify ngrok is forwarding to correct port
3. Check Android device is on internet

## 📝 Important Notes

1. **ngrok URL Changes**: Each time you restart ngrok, you get a new URL
2. **Free Tier Limits**: ngrok free has 40 requests/minute limit
3. **Keep Terminal Open**: ngrok must stay running while testing
4. **HTTPS Required**: OAuth requires HTTPS, which ngrok provides

## 🛠️ Development Tips

### Hot Reload with ngrok:
```bash
# Terminal 1: Start server
bun run dev

# Terminal 2: Start ngrok
ngrok http 8081

# Terminal 3: Watch logs
adb logcat | grep -i expo
```

### Test Different Environments:
```bash
# Development
EXPO_PUBLIC_API_URL=https://your-ngrok.ngrok-free.app bun run dev

# Preview
EXPO_PUBLIC_API_URL=https://your-ngrok.ngrok-free.app eas build --profile preview
```

### Debug Network Requests:
1. Open Chrome DevTools
2. Go to `chrome://inspect`
3. Select your device
4. Monitor network tab

## 🔐 OAuth Testing Checklist

- [ ] ngrok URL is HTTPS
- [ ] Updated correct .env file
- [ ] Server is running
- [ ] Google OAuth console has redirect URIs
- [ ] Android device has internet
- [ ] Cleared app cache if needed

## 📊 Monitor Traffic

View all requests at: http://localhost:4040

This shows:
- All API calls
- Request/response details
- Performance metrics
- Error logs