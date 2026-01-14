# Navigation Fix: Hybrid Navigation Pattern

## Problem
The app was reloading completely when switching between tabs, showing "Running application 'main'" in the console logs. This was caused by conditional rendering and state-based navigation at the root level.

## Solution
Implemented a hybrid navigation approach using:
- `<Redirect />` components for navigation guards (prevents "navigate before mounting" errors)
- `router.push()` and `router.replace()` for user-initiated navigation
- Native `<Tabs />` component for tab navigation (most stable approach)

## Key Changes

### 1. Root Layout Optimization
**File**: `app/_layout.tsx`
- Removed `hasHydrated` check from useAuth
- Eliminated conditional rendering that was causing re-renders
- Only waits for fonts to load before rendering

### 2. Custom Tab Bar Implementation
**File**: `components/CustomTabBar.tsx`
- Created custom tab bar using imperative navigation
- Uses `router.replace()` for tab switches (prevents stack buildup)
- Implements haptic feedback for better UX
- Handles active state detection properly

### 3. Tab Layout Simplification
**File**: `app/(home)/_layout.tsx`
- Replaced `Tabs` navigator with `Slot` component
- Removed all navigation logic from tab layout
- Uses custom tab bar for navigation

### 4. Consistent Navigation Patterns
**Throughout the app**:
- Auth redirects: `router.replace()` - Clean transitions without history
- Tab navigation: `router.replace()` - Prevents stack buildup
- Feature navigation: `router.push()` - Allows back navigation
- No more `<Redirect />` components

### 5. Index Route Optimization
**File**: `app/index.tsx`
- Uses `useEffect` with `router.replace()` for auth routing
- Shows loading state while determining navigation
- Prevents multiple redirects with proper dependencies

### 6. Auth Layout Updates
**File**: `app/(auth)/_layout.tsx`
- Uses `router.replace()` in useEffect for authenticated users
- Prevents rendering issues with conditional navigation

## Navigation Flow

```
App Start
    ↓
app/index.tsx (Loading)
    ↓
Check Auth State
    ↓
router.replace() based on state:
  - Not authenticated → /(auth)/login
  - Needs profile → /(auth)/complete-profile
  - Authenticated → /(home)
    ↓
Tab Navigation via CustomTabBar
  - router.replace() for tab switches
  - No app reloads
```

## Benefits

1. **Performance**: No more full app reloads on tab switches
2. **UX**: Instant tab navigation with haptic feedback
3. **Consistency**: All navigation uses router methods
4. **Simplicity**: Cleaner code without conditional rendering
5. **Maintainability**: Clear separation of concerns

## Testing

Run the test script to verify the fix:
```bash
bun run scripts/test-navigation-fix.ts
```

## Future Considerations

1. Consider implementing Expo Router v5's `Stack.Protected` when it becomes more stable
2. Add navigation persistence for better UX on app restart
3. Implement deep linking support with the new navigation structure