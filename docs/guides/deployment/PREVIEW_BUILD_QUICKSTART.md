# 🚀 Preview Build Quick Start

## What I've Fixed
1. ✅ Fixed logout error - Avatar component now handles undefined user name
2. ✅ Settings icon already exists in the third tab (gearshape.fill icon)
3. ✅ Created preview build configuration and scripts

## Running Preview Builds on iOS

### Quick Method (Recommended)
```bash
# Build locally and run on iOS Simulator
npm run preview:quick

# Or step by step:
npm run preview:ios:local  # Build locally (requires Xcode)
npm run preview:run:ios    # Install and run latest build
```

### EAS Cloud Build Method
```bash
# Build on EAS servers (no Xcode required, but slower)
npm run preview:ios

# After build completes (~15-20 min), run:
npm run preview:run:ios
```

### Using Expo Orbit (Easiest)
1. Install Expo Orbit: https://expo.dev/orbit
2. Sign in with your Expo account
3. Your builds will appear automatically
4. Click to install on simulator

## Available Commands

```bash
# Preview builds
npm run preview              # Interactive preview build
npm run preview:quick        # Quick local iOS build
npm run preview:ios          # iOS preview (cloud)
npm run preview:android      # Android preview (cloud)
npm run preview:ios:local    # iOS preview (local, faster)
npm run preview:android:local # Android preview (local)

# Run builds
npm run preview:run:ios      # Install latest iOS build
npm run preview:run:android  # Install latest Android build

# Development builds (with dev menu)
npm run ios                  # Development mode
npm run android             # Development mode
```

## Key Differences: Preview vs Development

| Feature | Development | Preview |
|---------|------------|---------|
| Dev Menu | ✅ Yes | ❌ No |
| Performance | Slower | Fast |
| Hot Reload | ✅ Yes | ❌ No |
| Console Logs | ✅ Visible | ✅ Hidden |
| Error Screen | Developer | User-friendly |

## Build Configuration

Preview builds use the `preview` profile in `eas.json`:
- Release build configuration
- No developer tools
- Optimized performance
- Points to localhost:8081 API

## Testing Your Changes

1. Make your code changes
2. Run `npm run preview:quick` for fast local build
3. Test on simulator
4. When ready for production, use `npm run preview:ios` for cloud build

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
eas build --clear-cache --profile preview --platform ios
```

### Can't See Changes
- Preview builds don't hot reload
- You need to create a new build after changes
- Use development mode (`npm run ios`) for active development

### Simulator Issues
```bash
# List available simulators
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot "iPhone 15"
```

## Next Steps
1. Test the logout fix in preview build
2. Verify settings tab icon is showing correctly
3. Submit to TestFlight when ready: `eas submit -p ios --profile preview`