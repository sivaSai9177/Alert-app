# Environment Migration Guide

## Overview

This guide helps you apply the unified environment configuration to any Expo project, specifically designed to fix OAuth issues with private IP addresses and simplify environment management.

## What This Solves

1. **OAuth with Private IPs**: Google OAuth doesn't accept private IP addresses (192.168.x.x). Our solution automatically uses localhost for auth while allowing mobile devices to connect via network IP.
2. **Multiple Environment Files**: Consolidates multiple `.env` files into a unified system.
3. **Cross-Platform Compatibility**: Works seamlessly across iOS, Android, and Web.
4. **Profile Completion Flow**: Ensures OAuth users complete their profiles properly.

## Quick Start

### For Current Repository (my-expo)

```bash
# 1. Clean up repository (optional)
./scripts/cleanup-repository.sh

# 2. Use unified scripts
npm run start:oauth    # For OAuth testing
npm run start:local    # For local development
npm run start          # For network development (mobile)
npm run start:tunnel   # For remote access
```

### For Other Repository (expo-agentic-starter)

```bash
# 1. From my-expo directory, run:
./scripts/apply-env-changes-to-branch.sh /path/to/expo-agentic-starter

# 2. Navigate to expo-agentic-starter
cd /path/to/expo-agentic-starter

# 3. Review and test changes
npm run start:oauth
```

## Manual Migration Steps

If you prefer to apply changes manually:

### 1. Create Unified Environment Module

Create `lib/core/unified-env.ts` with the content from `ENVIRONMENT_CHANGES_FOR_BRANCH.md`.

### 2. Update Authentication Modules

#### lib/auth/auth.ts
```typescript
import { getAuthBaseUrl } from '@/lib/core/unified-env';

const getBaseURL = () => {
  return getAuthBaseUrl();
};
```

#### lib/auth/auth-client.ts
```typescript
import { getAuthUrl } from "../core/unified-env";
const BASE_URL = getAuthUrl(); // Use OAuth-safe URL
```

#### lib/trpc.tsx
```typescript
import { getApiUrl } from './core/unified-env';
const apiUrl = getApiUrl();
```

### 3. Create Unified Start Script

Copy `scripts/start-unified.sh` from the current repository.

### 4. Update package.json

```json
{
  "scripts": {
    "start": "./scripts/start-unified.sh network",
    "start:local": "./scripts/start-unified.sh local",
    "start:tunnel": "./scripts/start-unified.sh tunnel",
    "start:oauth": "./scripts/start-unified.sh oauth"
  }
}
```

## Environment Modes Explained

### Local Mode (`start:local`)
- Uses `localhost` for everything
- Requires local PostgreSQL (Docker)
- Best for: Solo development, OAuth testing

### Network Mode (`start`)
- API uses network IP (192.168.x.x)
- Auth uses localhost (OAuth compatibility)
- Best for: Testing on physical devices

### Tunnel Mode (`start:tunnel`)
- Uses Expo tunnel (public URL)
- Connects to cloud database
- Best for: Remote testing, sharing with team

### OAuth Mode (`start:oauth`)
- Optimized for OAuth testing
- Everything on localhost
- Best for: OAuth integration testing

## Profile Completion Flow

The system automatically handles profile completion for OAuth users:

1. **New OAuth User Signs In** → Marked as `needsProfileCompletion: true`
2. **Redirected to** → `/complete-profile` screen
3. **User Completes Profile** → Updates role, organization, etc.
4. **Profile Marked Complete** → `needsProfileCompletion: false`
5. **User Redirected** → Home screen

## Troubleshooting

### OAuth Not Working
```bash
# Use OAuth mode
npm run start:oauth

# Ensure Google OAuth redirect URLs include:
# - http://localhost:8081/auth-callback
# - http://localhost:8081/api/auth/callback/google
```

### Mobile Can't Connect
```bash
# Use network mode
npm start

# Check the console for:
# 📱 Mobile access: http://192.168.x.x:8081
```

### Profile Completion Not Triggering
1. Check database for user's `needsProfileCompletion` field
2. Verify `getSession` query returns this field
3. Check `ProtectedRoute` component logic

## File Structure

```
lib/
├── core/
│   ├── unified-env.ts    # ← New unified configuration
│   └── env.ts            # ← Updated with unified exports
├── auth/
│   ├── auth.ts           # ← Uses getAuthBaseUrl()
│   └── auth-client.ts    # ← Uses getAuthUrl()
└── trpc.tsx              # ← Uses getApiUrl()

scripts/
├── start-unified.sh      # ← New unified start script
├── cleanup-repository.sh # ← Repository cleanup
└── apply-env-changes-to-branch.sh # ← Migration script
```

## Best Practices

1. **Always use OAuth mode for OAuth testing**: `npm run start:oauth`
2. **Keep .env.local for local overrides**: Copy from `.env.local.template`
3. **Use network mode for mobile testing**: `npm start`
4. **Monitor logs**: Check `[UNIFIED ENV]` logs for configuration details

## Security Considerations

1. **Never commit real credentials**: Use `.env.example` for templates
2. **OAuth redirect URLs**: Only add trusted domains
3. **Database URLs**: Keep production URLs in secure environment variables

## Next Steps

After applying these changes:

1. **Test all modes**: Run through the testing checklist
2. **Update OAuth settings**: Add localhost to Google OAuth
3. **Document changes**: Update your project README
4. **Train team**: Share this guide with your team

## Support

If you encounter issues:

1. Check logs for `[UNIFIED ENV]` messages
2. Verify environment variables are loaded
3. Ensure Docker is running for local mode
4. Check network connectivity for mobile devices

---

*This unified environment system was created to solve OAuth authentication issues with private IP addresses while simplifying environment management across platforms.*