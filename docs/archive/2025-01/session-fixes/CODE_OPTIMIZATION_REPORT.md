# Code Optimization Report

## Summary
This report contains identified optimization opportunities in the codebase focusing on performance, code quality, and best practices.

## 1. Console.log Statements to Remove (High Priority)

Found 50+ files with console.log statements that should be replaced with the structured logger.

### Critical Files:
- `/lib/stores/auth-store.ts` - Lines 136, 139, 162
- `/lib/auth/auth-client.ts` - Lines 17, 83, 87-94, 100-124, 143-157
- `/app/api/auth/[...auth]+api.ts` - Multiple instances
- `/src/server/routers/auth.ts` - Multiple instances

### Action Required:
Replace all `console.log` with structured logging using `log` from `@/lib/core/logger`.

Example:
```typescript
// Before
console.log('[AuthStore] clearAuth called');

// After
log.store.update('Clearing auth state');
```

## 2. Database Query Optimizations (High Priority)

### Missing Indexes
The healthcare schema lacks critical indexes for frequently queried fields:

```sql
-- Add these indexes to improve query performance
CREATE INDEX idx_alerts_hospital_status ON alerts(hospital_id, status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_urgency_level ON alerts(urgency_level DESC);
CREATE INDEX idx_alert_escalations_alert_id ON alert_escalations(alert_id);
CREATE INDEX idx_alert_acknowledgments_alert_id ON alert_acknowledgments(alert_id);
CREATE INDEX idx_notification_logs_alert_user ON notification_logs(alert_id, user_id);
CREATE INDEX idx_healthcare_audit_logs_user_timestamp ON healthcare_audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_healthcare_users_hospital_id ON healthcare_users(hospital_id);
```

### N+1 Query Issues
Found in `/src/server/routers/healthcare.ts`:

1. **getActiveAlerts** (lines 111-139): Uses multiple joins but could benefit from query optimization
2. **getEscalationHistory** (lines 483-495): Performs join that could be optimized with proper indexes

### Recommended Fix:
```typescript
// Consider using a single query with JSON aggregation for related data
const activeAlerts = await db.execute(sql`
  SELECT 
    a.*,
    json_build_object('id', u1.id, 'name', u1.name, 'email', u1.email) as creator,
    json_build_object('id', u2.id, 'name', u2.name, 'email', u2.email) as acknowledged_by
  FROM alerts a
  LEFT JOIN users u1 ON a.created_by = u1.id
  LEFT JOIN users u2 ON a.acknowledged_by = u2.id
  WHERE a.hospital_id = ${hospitalId}
    AND a.status IN ('active', 'acknowledged')
  ORDER BY a.urgency_level DESC, a.created_at DESC
  LIMIT ${limit} OFFSET ${offset}
`);
```

## 3. React Component Optimizations (Medium Priority)

### Components Missing Memoization:
1. **HomeScreen** (`/app/(home)/index.tsx`):
   - `DashboardMetrics` component (line 72) - Should be wrapped in `React.memo`
   - `QuickActions` component (line 104) - Should be wrapped in `React.memo`
   - Multiple inline functions that should use `useCallback`

2. **Missing useMemo for expensive computations**:
   - `getMetricsByRole()` (line 221) - Called on every render
   - `getQuickActionsByRole()` (line 248) - Called on every render

### Recommended Fix:
```typescript
// Memoize components
const DashboardMetrics = React.memo(({ metrics }: { metrics: any[] }) => {
  // component implementation
});

// Use useMemo for computed values
const metrics = useMemo(() => getMetricsByRole(), [user?.role]);
const quickActions = useMemo(() => getQuickActionsByRole(), [user?.role, router]);
```

## 4. Bundle Size Optimizations (Medium Priority)

### Unused Imports Found:
1. Multiple unused imports in component files
2. Development-only dependencies potentially included in production bundle

### Heavy Dependencies to Review:
- React Native Reanimated - Only used in specific components
- Chart libraries - Consider lazy loading for chart components

### Recommendations:
1. Use dynamic imports for heavy components:
```typescript
const AreaChartInteractive = lazy(() => import('@/components/universal/charts/AreaChartInteractive'));
```

2. Remove unused imports using ESLint auto-fix

## 5. Duplicate Code Patterns (Low Priority)

### Authentication Update Pattern:
Found similar patterns in multiple files:
- `/app/(auth)/login.tsx`
- `/app/(auth)/register.tsx`
- `/app/auth-callback.tsx`
- `/components/GoogleSignInButton.tsx`

### Recommendation:
Create a custom hook for auth updates:
```typescript
export const useAuthUpdate = () => {
  const { updateAuth } = useAuthStore();
  
  return useCallback(async (user: AppUser, session: Session) => {
    await updateAuth(user, session);
    log.auth.login('User authenticated', { userId: user.id });
  }, [updateAuth]);
};
```

## 6. Performance Quick Wins

### 1. Remove Synchronous Storage Access
In `/lib/stores/auth-store.ts`, the rehydration check accesses storage synchronously which can block the UI.

### 2. Optimize Image Loading
Add lazy loading for Avatar components and use appropriate image sizes.

### 3. Debounce Search Inputs
Components with search functionality should debounce input to prevent excessive re-renders.

### 4. Virtual Lists for Large Data
For lists with many items (alerts, audit logs), implement virtualization.

## Implementation Priority

1. **Immediate (1-2 days)**:
   - Remove console.log statements
   - Add database indexes
   - Fix N+1 queries

2. **Short-term (3-5 days)**:
   - Memoize React components
   - Implement useCallback for event handlers
   - Add useMemo for expensive computations

3. **Medium-term (1 week)**:
   - Lazy load heavy components
   - Implement virtual lists
   - Refactor duplicate code patterns

4. **Long-term**:
   - Full bundle size audit
   - Performance monitoring setup
   - Code splitting optimization

## Estimated Performance Improvements

- **Database queries**: 50-70% faster with proper indexes
- **React re-renders**: 30-40% reduction with memoization
- **Bundle size**: 15-20% reduction with lazy loading
- **Initial load time**: 20-30% improvement with code splitting

## Next Steps

1. Run ESLint with auto-fix to clean up unused imports
2. Create migration file for database indexes
3. Implement React.memo on frequently rendered components
4. Set up bundle analyzer to identify large dependencies
5. Configure production build to strip console statements automatically