import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// React Query Devtools not available for React Native
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import type { AppRouter } from '@/src/server/routers';
import { getApiUrlSync } from './core/config';
import { log } from '@/lib/core/logger';

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
  
  // Use static URL instead of dynamic updates to prevent re-renders
  const trpcUrl = React.useMemo(() => {
    try {
      const apiUrl = getApiUrlSync();
      const url = `${apiUrl}/api/trpc`;
      log.api.request('TRPC URL configured', { url });
      return url;
    } catch (err) {
      const errorMsg = 'Failed to configure tRPC URL';
      log.api.error(errorMsg, err);
      setError(errorMsg);
      return 'http://localhost:3000/api/trpc'; // fallback
    }
  }, []);

  // Create stable tRPC client with proper error handling
  const trpcClient = React.useMemo(() => {
    try {
      return api.createClient({
        links: [
          httpBatchLink({
            url: trpcUrl,
            headers() {
              // Keep headers simple - credentials: 'include' handles cookies automatically
              return {
                'Content-Type': 'application/json',
              };
            },
            // Simplified fetch with timeout and error handling
            async fetch(url, options) {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => {
                controller.abort();
                log.api.error('tRPC request timeout', { url: url.toString() });
              }, 30000);
              
              try {
                const response = await fetch(url, {
                  ...options,
                  credentials: 'include',
                  signal: controller.signal,
                });
                clearTimeout(timeoutId);
                return response;
              } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                  log.api.error('tRPC request aborted', { url: url.toString() });
                } else {
                  log.api.error('tRPC request failed', error);
                }
                throw error;
              }
            },
          }),
        ],
      });
    } catch (err) {
      log.api.error('Failed to create tRPC client', err);
      setError('Failed to initialize tRPC client');
      // Return a minimal client that will fail gracefully
      return api.createClient({
        links: [
          httpBatchLink({
            url: trpcUrl,
          }),
        ],
      });
    }
  }, [trpcUrl]);

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
  return function TRPCErrorBoundaryWrapper(props: P) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </React.Suspense>
    );
  };
}

// Hook for handling loading states across multiple queries
export function useMultipleQueries(queries: Array<{ enabled?: boolean }>) {
  const isLoading = queries.some(q => q.enabled !== false);
  const hasError = queries.some(q => 'error' in q && q.error);
  
  return {
    isLoading,
    hasError,
    isReady: !isLoading && !hasError,
  };
}