# TanStack Query + tRPC + Zustand Integration Guide

## Overview

This guide explains the advanced integration patterns for using TanStack Query with tRPC and Zustand in the Expo starter kit. This combination provides type-safe API calls, intelligent caching, and efficient state management.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  React Native   │────▶│  TanStack Query  │────▶│      tRPC       │
│   Components    │     │    (Caching)     │     │  (Type-safe)   │
│                 │     │                  │     │                 │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         │                       │                         │
         ▼                       ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│     Zustand     │     │   Query Keys     │     │   Better Auth   │
│  (Local State)  │     │   Management     │     │    (Backend)    │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Core Principles

### 1. **Separation of Concerns**
- **TanStack Query**: Server state (API data, caching, synchronization)
- **Zustand**: Client state (UI state, user preferences, auth tokens)
- **tRPC**: Type-safe API layer with automatic TypeScript inference

### 2. **Data Flow**
```typescript
API Response → TanStack Query → Zustand Store → React Components
```

### 3. **No Direct API Calls**
All API operations go through tRPC with TanStack Query managing the caching and state.

## Implementation Patterns

### 1. Basic Query Pattern

```typescript
// components/UserProfile.tsx
import { api } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';

export function UserProfile() {
  const { user } = useAuth(); // From Zustand
  
  // TanStack Query via tRPC
  const { data, isLoading, error } = api.user.getProfile.useQuery(
    { userId: user?.id },
    {
      enabled: !!user?.id, // Only run if user exists
      staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
      cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    }
  );

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView error={error} />;
  
  return <ProfileView profile={data} />;
}
```

### 2. Mutation with Optimistic Updates

```typescript
// components/UpdateProfile.tsx
import { api } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';

export function UpdateProfile() {
  const { user, updateUserData } = useAuth(); // Zustand
  const utils = api.useUtils();
  
  const updateProfileMutation = api.user.updateProfile.useMutation({
    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await utils.user.getProfile.cancel();
      
      // Snapshot previous value
      const previousProfile = utils.user.getProfile.getData({ userId: user?.id });
      
      // Optimistically update cache
      utils.user.getProfile.setData({ userId: user?.id }, (old) => ({
        ...old,
        ...newData,
      }));
      
      // Update Zustand store optimistically
      updateUserData(newData);
      
      return { previousProfile };
    },
    
    // Rollback on error
    onError: (err, newData, context) => {
      utils.user.getProfile.setData(
        { userId: user?.id },
        context?.previousProfile
      );
      showErrorAlert('Update Failed', err.message);
    },
    
    // Sync on success
    onSuccess: (data) => {
      // Update Zustand with server response
      updateUserData(data.user);
      
      // Invalidate related queries
      utils.user.getProfile.invalidate();
      utils.user.getSettings.invalidate();
    },
  });

  return (
    <Button 
      onPress={() => updateProfileMutation.mutate({ name: 'New Name' })}
      loading={updateProfileMutation.isLoading}
    />
  );
}
```

### 3. Authentication Flow Integration

```typescript
// hooks/useAuthFlow.ts
import { api } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

export function useAuthFlow() {
  const router = useRouter();
  const { updateAuth, clearAuth, setLoading } = useAuth();
  
  // Sign In
  const signInMutation = api.auth.signIn.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      // Update Zustand store
      updateAuth(data.user, data.session);
      
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

  // Session Check with Auto-Refresh
  const { data: session } = api.auth.getSession.useQuery(undefined, {
    // Check session every 30 seconds
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: true,
    
    // Update Zustand on data change
    onSuccess: (data) => {
      if (data) {
        updateAuth(data.user, data.session);
      } else {
        clearAuth();
      }
    },
    
    // Handle errors gracefully
    onError: () => {
      clearAuth();
    },
  });

  return {
    signIn: signInMutation.mutate,
    isSigningIn: signInMutation.isLoading,
    session,
  };
}
```

### 4. Infinite Query Pattern

```typescript
// components/UserList.tsx
import { api } from '@/lib/trpc';

export function UserList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = api.user.list.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const users = data?.pages.flatMap((page) => page.users) ?? [];

  return (
    <FlatList
      data={users}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator /> : null
      }
    />
  );
}
```

### 5. Dependent Queries

```typescript
// components/OrganizationDashboard.tsx
export function OrganizationDashboard() {
  const { user } = useAuth();
  
  // First query: Get organization
  const { data: organization } = api.organization.get.useQuery(
    { id: user?.organizationId },
    { 
      enabled: !!user?.organizationId,
    }
  );
  
  // Dependent query: Get organization members
  const { data: members } = api.organization.getMembers.useQuery(
    { organizationId: organization?.id },
    {
      enabled: !!organization?.id, // Only run if organization exists
    }
  );
  
  // Dependent query: Get organization analytics
  const { data: analytics } = api.analytics.getOrganization.useQuery(
    { organizationId: organization?.id, metric: 'users' },
    {
      enabled: !!organization?.id && user?.role === 'admin',
    }
  );
  
  return (
    <DashboardView 
      organization={organization}
      members={members}
      analytics={analytics}
    />
  );
}
```

### 6. Global Query Configuration

```typescript
// lib/trpc.tsx
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: How long until a query is considered stale
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Cache time: How long to keep unused data in cache
      cacheTime: 1000 * 60 * 10, // 10 minutes
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof TRPCError) {
          const status = error.data?.httpStatus;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      
      // Refetch on window focus
      refetchOnWindowFocus: false, // Disable for mobile
      
      // Network mode
      networkMode: 'online', // or 'always' for offline support
    },
    mutations: {
      // Retry configuration for mutations
      retry: 1,
      
      // Network mode
      networkMode: 'online',
    },
  },
});
```

### 7. Cache Management

```typescript
// utils/queryCache.ts
import { api } from '@/lib/trpc';

export const cacheUtils = {
  // Invalidate all user-related queries
  invalidateUserData: async () => {
    const utils = api.useUtils();
    await Promise.all([
      utils.user.invalidate(),
      utils.auth.getSession.invalidate(),
      utils.organization.invalidate(),
    ]);
  },
  
  // Prefetch data for navigation
  prefetchUserProfile: async (userId: string) => {
    const utils = api.useUtils();
    await utils.user.getProfile.prefetch({ userId });
  },
  
  // Clear all cache (useful for logout)
  clearAllCache: () => {
    queryClient.clear();
  },
  
  // Remove specific queries from cache
  removeUserQueries: () => {
    queryClient.removeQueries({ queryKey: ['user'] });
  },
};
```

### 8. Error Handling

```typescript
// components/ErrorBoundary.tsx
import { api } from '@/lib/trpc';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  const { reset } = useQueryErrorResetBoundary();
  
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <ErrorView
          error={error}
          onReset={() => {
            // Reset React Query error boundary
            reset();
            // Reset component error boundary
            resetError();
          }}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Best Practices

### 1. Query Key Management

```typescript
// lib/queryKeys.ts
export const queryKeys = {
  all: ['trpc'] as const,
  auth: () => [...queryKeys.all, 'auth'] as const,
  user: (userId?: string) => [...queryKeys.all, 'user', userId] as const,
  organization: (orgId?: string) => [...queryKeys.all, 'org', orgId] as const,
} as const;

// Usage with tRPC is automatic, but useful for manual cache operations
```

### 2. Optimistic Updates

Always implement optimistic updates for better UX:

```typescript
const mutation = api.todo.update.useMutation({
  onMutate: async (newTodo) => {
    // 1. Cancel queries
    await utils.todo.list.cancel();
    
    // 2. Snapshot previous value
    const previous = utils.todo.list.getData();
    
    // 3. Optimistically update
    utils.todo.list.setData(undefined, (old) => 
      old?.map(todo => todo.id === newTodo.id ? newTodo : todo)
    );
    
    // 4. Return context for rollback
    return { previous };
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    utils.todo.list.setData(undefined, context?.previous);
  },
  onSettled: () => {
    // Always refetch after error or success
    utils.todo.list.invalidate();
  },
});
```

### 3. Zustand Integration

Keep Zustand for client-only state:

```typescript
// lib/stores/ui-store.ts
export const useUIStore = create<UIState>((set) => ({
  // UI-only state
  sidebarOpen: false,
  activeTab: 'home',
  theme: 'light',
  
  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTheme: (theme) => set({ theme }),
}));
```

### 4. Performance Optimization

```typescript
// Suspense boundaries for better loading states
export function UserListWithSuspense() {
  return (
    <Suspense fallback={<LoadingView />}>
      <UserList />
    </Suspense>
  );
}

// Use select to minimize re-renders
const { data: userName } = api.user.getProfile.useQuery(
  { userId },
  {
    select: (data) => data.name, // Only re-render when name changes
  }
);
```

### 5. Offline Support

```typescript
// Configure for offline-first
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Persist cache to AsyncStorage
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

persistQueryClient({
  queryClient,
  persister: createAsyncStoragePersister({
    storage: AsyncStorage,
  }),
});
```

## Common Patterns

### Authentication State Sync

```typescript
// Sync auth state between TanStack Query and Zustand
export function AuthSync() {
  const { updateAuth, clearAuth } = useAuth();
  
  // Watch session changes
  api.auth.getSession.useQuery(undefined, {
    refetchInterval: 30000, // 30 seconds
    onSuccess: (data) => {
      if (data) {
        updateAuth(data.user, data.session);
      } else {
        clearAuth();
      }
    },
  });
  
  return null; // This is a sync component, no UI
}
```

### Form Handling

```typescript
export function ProfileForm() {
  const utils = api.useUtils();
  const { user } = useAuth();
  
  const form = useForm({
    defaultValues: async () => {
      // Load initial data from cache or fetch
      const cached = utils.user.getProfile.getData({ userId: user?.id });
      if (cached) return cached;
      
      return utils.user.getProfile.fetch({ userId: user?.id });
    },
  });
  
  const updateMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      utils.user.getProfile.invalidate();
    },
  });
  
  return (
    <Form
      form={form}
      onSubmit={(data) => updateMutation.mutate(data)}
    />
  );
}
```

## Troubleshooting

### Common Issues

1. **Stale Closure in Mutations**
   ```typescript
   // ❌ Bad - stale user
   const mutation = api.user.update.useMutation({
     onSuccess: () => {
       console.log(user); // Might be stale
     },
   });
   
   // ✅ Good - fresh user
   const mutation = api.user.update.useMutation({
     onSuccess: () => {
       const freshUser = useAuth.getState().user;
       console.log(freshUser);
     },
   });
   ```

2. **Race Conditions**
   ```typescript
   // Use mutation callbacks instead of effects
   const mutation = api.auth.signIn.useMutation({
     onSuccess: (data) => {
       // Handle success immediately
       router.replace('/(home)');
     },
   });
   ```

3. **Memory Leaks**
   ```typescript
   // Clean up queries on unmount
   useEffect(() => {
     return () => {
       utils.user.getProfile.cancel();
     };
   }, []);
   ```

## Summary

The TanStack Query + tRPC + Zustand combination provides:

1. **Type Safety**: End-to-end TypeScript with tRPC
2. **Intelligent Caching**: TanStack Query handles server state
3. **Optimistic UI**: Instant feedback with rollback on error
4. **Offline Support**: Built-in offline capabilities
5. **Clean Architecture**: Clear separation of concerns

Remember:
- Use TanStack Query for all server state
- Use Zustand for client-only state
- Let tRPC handle the type safety
- Always implement error handling
- Consider offline scenarios