# Frontend Architecture & Navigation Plan

## Overview

This document outlines the comprehensive plan for implementing a modern frontend architecture using the latest Expo Router features (SDK 53+) with TanStack Query, tRPC, and Zustand for state management.

## Key Technologies Integration

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Expo Router   │────▶│  TanStack Query  │────▶│      tRPC       │
│  (Navigation)   │     │ (Server State)   │     │   (Type-safe)   │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         ▼                       ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Stack.Protected │     │     Zustand      │     │   Better Auth   │
│   (Guards)      │     │  (Client State)  │     │   (Backend)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Current Issue Resolution

### Problem
Tab navigation causes full app re-renders when switching tabs due to improper auth state evaluation.

### Solution
Use Expo Router's native `Stack.Protected` with proper guard conditions and authentication rewrites pattern.

## New Architecture Implementation

### 1. Root Layout with Authentication Rewrites

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { TRPCProvider } from '@/lib/trpc';
import { AuthSync } from '@/components/AuthSync';
import { SplashScreen } from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep splash screen visible while loading auth
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { hasHydrated, isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    if (hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [hasHydrated]);

  if (!hasHydrated) {
    return null; // Splash screen is still visible
  }

  // Dynamic initial route based on auth state
  const initialRouteName = !isAuthenticated 
    ? '(auth)/login' 
    : user?.needsProfileCompletion 
      ? '(auth)/complete-profile' 
      : '(home)';

  return (
    <TRPCProvider>
      <AuthSync /> {/* Syncs server state with client state */}
      <Stack 
        initialRouteName={initialRouteName}
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        {/* Public Routes */}
        <Stack.Screen name="(auth)" />
        
        {/* Protected Routes with Guard */}
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(home)" />
          <Stack.Screen name="(profile)" />
          
          {/* Admin-only routes */}
          <Stack.Protected guard={user?.role === 'admin'}>
            <Stack.Screen name="(admin)" />
          </Stack.Protected>
          
          {/* Manager+ routes */}
          <Stack.Protected guard={['admin', 'manager'].includes(user?.role || '')}>
            <Stack.Screen name="(manager)" />
          </Stack.Protected>
        </Stack.Protected>
        
        {/* Shared Routes */}
        <Stack.Screen name="auth-callback" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </TRPCProvider>
  );
}
```

### 2. Authentication Sync Component

```typescript
// components/AuthSync.tsx
import { useEffect } from 'react';
import { api } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

export function AuthSync() {
  const router = useRouter();
  const { updateAuth, clearAuth, user } = useAuth();
  
  // Keep auth state synchronized between server and client
  const { data: session } = api.auth.getSession.useQuery(undefined, {
    // Poll every 30 seconds
    refetchInterval: 30 * 1000,
    
    // Refetch on app focus
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    
    // Handle state updates
    onSuccess: (data) => {
      if (data) {
        updateAuth(data.user, data.session);
        
        // Handle profile completion redirect
        if (data.user.needsProfileCompletion && 
            !router.pathname.includes('complete-profile')) {
          router.replace('/(auth)/complete-profile');
        }
      } else {
        clearAuth();
      }
    },
    
    // Handle auth errors
    onError: (error) => {
      if (error.data?.httpStatus === 401) {
        clearAuth();
        router.replace('/(auth)/login');
      }
    },
  });

  // Handle deep linking with auth
  useEffect(() => {
    if (!user && router.pathname.includes('/(home)')) {
      router.replace('/(auth)/login');
    }
  }, [user, router.pathname]);

  return null;
}
```

### 3. Tab Layout with Dynamic Visibility

```typescript
// app/(home)/_layout.tsx
import { Tabs } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/theme/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  
  // Role-based tab visibility
  const isManager = ['admin', 'manager'].includes(user?.role || '');
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      
      {/* Conditional rendering based on role */}
      <Tabs.Screen
        name="manager"
        options={{
          href: isManager ? undefined : null, // Hide if not manager
          title: 'Manager',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.2.fill" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="admin"
        options={{
          href: isAdmin ? undefined : null, // Hide if not admin
          title: 'Admin',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gear" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 4. Shared Routes Implementation

```typescript
// app/(dashboard)/[role].tsx - Shared dashboard for different roles
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/trpc';

export default function RoleDashboard() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { user } = useAuth();
  
  // Validate access
  if (!user || !['admin', 'manager', 'user'].includes(role)) {
    return <NotFoundScreen />;
  }
  
  // Role-specific data fetching
  const { data: dashboardData } = api.dashboard.getByRole.useQuery(
    { role: role as any },
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000,
    }
  );
  
  // Render role-specific dashboard
  switch (role) {
    case 'admin':
      return <AdminDashboard data={dashboardData} />;
    case 'manager':
      return <ManagerDashboard data={dashboardData} />;
    default:
      return <UserDashboard data={dashboardData} />;
  }
}

// File structure for shared routes:
// app/
//   (dashboard)/
//     _layout.tsx
//     [role].tsx  // Handles /admin, /manager, /user
```

### 5. Authentication Flow with TanStack Query

```typescript
// hooks/useAuthFlow.ts
import { api } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { showErrorAlert } from '@/lib/core/alert';

export function useAuthFlow() {
  const router = useRouter();
  const { updateAuth, clearAuth, setLoading } = useAuth();
  const utils = api.useUtils();

  // Sign In Mutation
  const signIn = api.auth.signIn.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    
    onSuccess: async (data) => {
      // Update Zustand store
      updateAuth(data.user, data.session);
      
      // Invalidate all queries to fetch fresh data
      await utils.invalidate();
      
      // Navigate based on user state
      if (data.user.needsProfileCompletion) {
        router.replace('/(auth)/complete-profile');
      } else {
        router.replace('/(home)');
      }
    },
    
    onError: (error) => {
      showErrorAlert('Sign In Failed', error.message);
    },
    
    onSettled: () => {
      setLoading(false);
    },
  });

  // Sign Out Mutation
  const signOut = api.auth.signOut.useMutation({
    onMutate: async () => {
      // Optimistically clear auth
      clearAuth();
      
      // Cancel any outgoing queries
      await utils.cancelQueries();
      
      // Remove all cached data
      utils.removeQueries();
    },
    
    onSuccess: () => {
      // Navigate to login
      router.replace('/(auth)/login');
    },
    
    onError: () => {
      // Even on error, keep user signed out
      router.replace('/(auth)/login');
    },
  });

  // OAuth Sign In
  const oauthSignIn = api.auth.socialSignIn.useMutation({
    onSuccess: async (data) => {
      updateAuth(data.user, data.token ? { token: data.token } as any : null);
      
      if (data.needsProfileCompletion) {
        router.replace('/(auth)/complete-profile');
      } else {
        router.replace('/(home)');
      }
    },
  });

  return {
    signIn: signIn.mutate,
    signOut: signOut.mutate,
    oauthSignIn: oauthSignIn.mutate,
    isLoading: signIn.isLoading || signOut.isLoading || oauthSignIn.isLoading,
  };
}
```

### 6. Screen-Level Data Fetching

```typescript
// app/(home)/index.tsx
import { api } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Prefetch data for better UX
  const utils = api.useUtils();
  
  // Main dashboard query
  const { data: dashboard, isLoading } = api.dashboard.getHome.useQuery(
    { userId: user?.id! },
    {
      enabled: !!user?.id,
      staleTime: 2 * 60 * 1000, // 2 minutes
      
      // Prefetch related data
      onSuccess: () => {
        // Prefetch user profile
        utils.user.getProfile.prefetch({ userId: user?.id! });
        
        // Prefetch notifications
        utils.notifications.getUnread.prefetch({ userId: user?.id! });
      },
    }
  );

  // Real-time notifications subscription
  api.notifications.onNewNotification.useSubscription(
    { userId: user?.id! },
    {
      enabled: !!user?.id,
      onData: (notification) => {
        // Update notification count in Zustand
        useNotificationStore.getState().addNotification(notification);
      },
    }
  );

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Dashboard',
          headerRight: () => (
            <NotificationBell 
              onPress={() => router.push('/(home)/notifications')}
            />
          ),
        }}
      />
      
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <DashboardContent data={dashboard} />
      )}
    </>
  );
}
```

### 7. Form Handling with Mutations

```typescript
// app/(auth)/complete-profile.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { CompleteProfileSchema } from '@/lib/validations/auth';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const utils = api.useUtils();
  
  const form = useForm({
    resolver: zodResolver(CompleteProfileSchema),
    defaultValues: {
      name: user?.name || '',
      role: 'user',
      organizationName: '',
    },
  });

  const completeProfileMutation = api.auth.completeProfile.useMutation({
    onMutate: async (data) => {
      // Optimistic update
      updateUserData({ ...data, needsProfileCompletion: false });
    },
    
    onSuccess: async (data) => {
      // Update with server response
      updateUserData(data.user);
      
      // Invalidate session to get fresh data
      await utils.auth.getSession.invalidate();
      
      // Navigate to home
      router.replace('/(home)');
    },
    
    onError: (error, variables, context) => {
      // Revert optimistic update
      updateUserData({ needsProfileCompletion: true });
      
      showErrorAlert('Profile Update Failed', error.message);
    },
  });

  return (
    <ProfileCompletionForm
      form={form}
      onSubmit={(data) => completeProfileMutation.mutate(data)}
      isLoading={completeProfileMutation.isLoading}
    />
  );
}
```

### 8. Performance Optimizations

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Consider data fresh for 1 minute
      staleTime: 60 * 1000,
      
      // Keep data in cache for 5 minutes
      cacheTime: 5 * 60 * 1000,
      
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
          return false;
        }
        return failureCount < 3;
      },
      
      // Disable refetch on window focus for mobile
      refetchOnWindowFocus: false,
      
      // Enable offline support
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

// Persist cache for offline support
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000,
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});
```

## Migration Strategy

### Phase 1: Foundation (1-2 days)
1. Update to Expo SDK 53+ if needed
2. Remove old `Stack.Protected` implementation
3. Implement new root layout with guards
4. Add AuthSync component

### Phase 2: Navigation (2-3 days)
1. Update tab layout with dynamic visibility
2. Implement shared routes for role dashboards
3. Fix deep linking with authentication
4. Test navigation flows

### Phase 3: State Management (3-4 days)
1. Integrate TanStack Query with all API calls
2. Update mutations with optimistic updates
3. Implement proper cache management
4. Add offline support

### Phase 4: Testing & Optimization (2-3 days)
1. Test all auth flows
2. Verify tab navigation doesn't re-render
3. Implement performance monitoring
4. Add error boundaries

## Key Benefits

1. **No More Tab Re-renders**: Proper guard implementation prevents unnecessary re-renders
2. **Type Safety**: End-to-end TypeScript with tRPC
3. **Offline Support**: Built-in with TanStack Query
4. **Better UX**: Optimistic updates and prefetching
5. **Cleaner Code**: Native Expo Router features reduce boilerplate
6. **Performance**: Intelligent caching and lazy loading

## Troubleshooting Common Issues

### Issue: Guards causing re-renders
```typescript
// ❌ Bad - creates new function each render
<Stack.Protected guard={() => isAuthenticated}>

// ✅ Good - stable reference
<Stack.Protected guard={isAuthenticated}>
```

### Issue: Stale auth state
```typescript
// Always get fresh state in callbacks
const freshUser = useAuth.getState().user;
```

### Issue: Deep linking not working
```typescript
// Handle in AuthSync component
useEffect(() => {
  if (!user && protectedRoute) {
    // Store intended route
    router.replace(`/(auth)/login?redirect=${protectedRoute}`);
  }
}, [user, protectedRoute]);
```

## Summary

This architecture leverages the latest Expo Router features with a modern state management approach:
- Native protection with `Stack.Protected`
- Server state with TanStack Query
- Client state with Zustand
- Type safety with tRPC
- Optimistic updates for better UX
- Offline support built-in

The result is a performant, type-safe, and maintainable frontend architecture that scales well.