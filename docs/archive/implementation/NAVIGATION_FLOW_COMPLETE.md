# Complete Navigation Flow Documentation

## Current Navigation Structure

```
app/
├── index.tsx                    # Entry point - handles initial routing
├── auth-callback.tsx           # OAuth callback handler
├── (auth)/                     # Public auth screens (group)
│   ├── _layout.tsx            # Auth layout (no protection)
│   ├── login.tsx              # Login screen
│   ├── signup.tsx             # Signup screen
│   ├── complete-profile.tsx   # Profile completion
│   └── forgot-password.tsx    # Password reset
├── (home)/                     # Protected app screens (group)
│   ├── _layout.tsx            # Tab layout with auth guards
│   ├── index.tsx              # Home tab
│   ├── explore.tsx            # Explore tab
│   ├── settings.tsx           # Settings tab
│   ├── manager.tsx            # Manager screen (hidden)
│   └── admin.tsx              # Admin screen (hidden)
└── _layout.tsx                # Root layout with providers
```

## Navigation Flow

### 1. Initial App Load (`app/index.tsx`)
```
User opens app → index.tsx checks auth state:
├── If loading → Show spinner
├── If authenticated:
│   ├── If needsProfileCompletion → Redirect to /(auth)/complete-profile
│   └── Else → Redirect to /(home)
└── If not authenticated → Redirect to /(auth)/login
```

### 2. OAuth Flow
```
User clicks Google Sign-In → OAuth redirect:
├── Navigate to /api/auth/signin/google
├── Redirect to Google OAuth
├── Google redirects back to /api/auth/callback/google
├── Better Auth processes callback
└── Redirect to /auth-callback
```

### 3. Auth Callback (`app/auth-callback.tsx`)
```
OAuth callback received → Process session:
├── Fetch session via tRPC (auth.getSession)
├── If session found:
│   ├── Update auth store
│   ├── If needsProfileCompletion → Navigate to /(auth)/complete-profile
│   └── Else → Navigate to /(home)
└── If no session → Navigate to /(auth)/login
```

### 4. Profile Completion Flow
```
User at complete-profile → Submit profile:
├── Call tRPC completeProfile mutation
├── Update auth store
└── Navigate to /(home)
```

### 5. Protected Routes (`app/(home)/_layout.tsx`)
```
User navigates to protected route:
├── Check isAuthenticated
├── Check needsProfileCompletion
├── If not authorized → Redirect to appropriate screen
└── If authorized → Show content
```

## Common Issues & Solutions

### Issue 1: Stuck in Loading State
**Cause**: `hasHydrated` is false or auth state not loading
**Solution**: Ensure Zustand store hydration completes

### Issue 2: Redirect Loop
**Cause**: Conflicting navigation logic between layouts
**Solution**: Centralize navigation logic in index.tsx

### Issue 3: OAuth Success but No Navigation
**Cause**: auth-callback not processing session correctly
**Solution**: Ensure tRPC getSession returns fresh data

### Issue 4: Profile Completion Not Triggered
**Cause**: `needsProfileCompletion` not set correctly
**Solution**: Check database for OAuth users' profile status

## Navigation Best Practices

1. **Use Expo Router Navigation**:
   ```typescript
   import { router } from 'expo-router';
   
   // Replace routes (no back button)
   router.replace('/(home)');
   
   // Push routes (with back button)
   router.push('/profile/edit');
   ```

2. **Redirect Component for Declarative Navigation**:
   ```typescript
   import { Redirect } from 'expo-router';
   
   return <Redirect href="/(home)" />;
   ```

3. **Guard Components**:
   ```typescript
   // In layout files
   if (!isAuthenticated) {
     return <Redirect href="/(auth)/login" />;
   }
   ```

4. **Loading States**:
   ```typescript
   if (isLoading || !hasHydrated) {
     return <LoadingView />;
   }
   ```

## Testing Navigation

### Manual Test Flow:
1. Clear browser storage (localStorage)
2. Navigate to http://localhost:8081
3. Should redirect to login
4. Click Google Sign-In
5. Complete OAuth flow
6. Should see "Processing login..." (auth-callback)
7. Should redirect to:
   - Profile completion (if new user)
   - Home screen (if existing user)

### Debug Points:
- Check console for navigation logs
- Verify auth store state in Redux DevTools
- Check network tab for tRPC calls
- Look for redirect loops in browser history

## Navigation State Diagram

```
┌─────────────┐
│   Start     │
│  (index)    │
└─────┬───────┘
      │
      ▼
┌─────────────┐     No Auth      ┌─────────────┐
│   Check     │─────────────────►│   Login     │
│    Auth     │                   └──────┬──────┘
└──────┬──────┘                          │
       │                                 │ OAuth
       │ Authenticated                   ▼
       ▼                          ┌─────────────┐
┌─────────────┐                   │   Google    │
│   Check     │                   │   OAuth     │
│  Profile    │                   └──────┬──────┘
└──────┬──────┘                          │
       │                                 ▼
       │                          ┌─────────────┐
       ├──── Needs ──────────────►│  Complete   │
       │   Completion             │   Profile   │
       │                          └──────┬──────┘
       │                                 │
       │ Complete                        │
       ▼                                 ▼
┌─────────────┐                   ┌─────────────┐
│    Home     │◄──────────────────┘
│   (Tabs)    │
└─────────────┘
```

## Code Implementation

### Updated `app/index.tsx`:
```typescript
export default function Index() {
  const { user, isLoading, isAuthenticated, hasHydrated } = useAuth();

  // Wait for hydration
  if (!hasHydrated) {
    return <LoadingView />;
  }

  // Wait for auth check
  if (isLoading) {
    return <LoadingView />;
  }

  // Navigation logic
  if (isAuthenticated && user) {
    if (user.needsProfileCompletion || user.role === 'guest') {
      return <Redirect href="/(auth)/complete-profile" />;
    }
    return <Redirect href="/(home)" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}
```

### Key Points:
1. Single source of truth for navigation (index.tsx)
2. Guards in individual layouts for protection
3. OAuth callback handles session refresh
4. Profile completion check on every auth state change