# Navigation Architecture - Expo Router v5

## Overview

This document outlines the navigation architecture implemented using Expo Router SDK 53 v5 with the Stack.Protected pattern for authentication guards.

## Current Implementation (Expo Router v5 Pattern)

### 1. **Stack.Protected Guards**
- Implemented `Stack.Protected` in `app/_layout.tsx` for declarative auth routing
- Boolean-based guards automatically handle authentication state changes
- No manual navigation logic needed - guards trigger automatic re-routing

### 2. **Pure Expo Router File-Based Routing**
```
app/
├── _layout.tsx          # Root layout with providers
├── index.tsx           # Entry point with auth routing logic
├── (auth)/            # Public routes group
│   ├── _layout.tsx    # Auth layout with guards
│   ├── login.tsx
│   ├── signup.tsx
│   ├── complete-profile.tsx
│   └── forgot-password.tsx
├── (home)/            # Protected routes group (tabs)
│   ├── _layout.tsx    # Tab layout with auth guards
│   ├── index.tsx      # Home dashboard
│   ├── explore.tsx
│   ├── settings.tsx
│   ├── admin.tsx      # Role-based visibility
│   └── manager.tsx    # Role-based visibility
└── auth-callback.tsx   # OAuth callback handler
```

### 3. **TanStack Query Integration**
- All API calls use tRPC with TanStack Query
- Session synchronization via `SyncProvider` component
- No direct API calls - everything goes through tRPC mutations and queries

### 4. **Authentication Flow**
```typescript
// SyncProvider.tsx - Handles auth state synchronization
const { data, error } = api.auth.getSession.useQuery(undefined, {
  refetchInterval: 30 * 1000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: 2 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
});
```

### 5. **Route Guards Implementation**
```typescript
// app/_layout.tsx - Root layout with Stack.Protected
export default function RootLayout() {
  const { user, hasHydrated, isAuthenticated } = useAuth();
  
  if (!hasHydrated) {
    return <LoadingView />;
  }
  
  const isProtected = isAuthenticated && user && !user.needsProfileCompletion && user.role !== 'guest';
  
  return (
    <TRPCProvider>
      <SyncProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isProtected}>
            <Stack.Screen name="(home)" />
          </Stack.Protected>
          <Stack.Protected guard={!isProtected}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="index" />
          </Stack.Protected>
          <Stack.Screen name="auth-callback" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SyncProvider>
    </TRPCProvider>
  );
}
```

### 6. **Role-Based Tab Visibility**
```typescript
// Dynamic tab visibility based on user role
<Tabs.Screen
  name="admin"
  options={{
    href: canAccessAdmin ? undefined : null, // Hide if not admin
    title: "Admin",
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="shield.fill" color={color} />
    ),
  }}
/>
```

### 7. **Navigation Service**
```typescript
// lib/navigation.ts - Imperative navigation helpers
export const navigation = {
  // Auth routes
  toLogin: () => router.replace('/(auth)/login'),
  toSignup: () => router.replace('/(auth)/signup'),
  toCompleteProfile: () => router.replace('/(auth)/complete-profile'),
  
  // App routes
  toHome: () => router.replace('/(home)'),
  toExplore: () => router.navigate('/(home)/explore'),
  toSettings: () => router.navigate('/(home)/settings'),
  
  // Dynamic navigation based on auth state
  navigateAfterAuth: (user) => {
    if (user.needsProfileCompletion || user.role === 'guest') {
      navigation.toCompleteProfile();
    } else {
      navigation.toHome();
    }
  },
};
```

### 8. **Theme Integration**
- Shadcn theme colors converted to React Native compatible format
- `ShadcnThemeProvider` provides theme context
- Button and other UI components use theme colors dynamically

## Best Practices

### 1. **Use Stack.Protected for Authentication**
- Leverage Expo Router v5's Stack.Protected pattern
- Guards automatically handle navigation when auth state changes
- No manual navigation logic in components

### 2. **Centralized Auth State**
- Single source of truth in Zustand store
- TanStack Query for server state synchronization
- No Context API for auth state

### 3. **Loading States**
- Show loading indicators while checking auth state
- Prevent flash of wrong content
- Use `hasHydrated` flag from Zustand

### 4. **Error Handling**
- tRPC error handling with proper types
- User-friendly error messages via `showErrorAlert`
- Automatic session clearing on 401 errors

### 5. **Form Handling**
- React Hook Form with Zod validation
- tRPC mutations for all form submissions
- Loading states on buttons during submission

## Navigation Flow Diagram

```
App Start
    ↓
app/_layout.tsx (Stack.Protected Guards)
    ↓
Check Auth State (hasHydrated)
    ↓
Stack.Protected evaluates guards
    ↓
    ├─ guard={!isProtected} → Show Auth Routes
    │   ├─ index.tsx → Redirects to home
    │   ├─ (auth)/login
    │   ├─ (auth)/signup
    │   └─ (auth)/complete-profile
    │
    └─ guard={isProtected} → Show Protected Routes
        └─ (home) (Tab Navigator)
            ├─ Home Tab (Role-based dashboard)
            ├─ Explore Tab
            ├─ Settings Tab
            ├─ Manager Tab (hidden if not manager/admin)
            └─ Admin Tab (hidden if not admin)
```

## Key Files

1. **`app/_layout.tsx`** - Root layout with Stack.Protected guards
2. **`components/SyncProvider.tsx`** - Auth state synchronization (no navigation side effects)
3. **`app/index.tsx`** - Simple entry point that redirects to home
4. **`app/(auth)/_layout.tsx`** - Public routes layout
5. **`app/(home)/_layout.tsx`** - Protected tab navigation
6. **`lib/navigation.ts`** - Navigation utilities
7. **`lib/theme/theme-provider.tsx`** - Shadcn theme integration

## Common Issues Resolved

1. **Tab Reload Issue**: Fixed by removing navigation logic from AuthSync and using Stack.Protected properly
2. **Navigation Loops**: Prevented by using boolean guards instead of imperative navigation
3. **Theme Integration**: Created theme provider for React Native
4. **Form Submission**: Integrated with tRPC mutations
5. **Role-Based Access**: Dynamic tab visibility based on user role

## Future Enhancements

1. **Deep Linking**: Configure for OAuth callbacks and app links
2. **Offline Support**: Implement with TanStack Query persistence
3. **Push Notifications**: Navigation to specific screens from notifications
4. **Analytics**: Track navigation events
5. **Gesture Navigation**: Enhanced navigation with gestures

This architecture provides a solid foundation for a scalable, enterprise-ready React Native application with proper authentication, authorization, and navigation patterns.