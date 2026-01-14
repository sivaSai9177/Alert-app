import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// React Query Devtools not available for React Native
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState, useEffect } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import type { AppRouter } from '@/src/server/routers';
import { getApiUrl } from './core/unified-env';
import { log } from '@/lib/core/logger';
import { createSplitLink, closeWebSocketConnection } from './trpc/links';

// Create tRPC React hooks
export const api = createTRPCReact<AppRouter>();

// Optimized query client factory to prevent excessive refetching
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Much longer stale time to reduce requests
        staleTime: 10 * 60 * 1000, // 10 minutes
        // Disable aggressive refetching
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Only fetch when explicitly needed
        refetchOnReconnect: false, // Prevents loader on network changes
        // Disable background refetch
        refetchInterval: false,
        refetchIntervalInBackground: false,
        // Conservative retry strategy
        retry: (failureCount, error) => {
          // Don't retry on auth errors
          if (error instanceof TRPCClientError) {
            const code = error.data?.code;
            if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN' || code === 'NOT_FOUND') {
              return false;
            }
          }
          return failureCount < 1; // Only retry once
        },
        retryDelay: 2000, // Fixed 2 second delay
        // Longer cache time
        gcTime: 15 * 60 * 1000, // 15 minutes
      },
      mutations: {
        retry: false,
        // Global error handling for mutations
        onError: (error) => {
          log.api.error('Mutation failed', error);
        },
        // Global success handling
        onSuccess: () => {
          log.api.response('Mutation completed successfully');
        },
        // Prevent mutation caching issues
        gcTime: 0,
      },
    },
  });
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  log.api.request('TRPC Provider mounting');
  
  const [queryClient] = useState(() => createQueryClient());
  const [error, setError] = useState<string | null>(null);
  
  // Handle app state changes for WebSocket connection
  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Close WebSocket when app goes to background
        closeWebSocketConnection();
      }
      // WebSocket will reconnect automatically when needed
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Create stable tRPC client with proper error handling
  const trpcClient = React.useMemo(() => {
    try {
      // Clear any environment cache to ensure fresh URL
      const { clearEnvCache } = require('./core/unified-env');
      clearEnvCache();
      
      // Use split link for WebSocket support
      const link = createSplitLink();
      
      return api.createClient({
        links: [link],
      });
    } catch (err) {
      log.api.error('Failed to create tRPC client', err);
      setError('Failed to initialize tRPC client');
      // Return a minimal client that will fail gracefully
      return api.createClient({
        links: [
          httpBatchLink({
            url: `${getApiUrl()}/api/trpc`,
          }),
        ],
      });
    }
  }, []);

  // Show error state if tRPC initialization failed
  if (error) {
    log.api.error('tRPC Provider error state', { error });
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* React Query DevTools not available for React Native */}
        {/* {__DEV__ && Platform.OS === 'web' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
            position="bottom"
          />
        )} */}
      </QueryClientProvider>
    </api.Provider>
  );
}

// Export typed hooks for convenience
export const trpc = api;

// Custom hooks for common tRPC patterns
export function useOptimisticMutation<TOutput>(
  mutationFn: any,
  options?: {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: any) => void;
  }
) {
  const utils = api.useUtils();
  
  return mutationFn.useMutation({
    onMutate: async () => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await utils.invalidate();
    },
    onError: (error: any) => {
      log.api.error('Optimistic mutation failed', error);
      options?.onError?.(error);
    },
    onSuccess: (data: TOutput) => {
      options?.onSuccess?.(data);
    },
    onSettled: () => {
      // Sync with server state
      utils.invalidate();
    },
  });
}

// Hook for batch invalidation - with throttling to prevent infinite loops
let lastInvalidation = 0;
export function useBatchInvalidation() {
  const utils = api.useUtils();
  
  return {
    invalidateAll: () => {
      const now = Date.now();
      if (now - lastInvalidation < 1000) { // Throttle to once per second
        log.warn('Query invalidation throttled to prevent infinite loops', 'TRPC');
        return;
      }
      lastInvalidation = now;
      utils.invalidate();
    },
    invalidateAuth: () => {
      const now = Date.now();
      if (now - lastInvalidation < 1000) {
        log.warn('Auth invalidation throttled to prevent infinite loops', 'TRPC');
        return;
      }
      lastInvalidation = now;
      utils.auth.invalidate();
    },
    // Add more specific invalidations as needed
  };
}

// Hook for prefetching with conditional logic
export function usePrefetch() {
  return {
    prefetchOnHover: (procedure: any, input?: any) => ({
      onMouseEnter: Platform.OS === 'web' ? () => {
        procedure.prefetch(input);
      } : undefined,
    }),
    prefetchOnFocus: (procedure: any, input?: any) => ({
      onFocus: () => {
        procedure.prefetch(input);
      },
    }),
  };
}

// Higher-order component for error boundaries
export function withTRPCErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return (props: P) => {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    log.api.error('tRPC Error Boundary caught error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page</p>
        </div>
      );
    }

    return this.props.children;
  }
}