# Expo Router API Routes - Working with Expo Go

## Overview

This project uses **Expo Router API Routes** which DO work with Expo Go! API Routes are server-side endpoints that run within the Expo development server, providing a unified development experience without needing a separate API server.

## How It Works

### API Route Structure
```
app/
├── api/
│   ├── auth/
│   │   └── [...auth]+api.ts    # Better Auth endpoints
│   ├── trpc/
│   │   └── [trpc]+api.ts       # tRPC endpoints
│   └── sse/
│       └── alerts+api.ts       # Server-Sent Events for real-time
```

### Key Features
1. **Server-Side Rendering (SSR)** - Full React 19 SSR support
2. **API Routes** - Backend endpoints within your Expo app
3. **Works with Expo Go** - No separate server needed
4. **Real-time Updates** - SSE support for live data

## Authentication Setup

The auth endpoints are handled by Better Auth through Expo Router API routes:

```typescript
// app/api/auth/[...auth]+api.ts
import { auth } from "@/lib/auth/auth";

async function handler(request: Request) {
  // CORS configuration for credentials
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With, x-trpc-source',
    'Access-Control-Allow-Credentials': 'true',
  };
  
  // Handle auth requests
  const response = await auth.handler(request);
  
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}
```

## tRPC Integration

tRPC procedures are exposed through API routes:

```typescript
// app/api/trpc/[trpc]+api.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/src/server/routers';

const handler = async (request: Request) => {
  // Handle tRPC requests with proper CORS
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: () => createContext(request),
  });
  
  return response;
};
```

## Real-time Updates with SSE

Server-Sent Events provide real-time updates without WebSockets:

```typescript
// app/api/sse/alerts+api.ts
export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      // Send events to client
      eventEmitter.on('alert:created', (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## Client-Side Usage

### Using tRPC
```typescript
import { api } from '@/lib/trpc';

// Queries and mutations work normally
const { data } = api.auth.getSession.useQuery();
const mutation = api.healthcare.createAlert.useMutation();
```

### Using SSE for Real-time
```typescript
import { useSSESubscription } from '@/hooks/useSSESubscription';

// Subscribe to real-time updates
const { isConnected } = useSSESubscription('/api/sse/alerts', {
  onMessage: (data) => {
    console.log('New alert:', data);
  },
});
```

## Running the App

```bash
# Development with Expo Go
bun start

# With healthcare setup
bun run local:healthcare

# Different network modes
./scripts/start-unified.sh local    # Localhost only
./scripts/start-unified.sh network  # LAN access
./scripts/start-unified.sh tunnel   # Remote access
```

## Important Notes

1. **No Separate API Server Needed** - API routes run within Expo
2. **CORS Configured** - Handles credentials and cross-origin requests
3. **SSE Fallback** - Automatic fallback to polling if SSE fails
4. **Works with Expo Go** - Full functionality without custom builds

## Troubleshooting

### CORS Errors
- Ensure origin is not wildcard when using credentials
- Add all required headers to CORS allow list

### Real-time Not Working
- Check if SSE endpoint is accessible
- Verify EventSource browser support
- Falls back to polling automatically

### OAuth Issues
- Configure redirect URLs properly
- Use tunnel mode for testing OAuth
- Ensure credentials are set in environment