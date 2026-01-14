# Environment & OAuth Configuration Summary

## ✅ What Was Fixed

### 1. **Unified Environment System**
Created `lib/core/unified-env.ts` that handles all scenarios:
- **Local Mode**: Everything on localhost (OAuth-safe)
- **Network Mode**: Uses local IP for mobile, localhost for OAuth
- **Tunnel Mode**: Uses Expo tunnel URLs (OAuth-safe)
- **Production Mode**: Uses production URLs

### 2. **OAuth Compatibility**
- Google OAuth doesn't work with private IPs (192.168.x.x)
- System now automatically uses localhost for auth when needed
- OAuth works in: Local mode, Tunnel mode, Production
- OAuth requires workaround in: Network mode (uses localhost for auth)

### 3. **Unified Start Scripts**
Single script handles all scenarios: `scripts/start-unified.sh`
```bash
bun start          # Network mode (auto-detect IP)
bun start:local    # Local mode (localhost only)
bun start:tunnel   # Tunnel mode (public URL)
bun start:oauth    # OAuth mode (forced localhost)
```

### 4. **Updated Modules**
- `lib/auth/auth.ts` - Uses unified auth URL
- `lib/auth/auth-client.ts` - Uses OAuth-safe URLs
- `lib/trpc.tsx` - Uses appropriate API URLs
- `package.json` - Simplified script structure

## 📋 Quick Reference

### For OAuth Testing
```bash
bun start:oauth
# or
bun healthcare:oauth
```
- Forces localhost URLs
- Sets up local database
- Configures for Google Sign-In

### For Mobile Testing (Same WiFi)
```bash
bun start
# or
bun healthcare:network
```
- Auto-detects your local IP
- Mobile devices can connect
- OAuth still works (uses localhost)

### For Remote Testing
```bash
bun start:tunnel
```
- Creates public URL
- Uses cloud database
- OAuth works with tunnel URL

## 🔧 How It Works

### URL Resolution
```typescript
// Network mode with private IP
API URL: http://192.168.1.101:8081  // For general API calls
Auth URL: http://localhost:8081      // For OAuth (Google-safe)

// Local mode
API URL: http://localhost:8081       // Everything local
Auth URL: http://localhost:8081      // Same, OAuth-safe

// Tunnel mode
API URL: https://abc.exp.direct      // Public URL
Auth URL: https://abc.exp.direct     // Same, OAuth-safe
```

### Environment Detection
1. Checks for tunnel domains (.exp.direct, .exp.host)
2. Checks APP_ENV variable
3. Checks EXPO_PUBLIC_API_URL content
4. Defaults to network mode

### OAuth Safety Check
- ✅ localhost, 127.0.0.1
- ✅ Public domains (.exp.direct, .com, etc.)
- ❌ Private IPs (192.168.x.x, 10.0.x.x)

## 🚀 Recommended Workflows

### Development with OAuth
```bash
# Start with OAuth support
bun start:oauth

# Open browser
http://localhost:8081

# Test Google Sign-In
```

### Mobile Development
```bash
# Start in network mode
bun start

# Console shows:
# 🌐 Local IP: 192.168.1.101
# 📱 Mobile access: http://192.168.1.101:8081

# Scan QR with Expo Go
```

### Healthcare Demo
```bash
# Full setup with healthcare
bun healthcare

# With OAuth support
bun healthcare:oauth

# Demo accounts (any password):
# - johncena@gmail.com
# - doremon@gmail.com
# - johndoe@gmail.com
# - saipramod273@gmail.com
```

## 📝 Environment Files

### .env (Main configuration)
- Contains OAuth credentials
- Has IP addresses (works for everything except OAuth)

### .env.local (Local overrides)
- Forces localhost URLs
- Created for OAuth compatibility
- Loaded by local scripts

### .env.development
- Additional dev settings
- CSRF disabled for development

## 🎯 Key Takeaways

1. **Always use localhost for OAuth development**
2. **Network mode auto-handles the OAuth/IP conflict**
3. **One unified script for all scenarios**
4. **Healthcare setup integrated into all modes**
5. **All three devices (iOS, Android, Web) work with proper mode**

## 🐛 If OAuth Still Fails

1. Check credentials are loaded:
   ```bash
   echo $GOOGLE_CLIENT_ID
   ```

2. Use OAuth mode:
   ```bash
   bun start:oauth
   ```

3. Verify redirect URIs in Google Console include:
   - http://localhost:8081/api/auth/callback/google
   - http://localhost:8081/auth-callback

4. Check server logs for specific errors

The system is now configured to handle all scenarios automatically!