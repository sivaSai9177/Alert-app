# Apply Environment Changes to GitHub Repository

## Steps to Apply Changes to expo-agentic-starter

### 1. Clone the Repository (if not already done)

```bash
cd ~/Documents/coding-projects
git clone https://github.com/sivaSai9177/expo-agentic-starter.git
cd expo-agentic-starter
```

### 2. Create a New Branch

```bash
git checkout -b feat/unified-environment
```

### 3. Copy the Migration Files

From the `my-expo` directory, copy these files:

```bash
# From my-expo directory
cp lib/core/unified-env.ts ../expo-agentic-starter/lib/core/
cp scripts/start-unified.sh ../expo-agentic-starter/scripts/
cp .env.local ../expo-agentic-starter/.env.local.example

# Make the script executable
chmod +x ../expo-agentic-starter/scripts/start-unified.sh
```

### 4. Update the Code Files

You need to update these files in expo-agentic-starter:

#### a. lib/auth/auth.ts

Add at the top:
```typescript
import { getAuthBaseUrl } from '@/lib/core/unified-env';
```

Replace the `getBaseURL` function with:
```typescript
const getBaseURL = () => {
  return getAuthBaseUrl();
};
```

#### b. lib/auth/auth-client.ts

Replace:
```typescript
import { getApiUrlSync } from "../core/config";
const BASE_URL = getApiUrlSync();
```

With:
```typescript
import { getAuthUrl } from "../core/unified-env";
const BASE_URL = getAuthUrl(); // Use OAuth-safe URL
```

#### c. lib/trpc.tsx

Replace:
```typescript
import { getApiUrlSync } from './core/config';
const apiUrl = getApiUrlSync();
```

With:
```typescript
import { getApiUrl } from './core/unified-env';
const apiUrl = getApiUrl();
```

#### d. lib/core/env.ts (if it exists)

Add at the end:
```typescript
// Import unified functions
import { 
  getApiUrl as getUnifiedApiUrl,
  getAuthUrl as getUnifiedAuthUrl,
  getAuthBaseUrl as getUnifiedAuthBaseUrl,
  isOAuthSafe,
  getDatabaseUrl,
  logEnvironment as logUnifiedEnvironment
} from './unified-env';

export const env = {
  ...env,
  // Unified functions
  getUnifiedApiUrl,
  getUnifiedAuthUrl,
  getUnifiedAuthBaseUrl,
  isOAuthSafe,
  getDatabaseUrl,
  logUnifiedEnvironment,
};
```

### 5. Update package.json

Add these scripts to the `scripts` section:

```json
{
  "scripts": {
    "// === UNIFIED ENVIRONMENT COMMANDS ===": "",
    "start": "./scripts/start-unified.sh network",
    "start:local": "./scripts/start-unified.sh local",
    "start:tunnel": "./scripts/start-unified.sh tunnel",
    "start:oauth": "./scripts/start-unified.sh oauth",
    // ... existing scripts
  }
}
```

### 6. Create .env.local from Template

```bash
cp .env.local.example .env.local
# Edit .env.local with your actual credentials
```

### 7. Test the Changes

```bash
# Install dependencies
bun install

# Test OAuth mode
bun start:oauth

# Test network mode
bun start

# Test local mode
bun start:local
```

### 8. Commit and Push

```bash
git add .
git commit -m "feat: Add unified environment configuration for OAuth compatibility

- Add unified-env.ts for centralized URL resolution
- Update auth modules to use OAuth-safe URLs
- Create unified start script for all scenarios
- Fix OAuth issues with private IP addresses
- Add support for local, network, tunnel, and oauth modes"

git push origin feat/unified-environment
```

### 9. Create Pull Request

Go to https://github.com/sivaSai9177/expo-agentic-starter and create a pull request from `feat/unified-environment` to `main`.

## Alternative: Automated Application

You can also run this command from the my-expo directory:

```bash
./scripts/apply-env-changes-to-branch.sh ~/Documents/coding-projects/expo-agentic-starter
```

## Files Being Added/Modified

### New Files:
- `lib/core/unified-env.ts` - Unified environment configuration
- `scripts/start-unified.sh` - Unified start script
- `.env.local.example` - Local environment template

### Modified Files:
- `lib/auth/auth.ts` - Use unified auth base URL
- `lib/auth/auth-client.ts` - Use OAuth-safe URLs
- `lib/trpc.tsx` - Use unified API URL
- `lib/core/env.ts` - Export unified functions (if exists)
- `package.json` - Add unified scripts

## Verification Checklist

After applying changes, verify:

- [ ] OAuth works with `bun start:oauth`
- [ ] Mobile devices can connect with `bun start`
- [ ] Profile completion flow works after OAuth
- [ ] No TypeScript errors
- [ ] All existing functionality still works

## Troubleshooting

If you encounter issues:

1. **Module not found errors**: Make sure all imports are correct
2. **OAuth still failing**: Verify you're using `start:oauth` command
3. **Mobile can't connect**: Check the IP address shown in console
4. **TypeScript errors**: Ensure all types are properly imported

## Support

If you need help:
1. Check the console for `[UNIFIED ENV]` logs
2. Verify `.env.local` has correct values
3. Ensure Docker is running for local mode
4. Check that all files were copied correctly