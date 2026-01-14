# Expo Router API Routes with Expo Go

## UPDATE: API Routes DO Work with Expo Go!

**Important**: This document is outdated. Expo Router API Routes actually DO work with Expo Go when properly configured. The initial understanding was incorrect.

### What Actually Happens
1. **API Routes are server-side endpoints** that run in the Expo development server
2. **They work with Expo Go** because they're not client-side features requiring native code
3. **Server-Side Rendering (SSR)** is fully supported with React 19

### Current Implementation
- API routes are located in `/app/api/*`
- They handle authentication, tRPC procedures, and real-time updates
- No separate API server is needed
- See the updated guide: [Expo Router API Routes](./EXPO_ROUTER_API_ROUTES.md)

## Solution: Standalone API Proxy Server

We've implemented a standalone API proxy server that runs separately from Expo on port 3000. This allows Expo Go to work while maintaining API functionality.

### Components

1. **API Proxy Server** (`/scripts/api-proxy-server.ts`)
   - Runs on port 3000
   - Provides mock responses for API endpoints
   - Handles CORS for cross-origin requests
   - Maintains compatibility with the app's API calls

2. **Unified Environment Configuration**
   - When `EXPO_PUBLIC_USE_API_SERVER=true`, the app uses `http://localhost:3000` for API calls
   - The unified environment system automatically detects and configures the API server URL

3. **Start Scripts**
   - `start-unified.sh` - Added "api" mode that starts the proxy server
   - `start-with-healthcare.sh` - Updated to use the proxy server

### Usage

#### Method 1: Using start-unified.sh
```bash
./scripts/start-unified.sh api
```

#### Method 2: Using package.json scripts
```bash
bun run local:healthcare  # Automatically uses API proxy server
```

#### Method 3: Manual start
```bash
# Terminal 1 - Start API server
npx tsx scripts/api-proxy-server.ts

# Terminal 2 - Start Expo with API server
EXPO_PUBLIC_USE_API_SERVER=true \
EXPO_PUBLIC_API_SERVER_URL=http://localhost:3000 \
npx expo start --go
```

### How It Works

1. The proxy server provides mock endpoints that return basic responses:
   - `/api/health` - Health check endpoint
   - `/api/auth/get-session` - Returns null user/session (not logged in)
   - `/api/trpc/*` - Returns mock data for tRPC procedures

2. The app's unified environment configuration detects `EXPO_PUBLIC_USE_API_SERVER=true` and routes all API calls to `http://localhost:3000` instead of the Expo dev server.

3. CORS headers are configured to allow requests from any origin in development.

### Limitations

This is a **mock server** for Expo Go development. It provides:
- Basic API structure to prevent 404 errors
- Mock responses to allow the app to load
- CORS support for development

For full functionality (real authentication, database access, etc.), you need to:
1. Use a custom development build instead of Expo Go
2. Run the full API server with database connections

### Testing

After starting the server, you can test the endpoints:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test auth endpoint
curl http://localhost:3000/api/auth/get-session

# Test tRPC endpoint
curl http://localhost:3000/api/trpc/auth.getSession
```

### Next Steps

To enable full API functionality:

1. **Create a development build**:
   ```bash
   eas build --platform ios --profile development
   eas build --platform android --profile development
   ```

2. **Use the development build** instead of Expo Go to access real API Routes

3. **Or continue development** with the mock server, knowing that auth and data features will be limited

This solution allows you to continue using Expo Go for rapid development while understanding the limitations of API Routes in this environment.