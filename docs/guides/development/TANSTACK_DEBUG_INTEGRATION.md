# TanStack Query Debug Integration

## Overview
We've integrated TanStack Query debugging capabilities into our Enhanced Debug Panel, providing a unified debugging experience for both application logs and query/mutation states.

## Differences Between TanStack DevTools and Our Debug Panel

### TanStack Query DevTools (Web Only)
- **Platform**: Only available on web platform
- **UI**: Floating panel at bottom-left
- **Features**:
  - Visual query explorer with tree view
  - Real-time query state updates
  - Query timeline and performance metrics
  - Detailed query/mutation inspector
  - Network request details
  - Cache manipulation tools

### Our Enhanced Debug Panel (All Platforms)
- **Platform**: Works on iOS, Android, and Web
- **UI**: Unified modal with tabs
- **Features**:
  - **Logs Tab**: Application logs with filtering and search
  - **TanStack Query Tab**: 
    - Query status overview
    - Active fetches and mutations count
    - Grouped queries by route
    - Cache invalidation controls
    - Query refetch controls
    - Mutation status tracking

## What Our Integration Shows

### Query Information
```typescript
- Query Key (route and parameters)
- Status: 'success' | 'error' | 'pending'
- Fetch Status: 'idle' | 'fetching' | 'paused'
- Update Count: How many times data has been updated
- Error Count: How many errors occurred
- Error Messages: If query failed
```

### Available Actions
1. **Invalidate All**: Mark all queries as stale
2. **Refetch All**: Force refetch all queries
3. **Clear Cache**: Remove all cached data

### Color Coding
- 🟢 Green: Successful queries
- 🟡 Yellow: Pending queries
- 🔴 Red: Failed queries
- ⚫ Gray: Idle queries

## Implementation Details

### Query Grouping
Queries are grouped by their first key (usually the tRPC route):
```typescript
// Example grouping:
{
  "auth.getSession": [/* all auth session queries */],
  "user.getProfile": [/* all user profile queries */],
  "posts.list": [/* all post list queries */]
}
```

### Real-time Updates
- The TanStack tab shows real-time query states
- Automatically updates when queries change
- Shows active mutations as they happen

## Usage Scenarios

### When to Use TanStack Tab
1. **Debug API Calls**: See which queries are active
2. **Performance Issues**: Check update counts and fetch status
3. **Cache Problems**: Invalidate or clear specific data
4. **Network Issues**: See failed queries and errors
5. **Loading States**: Track pending queries and mutations

### Common Debugging Tasks
1. **"Data not updating"**: Use "Invalidate All" to mark cache as stale
2. **"Stale data showing"**: Use "Refetch All" to force fresh data
3. **"Weird cache behavior"**: Use "Clear Cache" to reset
4. **"API errors"**: Check red queries for error messages

## Benefits of Integration

1. **Cross-Platform**: Unlike React Query DevTools (web only), this works everywhere
2. **Unified Interface**: No need to switch between different debug tools
3. **Mobile-Friendly**: Touch-optimized UI for mobile debugging
4. **Integrated Logging**: See both logs and queries in one place
5. **Copy Support**: Easy to share query states for debugging

## Example Debug Flow

1. User reports "Profile not updating"
2. Open Debug Panel → TanStack Query tab
3. Find "user.getProfile" query group
4. Check status (might be cached/stale)
5. Tap "Invalidate All" or "Refetch All"
6. Watch query status change to "fetching"
7. Verify data updates when query completes

## Technical Implementation

```typescript
// Getting query information
const queryClient = useQueryClient();
const queries = queryClient.getQueryCache().getAll();

// Query state includes:
query.state = {
  status: 'success' | 'error' | 'pending',
  fetchStatus: 'idle' | 'fetching' | 'paused',
  dataUpdateCount: number,
  errorUpdateCount: number,
  data: any,
  error: any
}
```

## Future Enhancements

1. **Query Filtering**: Filter queries by status or route
2. **Individual Query Actions**: Invalidate/refetch specific queries
3. **Performance Metrics**: Show query timing information
4. **Network Inspector**: Show actual network requests
5. **Query Dependencies**: Visualize query relationships