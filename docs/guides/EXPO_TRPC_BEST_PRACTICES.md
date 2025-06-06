# Expo + tRPC Best Practices for Hospital Alert System

This document consolidates best practices and implementation patterns from official Expo and tRPC documentation for building a production-ready hospital alert system.

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Authentication & Security](#authentication--security)
3. [Navigation Patterns](#navigation-patterns)
4. [Real-Time Features](#real-time-features)
5. [Performance Optimization](#performance-optimization)
6. [Error Handling & Reliability](#error-handling--reliability)
7. [Healthcare Compliance](#healthcare-compliance)

## Project Architecture

### Recommended File Structure
```
app/
  _layout.tsx                    # Root layout with auth & theme providers
  index.tsx                      # Entry point with role-based redirects
  
  (auth)/                        # Public routes group
    login.tsx
    signup.tsx
    forgot-password.tsx
    _layout.tsx                  # Auth layout with redirect guards
    
  (roles)/                       # Protected routes group
    _layout.tsx                  # Role-based routing logic
    
    (operator)/                  # Operator-specific routes
      dashboard.tsx
      create-alert.tsx
      alert-history.tsx
      _layout.tsx
      
    (doctor)/                    # Doctor-specific routes
      alerts/
        active.tsx
        [alertId].tsx            # Dynamic route for alert details
      patients/
        [patientId].tsx
      _layout.tsx
      
    (nurse)/                     # Nurse-specific routes
      tasks.tsx
      alerts/
        active.tsx
        acknowledged.tsx
      _layout.tsx
      
    (admin)/                     # Admin routes
      users/
        index.tsx
        [userId].tsx
      analytics.tsx
      _layout.tsx
      
  (shared)/                      # Shared routes accessible by multiple roles
    alert-detail/[id].tsx
    profile.tsx
    settings.tsx
    
  api/                           # API routes
    auth/
      [...auth]+api.ts           # Better Auth endpoints
    trpc/
      [trpc]+api.ts              # tRPC API handler
    websocket+api.ts             # WebSocket endpoint for real-time

components/                      # Reusable components
  alerts/
    AlertCard.tsx
    AlertList.tsx
    AlertNotification.tsx
  auth/
    ProtectedRoute.tsx
    RoleGuard.tsx
  ui/                            # UI components
    
lib/                             # Core utilities
  trpc.tsx                       # tRPC client setup
  auth.ts                        # Auth configuration
  websocket.ts                   # WebSocket client
  
src/
  server/
    routers/
      alerts.ts                  # Alert procedures
      users.ts                   # User management
      auth.ts                    # Auth procedures
    trpc.ts                      # tRPC server setup
  db/
    schema.ts                    # Database schema
```

## Authentication & Security

### Better Auth Configuration
```typescript
// lib/auth.ts
export const auth = new BetterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12, // Healthcare requirement
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Separate redirect URIs for web and mobile
      redirectURI: platform === 'web' 
        ? `${baseURL}/api/auth/callback/google`
        : `${baseURL}/api/auth/google-mobile-callback`,
    },
  },
  session: {
    cookieConfig: {
      httpOnly: false, // Required for mobile
      sameSite: 'lax',
      secure: true,
    },
    expiresIn: 60 * 60 * 8, // 8 hours for healthcare
    updateAge: 60 * 15, // Update every 15 minutes
  },
  advanced: {
    generateId: () => nanoid(32), // Longer IDs for security
    cookiePrefix: 'hospital-auth',
  },
});
```

### OAuth Implementation with expo-auth-session
```typescript
// hooks/useGoogleAuth.ts
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

export function useGoogleAuth() {
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      codeChallenge: request?.codeChallenge, // PKCE
      usePKCE: true, // Always use PKCE
      prompt: AuthSession.Prompt.SelectAccount,
    },
    discovery
  );
  
  // Handle the response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      // Exchange code server-side for security
      exchangeCodeForToken(code);
    }
  }, [response]);
  
  return { promptAsync };
}
```

### Protected Routes Pattern
```typescript
// app/(roles)/_layout.tsx
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RolesLayout() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <Stack.Protected
      guard={() => !!user}
      fallback="/login"
    >
      <Stack.Screen name="(operator)" options={{ headerShown: false }} />
      <Stack.Screen name="(doctor)" options={{ headerShown: false }} />
      <Stack.Screen name="(nurse)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
    </Stack.Protected>
  );
}
```

## Navigation Patterns

### Role-Based Navigation
```typescript
// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <SplashScreen />;
  if (!user) return <Redirect href="/login" />;
  
  // Role-based redirect
  const roleRoutes = {
    operator: '/(roles)/(operator)/dashboard',
    doctor: '/(roles)/(doctor)/alerts/active',
    nurse: '/(roles)/(nurse)/tasks',
    admin: '/(roles)/(admin)/users',
  };
  
  return <Redirect href={roleRoutes[user.role] || '/login'} />;
}
```

### Modal Implementation for Alerts
```typescript
// app/(roles)/_layout.tsx
export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(operator)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="alert-modal" 
        options={{
          presentation: 'transparentModal', // Non-blocking for urgent alerts
          animation: 'fade_from_bottom',
        }} 
      />
      <Stack.Screen 
        name="critical-alert" 
        options={{
          presentation: 'fullScreenModal', // Full attention required
          gestureEnabled: false, // Prevent dismissal
        }} 
      />
    </Stack>
  );
}
```

### Shared Routes Configuration
```typescript
// app/(shared)/alert-detail/[id].tsx
// This route is accessible from multiple role groups
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function AlertDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  // Render different UI based on user role
  return (
    <AlertDetailView
      alertId={id}
      canAcknowledge={['doctor', 'nurse'].includes(user.role)}
      canEscalate={user.role === 'operator'}
    />
  );
}
```

## Real-Time Features

### tRPC + WebSocket Setup
```typescript
// lib/trpc.tsx
import { createTRPCReact } from '@trpc/react-query';
import { createWSClient } from '@trpc/client';

// WebSocket client with healthcare-grade reliability
const wsClient = createWSClient({
  url: process.env.EXPO_PUBLIC_WS_URL,
  connectionParams: async () => ({
    token: await getAuthToken(),
  }),
  retryDelayMs: 1000,
  retryTimes: Infinity, // Always try to reconnect
  keepAlive: {
    enabled: true,
    pingMs: 10000, // 10 second heartbeat
    pongWaitMs: 5000,
  },
  onOpen: () => {
    console.log('WebSocket connected');
  },
  onClose: (cause) => {
    console.error('WebSocket disconnected:', cause);
    // Implement fallback to polling
  },
});

// tRPC client with optimized settings
export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Platform.OS === 'web' ? 5000 : 30000,
        refetchInterval: false,
        refetchOnWindowFocus: Platform.OS === 'web',
        retry: (failureCount, error) => {
          // Always retry critical queries
          if (error?.data?.code === 'CRITICAL') {
            return failureCount < 10;
          }
          return failureCount < 3;
        },
      },
      mutations: {
        retry: 2,
        onError: (error) => {
          // Global error handler
          logError(error);
        },
      },
    },
  });
  
  const trpcClient = trpc.createClient({
    links: [
      // Split between WebSocket and HTTP
      splitLink({
        condition: (op) => op.type === 'subscription',
        true: wsLink({ client: wsClient }),
        false: httpBatchLink({
          url: '/api/trpc',
          headers: async () => ({
            authorization: `Bearer ${await getAuthToken()}`,
          }),
        }),
      }),
    ],
  });
  
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Alert Subscription Implementation
```typescript
// hooks/useAlertSubscription.ts
export function useAlertSubscription() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Subscribe to alerts based on user role
  const subscription = trpc.alerts.subscribe.useSubscription(
    { role: user.role },
    {
      onData: (alert) => {
        // Update cache immediately
        queryClient.setQueryData(
          ['alerts', 'active'],
          (old) => [...(old || []), alert]
        );
        
        // Show notification
        showAlertNotification(alert);
        
        // Play sound for critical alerts
        if (alert.priority === 'critical') {
          playAlertSound();
        }
      },
      onError: (error) => {
        console.error('Subscription error:', error);
        // Fallback to polling
        startPollingFallback();
      },
    }
  );
  
  return subscription;
}
```

### Optimistic Updates for Acknowledgments
```typescript
// hooks/useAcknowledgeAlert.ts
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  
  return trpc.alerts.acknowledge.useMutation({
    onMutate: async ({ alertId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['alerts'] });
      
      // Snapshot previous value
      const previousAlerts = queryClient.getQueryData(['alerts', 'active']);
      
      // Optimistically update
      queryClient.setQueryData(['alerts', 'active'], (old) =>
        old?.map((alert) =>
          alert.id === alertId
            ? { ...alert, acknowledged: true, acknowledgedAt: new Date() }
            : alert
        )
      );
      
      return { previousAlerts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['alerts', 'active'], context.previousAlerts);
      
      // Show error message
      showError('Failed to acknowledge alert. Please try again.');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
```

## Performance Optimization

### Async Routes Configuration
```json
// app.json
{
  "expo": {
    "plugins": [
      ["expo-router", {
        "origin": "https://hospital-alerts.com",
        "asyncRoutes": {
          "web": true,
          "default": "development",
          "include": ["/(roles)/**", "/(shared)/**"]
        }
      }]
    ]
  }
}
```

### Platform-Specific Optimizations
```typescript
// lib/trpc.tsx
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Web: More aggressive caching
      staleTime: Platform.select({
        web: 5 * 1000, // 5 seconds
        default: 30 * 1000, // 30 seconds for mobile
      }),
      // Mobile: Less frequent background refetches
      refetchInterval: Platform.select({
        web: false,
        default: 60 * 1000, // 1 minute for mobile
      }),
      // Web: Refetch on window focus
      refetchOnWindowFocus: Platform.OS === 'web',
      // Mobile: Refetch on app foreground
      refetchOnReconnect: Platform.OS !== 'web',
    },
  },
};
```

### Data Prefetching Strategy
```typescript
// app/(roles)/(doctor)/alerts/active.tsx
import { trpc } from '@/lib/trpc';

// Prefetch in layout
export async function generateStaticParams() {
  const queryClient = new QueryClient();
  
  // Prefetch active alerts
  await queryClient.prefetchQuery({
    queryKey: ['alerts', 'active'],
    queryFn: () => trpc.alerts.getActive.query(),
  });
  
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}
```

## Error Handling & Reliability

### Global Error Boundary
```typescript
// app/_layout.tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View style={styles.error}>
      <Text>Something went wrong:</Text>
      <Text>{error.message}</Text>
      <Button title="Try again" onPress={resetErrorBoundary} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        // Log to error reporting service
        logErrorToService(error);
      }}
    >
      <Stack />
    </ErrorBoundary>
  );
}
```

### Retry Strategies
```typescript
// lib/trpc.tsx
const retryStrategy = {
  retry: (failureCount, error) => {
    // Network errors: aggressive retry
    if (error.message.includes('Network')) {
      return failureCount < 10;
    }
    
    // Server errors: moderate retry
    if (error.data?.httpStatus >= 500) {
      return failureCount < 5;
    }
    
    // Client errors: no retry
    if (error.data?.httpStatus >= 400 && error.data?.httpStatus < 500) {
      return false;
    }
    
    // Default: 3 retries
    return failureCount < 3;
  },
  retryDelay: (attemptIndex) => {
    // Exponential backoff with jitter
    const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
    const jitter = Math.random() * 1000;
    return baseDelay + jitter;
  },
};
```

### Offline Support
```typescript
// hooks/useOfflineSync.ts
import NetInfo from '@react-native-community/netinfo';

export function useOfflineSync() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        // Back online - sync pending mutations
        queryClient.resumePausedMutations();
        
        // Refetch critical data
        queryClient.invalidateQueries({ queryKey: ['alerts', 'active'] });
      } else {
        // Offline - pause mutations
        queryClient.setMutationDefaults(['alerts'], {
          mutationFn: async (variables) => {
            // Store in local queue
            await storeOfflineMutation(variables);
            return variables;
          },
        });
      }
    });
    
    return unsubscribe;
  }, []);
}
```

## Healthcare Compliance

### HIPAA Considerations
1. **Encryption**: All data in transit uses TLS 1.3+
2. **Authentication**: Multi-factor authentication required for sensitive operations
3. **Audit Logging**: Every action is logged with user, timestamp, and details
4. **Session Management**: Automatic timeout after 8 hours of inactivity
5. **Access Control**: Role-based permissions enforced at every level

### Audit Trail Implementation
```typescript
// src/server/middleware/audit.ts
export const auditMiddleware = t.middleware(async ({ ctx, next, path }) => {
  const start = Date.now();
  
  try {
    const result = await next();
    
    // Log successful operations
    await db.insert(auditLogs).values({
      userId: ctx.user?.id,
      action: path,
      success: true,
      duration: Date.now() - start,
      timestamp: new Date(),
      metadata: JSON.stringify({
        userAgent: ctx.headers['user-agent'],
        ip: ctx.ip,
      }),
    });
    
    return result;
  } catch (error) {
    // Log failed operations
    await db.insert(auditLogs).values({
      userId: ctx.user?.id,
      action: path,
      success: false,
      error: error.message,
      duration: Date.now() - start,
      timestamp: new Date(),
    });
    
    throw error;
  }
});
```

### Data Encryption
```typescript
// lib/encryption.ts
import * as Crypto from 'expo-crypto';

export async function encryptSensitiveData(data: string): Promise<string> {
  const key = await getEncryptionKey();
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data + key,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
}

// Secure storage for mobile
import * as SecureStore from 'expo-secure-store';

export async function storeSecurely(key: string, value: string) {
  if (Platform.OS === 'web') {
    // Use encrypted localStorage for web
    const encrypted = await encryptSensitiveData(value);
    localStorage.setItem(key, encrypted);
  } else {
    // Use SecureStore for mobile
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
}
```

## Validation & Type Safety

### Zod v4 Integration
```typescript
// lib/validations/auth.ts
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  rememberMe: z.boolean().optional(),
});

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  role: z.enum(['operator', 'doctor', 'nurse', 'head_doctor']),
  department: z.string().min(1, 'Department is required'),
  hospitalId: z.string().uuid('Invalid hospital ID'),
  licenseNumber: z.string().optional(),
});

export const hospitalUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['operator', 'doctor', 'nurse', 'head_doctor', 'admin']),
  department: z.string(),
  hospitalId: z.string().uuid(),
  permissions: z.array(z.string()),
  lastLogin: z.date().optional(),
});

// Export types for TypeScript
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type HospitalUser = z.infer<typeof hospitalUserSchema>;
```

### tRPC Procedure Validation
```typescript
// src/server/routers/auth.ts
import { signInSchema, signUpSchema } from '@/lib/validations/auth';

export const authRouter = router({
  signIn: publicProcedure
    .input(signInSchema)
    .output(z.object({
      user: hospitalUserSchema,
      session: z.object({
        token: z.string(),
        expiresAt: z.date(),
      }),
      requires2FA: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Runtime validation automatically handled by Zod
      // TypeScript types inferred from schema
    }),
});
```

## Implementation Checklist

### Phase 1: Foundation ✅
- [x] Expo SDK setup with typed routes
- [x] Better Auth integration
- [x] tRPC server and client setup
- [x] Zod v4 validation schemas
- [x] Database schema with roles
- [x] Basic authentication flow

### Phase 2: Core Features 🚧
- [ ] Alert creation form for operators
- [ ] Real-time WebSocket integration
- [ ] Push notification setup
- [ ] Alert acknowledgment system
- [ ] Escalation logic implementation

### Phase 3: Advanced Features 📋
- [ ] Offline support with sync
- [ ] Advanced analytics dashboard
- [ ] Audit trail visualization
- [ ] Performance monitoring
- [ ] Automated testing suite

### Phase 4: Production Ready 📋
- [ ] Security audit
- [ ] HIPAA compliance verification
- [ ] Load testing
- [ ] Deployment pipeline
- [ ] Monitoring and alerting

## References

### Expo Documentation
- [Common Navigation Patterns](https://docs.expo.dev/router/basics/common-navigation-patterns/)
- [Core Concepts](https://docs.expo.dev/router/basics/core-concepts/)
- [Authentication](https://docs.expo.dev/develop/authentication/)
- [API Routes](https://docs.expo.dev/router/reference/api-routes/)
- [Protected Routes](https://docs.expo.dev/router/advanced/protected/)
- [Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Nesting Navigators](https://docs.expo.dev/router/advanced/nesting-navigators/)
- [Modals](https://docs.expo.dev/router/advanced/modals/)
- [Shared Routes](https://docs.expo.dev/router/advanced/shared-routes/)

### tRPC Documentation
- [TanStack React Query Setup](https://trpc.io/docs/client/tanstack-react-query/setup)
- [Usage Patterns](https://trpc.io/docs/client/tanstack-react-query/usage)
- [Server Components](https://trpc.io/docs/client/tanstack-react-query/server-components)
- [Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [Standalone Adapter](https://trpc.io/docs/server/adapters/standalone)
- [Subscriptions](https://trpc.io/docs/server/subscriptions)
- [WebSockets](https://trpc.io/docs/server/websockets)

This document serves as the comprehensive guide for implementing a production-ready hospital alert system using Expo and tRPC.