# 🚀 Quick Build Guide - Copy & Paste Commands

## Step 1: Login to EAS
Copy and paste this command in your terminal:

```bash
eas login
```

**When prompted, enter:**
- Email: `sirigirisiva1@gmail.com`
- Password: `Sivasai@123`

## Step 2: Start Builds
After successful login, copy and paste this command:

```bash
bash scripts/auto-build.sh
```

## Alternative: Individual Commands
If you prefer to run them separately:

```bash
# Login first
eas login

# Then configure and build
eas build:configure
eas build --profile development --platform android --non-interactive
eas build --profile development --platform ios --non-interactive
```

## What Happens Next:
1. ✅ Builds will start (10-20 minutes each)
2. ✅ You'll get email notifications when complete
3. ✅ Download links will be available at: https://expo.dev/accounts/siva9177/projects
4. ✅ Install the development builds on your devices
5. ✅ Test Google OAuth flow

## Monitor Progress:
🔗 **Dashboard**: https://expo.dev/accounts/siva9177/projects
📧 **Email**: Check sirigirisiva1@gmail.com for build notifications