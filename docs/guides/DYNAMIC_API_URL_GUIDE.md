# Dynamic API URL Configuration Guide

## Overview

This guide explains how the dynamic API URL resolution system works in the Expo starter kit. The system provides intelligent fallback mechanisms to ensure your app can connect to the API server in any environment: local development, EAS builds, physical devices, and production.

## How It Works

### 1. Environment Detection
The system first detects the current environment based on several factors:
- `EXPO_PUBLIC_ENVIRONMENT` variable
- Platform (iOS, Android, Web)
- Build type (EAS build, local development)
- Network connectivity

### 2. API Endpoint Priority
Based on the environment, the system builds a prioritized list of API endpoints:

1. **Custom URL** (`EXPO_PUBLIC_API_URL`) - Highest priority if set
2. **Ngrok URL** (`EXPO_PUBLIC_API_URL_NGROK`) - For stable testing
3. **Local Network IP** - Automatically detected for physical devices
4. **Localhost** - For simulators and web development
5. **Platform-specific defaults** - Android emulator special IPs

### 3. Intelligent Fallback
The API resolver tests endpoints in parallel and selects the fastest working one:
- Tests connectivity with health check endpoint
- Caches working endpoints for performance
- Falls back to next option if primary fails
- Provides manual override capability

## Configuration

### Environment Variables

```bash
# Primary API URL (overrides all detection)
EXPO_PUBLIC_API_URL=

# Environment-specific URLs
EXPO_PUBLIC_API_URL_LOCAL=http://localhost:8081
EXPO_PUBLIC_API_URL_NGROK=https://your-subdomain.ngrok.io
EXPO_PUBLIC_API_URL_PRODUCTION=https://api.myexpo.com
EXPO_PUBLIC_API_URL_STAGING=https://staging-api.myexpo.com

# Enable/disable fallback mechanism
EXPO_PUBLIC_API_FALLBACK_ENABLED=true

# Environment name
EXPO_PUBLIC_ENVIRONMENT=local # local, preview, development, staging, production
```

### EAS Build Profiles

The `eas.json` file includes predefined build profiles:

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "development",
        "EXPO_PUBLIC_API_FALLBACK_ENABLED": "true"
      }
    },
    "local-ngrok": {
      "extends": "development",
      "env": {
        "EXPO_PUBLIC_API_URL_NGROK": "https://your-ngrok.ngrok.io"
      }
    }
  }
}
```

## Usage Scenarios

### Local Development (Simulator/Emulator)

```bash
# Uses localhost automatically
bun run start
```

### Local Development (Physical Device)

```bash
# Automatically detects local IP
bun run start --host lan

# Or use ngrok for stable URL
bun run ngrok:start
bun run env:generate:ngrok
bun run start
```

### EAS Development Build

```bash
# Build with ngrok URL
eas build --profile local-ngrok --platform ios
```

### Production Build

```bash
# Uses production API URL without fallback
eas build --profile production --platform all
```

## Helper Scripts

### Generate Environment Files

```bash
# Generate .env for different scenarios
bun run env:generate:local      # Local development
bun run env:generate:ngrok      # Ngrok testing
bun run env:generate:production # Production
```

### Update Local IP Address

```bash
# Automatically detect and update local IP
bun run env:update-ip
```

### Setup Ngrok

```bash
# Install and configure ngrok
bun run ngrok:setup

# Start ngrok tunnel
bun run ngrok:start
```

### Test API Endpoints

```bash
# Test all configured endpoints
bun run api:test

# Quick health check
bun run api:health
```

## Programmatic Usage

### Get API URL in Code

```typescript
import { getApiUrl } from '@/lib/core/env';

// Async (recommended)
const apiUrl = await getApiUrl();

// Force refresh cached endpoint
const apiUrl = await getApiUrl(true);

// Synchronous (backward compatibility)
import { getApiUrlSync } from '@/lib/core/env';
const apiUrl = getApiUrlSync();
```

### Manual Override

```typescript
import { setApiUrl } from '@/lib/core/api-resolver';

// Manually set API endpoint
await setApiUrl('https://custom-api.com');
```

### Reset API Resolver

```typescript
import { resetApiResolver } from '@/lib/core/api-resolver';

// Clear cache and re-resolve
await resetApiResolver();
```

### Health Check

```typescript
import { checkApiHealth } from '@/lib/core/api-resolver';

// Check if current endpoint is healthy
const isHealthy = await checkApiHealth();
```

## Troubleshooting

### Common Issues

1. **"Cannot connect to API" on physical device**
   - Ensure device is on same network as development machine
   - Check firewall settings
   - Try using ngrok instead

2. **API URL keeps changing**
   - This is normal if network conditions change
   - Use ngrok for stable URLs
   - Disable fallback if not needed

3. **EAS build can't find API**
   - Ensure API URL is publicly accessible
   - Use ngrok or deploy API to cloud
   - Check environment variables in EAS dashboard

### Debug Mode

Enable debug logging to see API resolution process:

```bash
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
```

### View Current Configuration

```typescript
import { logEnvironment } from '@/lib/core/env-config';

// Log all environment details
await logEnvironment();
```

## Best Practices

1. **Local Development**
   - Use default settings for simulators
   - Use `--host lan` for physical devices
   - Consider ngrok for stable testing

2. **EAS Builds**
   - Always test with preview builds first
   - Use environment-specific build profiles
   - Set explicit API URLs for production

3. **Production**
   - Disable fallback mechanism
   - Use HTTPS URLs only
   - Set explicit production API URL

4. **Testing**
   - Test on real devices early
   - Verify API connectivity before deployment
   - Use health check endpoints

## Security Considerations

1. **Never commit sensitive URLs** to version control
2. **Use HTTPS** for production APIs
3. **Validate API endpoints** before storing
4. **Implement proper CORS** for web builds
5. **Use environment variables** for configuration

## Platform-Specific Notes

### iOS
- Simulator uses localhost automatically
- Physical devices need network IP or ngrok
- Ensure NSAllowsArbitraryLoads for development

### Android
- Emulator uses 10.0.2.2 for localhost
- Physical devices need network IP or ngrok
- Configure network security for development

### Web
- Uses same origin by default
- Configure CORS properly
- Consider proxy for development