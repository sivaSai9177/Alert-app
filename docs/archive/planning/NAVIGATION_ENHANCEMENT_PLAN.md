# Navigation Enhancement Plan

## Current Navigation Architecture

### Stack Overview
- **Expo Router SDK 53**: File-based routing with automatic route generation
- **TanStack Query v5**: Server state management with caching
- **tRPC**: Type-safe API calls
- **Zustand**: Client state management (no Context API)
- **Better Auth**: Authentication with session management

### Current Route Structure
```
app/
├── (auth)/              # Public auth screens
│   ├── login.tsx
│   ├── signup.tsx
│   ├── complete-profile.tsx
│   └── forgot-password.tsx
├── (home)/              # Protected app screens
│   ├── _layout.tsx      # Tab navigation
│   ├── index.tsx        # Home tab
│   ├── explore.tsx      # Explore tab
│   ├── manager.tsx      # Manager-only tab
│   └── admin.tsx        # Admin-only tab
├── index.tsx            # Entry point with auth routing
└── auth-callback.tsx    # OAuth callback handler
```

## Enhancement Requirements

### 1. Keep These Tabs
- **Home**: Main dashboard (role-based content)
- **Explore**: Feature discovery
- **Settings**: User preferences and account management

### 2. Role-Based Routing
Users should be routed to home and see content based on their role:
- **Admin**: Full dashboard with analytics, user management
- **Manager**: Team overview, reports, approvals
- **User**: Personal dashboard, tasks, content
- **Guest**: Limited view, prompt to complete profile

### 3. Use Expo Router
- Pure file-based routing
- No manual navigation configuration
- Automatic deep linking support

### 4. TanStack Query + tRPC
- All API calls through tRPC
- TanStack Query for caching and synchronization
- No direct auth client calls

### 5. Shadcn Components
- Adapt web components for React Native
- Maintain consistent theming
- Support dark/light modes

## Implementation Plan

### Phase 1: Fix Current Issues

#### 1.1 Google OAuth Flow (Priority: High)
**Issue**: OAuth redirect being intercepted by Expo Router

**Solution**: 
- ✅ Updated `GoogleSignInButton` to use Better Auth client
- Use `signIn.social()` method for proper OAuth flow
- Avoid direct navigation to API routes

**Code**:
```typescript
// GoogleSignInButton.tsx
const result = await authClient.signIn.social({
  provider: 'google',
  callbackURL: '/auth-callback',
});
```

#### 1.2 Tab Reload Issue (Priority: High)
**Issue**: Tabs causing app reinitialization

**Solution**:
- ✅ Removed `Stack.Protected` guards
- ✅ Centralized navigation logic to index.tsx
- Use guards in individual layouts instead

### Phase 2: Navigation Structure

#### 2.1 New Route Structure
```
app/
├── (auth)/              # Public routes
│   ├── _layout.tsx      # Simple stack layout
│   ├── login.tsx
│   ├── signup.tsx
│   ├── complete-profile.tsx
│   └── forgot-password.tsx
├── (app)/               # Protected routes
│   ├── _layout.tsx      # Tab layout with auth guard
│   ├── (tabs)/
│   │   ├── home.tsx     # Home tab
│   │   ├── explore.tsx  # Explore tab
│   │   └── settings.tsx # Settings tab
│   ├── profile/
│   │   ├── index.tsx    # Profile view
│   │   └── edit.tsx     # Edit profile
│   ├── admin/           # Admin-only routes
│   │   ├── users.tsx
│   │   ├── analytics.tsx
│   │   └── audit.tsx
│   └── manager/         # Manager-only routes
│       ├── team.tsx
│       └── reports.tsx
├── index.tsx            # Entry router
└── _layout.tsx          # Root layout with providers
```

#### 2.2 Tab Layout Implementation
```typescript
// app/(app)/_layout.tsx
export default function AppLayout() {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  
  if (!hasHydrated) {
    return <LoadingView />;
  }
  
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <IconSymbol name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconSymbol name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Phase 3: Role-Based Content

#### 3.1 Home Screen with Role-Based Content
```typescript
// app/(app)/(tabs)/home.tsx
export default function HomeScreen() {
  const { user } = useAuthStore();
  const { data: dashboardData } = api.dashboard.getByRole.useQuery();
  
  return (
    <ScrollView>
      {user?.role === 'admin' && <AdminDashboard data={dashboardData} />}
      {user?.role === 'manager' && <ManagerDashboard data={dashboardData} />}
      {user?.role === 'user' && <UserDashboard data={dashboardData} />}
      {user?.role === 'guest' && <GuestPrompt />}
    </ScrollView>
  );
}
```

#### 3.2 Protected Route Components
```typescript
// components/ProtectedRoute.tsx
export function ProtectedRoute({ 
  children, 
  requiredRole,
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, hasRole, hasPermission } = useAuthStore();
  
  if (requiredRole && !hasRole(requiredRole)) {
    return <Redirect href="/(app)/home" />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <UnauthorizedView />;
  }
  
  return <>{children}</>;
}
```

### Phase 4: Shadcn Components for Native

#### 4.1 Button Component (Native)
```typescript
// components/shadcn/ui/button.tsx
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';

export function Button({ 
  children, 
  variant = 'default',
  loading,
  disabled,
  onPress,
  ...props 
}) {
  const theme = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.primaryForeground} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
```

#### 4.2 Card Component (Native)
```typescript
// components/shadcn/ui/card.tsx
export function Card({ children, className, ...props }) {
  return (
    <View style={[styles.card, className]} {...props}>
      {children}
    </View>
  );
}

Card.Header = function CardHeader({ children, className, ...props }) {
  return (
    <View style={[styles.cardHeader, className]} {...props}>
      {children}
    </View>
  );
};
```

### Phase 5: Theme Implementation

#### 5.1 Theme Provider Enhancement
```typescript
// lib/theme/theme-provider.tsx
export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    spacing: spacing,
    typography: typography,
    shadows: shadows,
  };
}
```

#### 5.2 Global Styles with NativeWind
```css
/* app/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
  }
}
```

### Phase 6: TanStack Query Integration

#### 6.1 Query Patterns
```typescript
// Custom hooks for data fetching
export function useDashboardData() {
  const { user } = useAuthStore();
  
  return api.dashboard.getByRole.useQuery(
    { role: user?.role },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!user,
    }
  );
}
```

#### 6.2 Mutation Patterns
```typescript
// Optimistic updates with TanStack Query
export function useUpdateProfile() {
  const utils = api.useContext();
  
  return api.user.updateProfile.useMutation({
    onMutate: async (newData) => {
      // Cancel outgoing queries
      await utils.user.getProfile.cancel();
      
      // Snapshot previous value
      const previousProfile = utils.user.getProfile.getData();
      
      // Optimistically update
      utils.user.getProfile.setData(undefined, newData);
      
      return { previousProfile };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      utils.user.getProfile.setData(undefined, context?.previousProfile);
    },
    onSettled: () => {
      // Refetch after mutation
      utils.user.getProfile.invalidate();
    },
  });
}
```

## Best Practices

### 1. Navigation
- Use Expo Router's `<Link>` and `router.push()` instead of `href`
- Implement proper loading states during navigation
- Handle deep linking for all routes

### 2. State Management
- Keep auth state in Zustand
- Use TanStack Query for all server state
- Avoid prop drilling with proper store usage

### 3. Performance
- Lazy load heavy screens
- Use React.memo for expensive components
- Implement proper list virtualization

### 4. Security
- Always validate routes on the server
- Use tRPC procedures with proper auth middleware
- Never trust client-side role checks alone

## Migration Steps

1. **Fix OAuth Issue** (Immediate)
   - ✅ Update GoogleSignInButton
   - Test OAuth flow
   - Document any remaining issues

2. **Restructure Routes** (Day 1)
   - Create new route structure
   - Move existing screens
   - Update navigation logic

3. **Implement Role-Based Content** (Day 2)
   - Create role-specific components
   - Add tRPC endpoints for role-based data
   - Test with different user roles

4. **Convert Shadcn Components** (Day 3-4)
   - Start with Button, Card, Input
   - Add theme support
   - Test on all platforms

5. **Optimize Performance** (Day 5)
   - Add lazy loading
   - Implement caching strategies
   - Profile and optimize

## Success Metrics

- OAuth login works on all platforms
- Tab navigation doesn't cause reloads
- Role-based content displays correctly
- All shadcn components work on iOS/Android/Web
- Theme switching works smoothly
- TanStack Query caches effectively

## Resources

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [tRPC Docs](https://trpc.io/docs)
- [Shadcn UI Docs](https://ui.shadcn.com/)
- [NativeWind Docs](https://www.nativewind.dev/)