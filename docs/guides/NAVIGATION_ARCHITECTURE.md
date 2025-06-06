# Navigation Architecture Guide

## Overview

This guide documents the navigation architecture for the Expo Full-Stack Starter Kit, including the solution to tab navigation reload issues on web.

## Navigation Structure

```
app/
├── _layout.tsx              # Root Stack navigator
├── index.tsx                # Entry point with auth routing
├── (auth)/                  # Public auth routes
│   ├── _layout.tsx         # Auth stack layout
│   ├── login.tsx
│   ├── signup.tsx
│   ├── complete-profile.tsx
│   └── forgot-password.tsx
├── (home)/                  # Protected app routes
│   ├── _layout.tsx         # Platform-specific tab/slot layout
│   ├── index.tsx           # Home screen
│   ├── explore.tsx         # Explore screen
│   └── settings.tsx        # Settings screen
└── auth-callback.tsx        # OAuth callback handler
```

## Key Implementation Details

### 1. Root Layout (`app/_layout.tsx`)
- Static Stack navigator without auth checks
- Only waits for fonts to load
- All routes are statically defined to prevent re-renders

### 2. Entry Point (`app/index.tsx`)
- Centralized authentication routing
- Uses `<Redirect />` components for navigation
- Handles auth state hydration with loading indicator

### 3. Platform-Specific Tab Navigation

#### Web Implementation
- Uses custom `WebTabBar` component with `Slot`
- Prevents full page reloads using client-side navigation
- Implements `router.replace()` for tab switches

```typescript
// app/(home)/_layout.tsx - Web implementation
if (Platform.OS === 'web') {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <WebTabBar />
    </View>
  );
}
```

#### Mobile Implementation
- Uses native `Tabs` component from Expo Router
- Maintains standard tab navigation behavior
- Includes haptic feedback

### 4. Navigation Patterns

| Action | Method | Usage |
|--------|--------|-------|
| Auth redirects | `<Redirect />` | Guards and initial routing |
| Tab navigation | `router.replace()` | Switching between tabs |
| Screen navigation | `router.push()` | Navigating to new screens |
| Back navigation | `router.back()` | Going back in history |

## Web Tab Navigation Fix

### Problem
On web, the native Tabs component was causing full page reloads when switching tabs, showing "Running application 'main'" in the console.

### Solution
Implemented a platform-specific approach:

1. **Custom WebTabBar Component**
   - Handles tab navigation with `router.replace()`
   - Prevents default browser navigation
   - Maintains visual consistency with native tabs

2. **Event Prevention**
   - Intercepts click events to prevent browser navigation
   - Uses client-side routing exclusively

3. **State Preservation**
   - No re-mounting of components
   - API state preserved between tab switches
   - Faster navigation experience

## Best Practices

1. **Avoid Conditional Rendering at Root Level**
   - Keep root layout static
   - Handle auth checks in entry points

2. **Use Appropriate Navigation Methods**
   - `replace()` for tabs to avoid history buildup
   - `push()` for forward navigation
   - `<Redirect />` for guards

3. **Platform-Specific Optimizations**
   - Separate implementations for web vs native when needed
   - Maintain consistent UX across platforms

4. **Performance Considerations**
   - Minimize re-renders by keeping layouts static
   - Use proper dependencies in useEffect hooks
   - Reduce sync provider polling frequency

## Testing Navigation

1. **Web Testing**
   ```bash
   bun run web
   # Open browser console
   # Switch tabs - should not see "Running application 'main'"
   ```

2. **Mobile Testing**
   ```bash
   bun run ios  # or android
   # Tabs should work with haptic feedback
   ```

## Troubleshooting

### Tabs Still Reloading on Web
- Clear browser cache (Cmd+Shift+R)
- Ensure WebTabBar is being used on web platform
- Check for conditional rendering in parent components

### Navigation Not Working
- Verify auth state is properly hydrated
- Check route names match file structure
- Ensure proper imports for navigation methods

## Related Documentation
- [Authentication Flow](./AUTH_SESSION_MANAGEMENT.md)
- [Project Structure](../planning/PROJECT_STRUCTURE_TASKS.md)
- [Expo Router Best Practices](./EXPO_TRPC_BEST_PRACTICES.md)