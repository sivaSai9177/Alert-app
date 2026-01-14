'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, httpSubscriptionLink, splitLink, TRPCClientError } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import { getQueryKey } from '@trpc/react-query';
import { transformer } from './trpc';
import { getApiUrl } from './core/unified-env';
import { log } from './core/logger';
import { useAuthStore } from './stores/auth-store';
import type { AppRouter } from '@/src/server/routers';

export const api = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Get token from auth store
  const token = useAuthStore.getState().sessionToken;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Create a stable query client instance
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof TRPCClientError) {
            const { data } = error;
            if (data?.code === 'UNAUTHORIZED') {
              return false;
            }
          }
          return failureCount < 3;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// SSE Subscription manager for better control
class SSESubscriptionManager {
  private connections = new Map<string, EventSource>();
  private reconnectTimeouts = new Map<string, NodeJS.Timeout>();
  private reconnectAttempts = new Map<string, number>();
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000;

  connect(
    url: string,
    options: {
      onMessage: (data: any) => void;
      onError?: (error: Error) => void;
      onOpen?: () => void;
      onClose?: () => void;
      headers?: Record<string, string>;
    }
  ): () => void {
    const { onMessage, onError, onOpen, onClose, headers = {} } = options;
    
    // Close existing connection if any
    this.disconnect(url);
    
    try {
      // Create new EventSource with auth headers
      const authHeaders = getAuthHeaders();
      const fullUrl = new URL(url);
      
      // Add headers as query params for EventSource (which doesn't support headers directly)
      Object.entries({ ...headers, ...authHeaders }).forEach(([key, value]) => {
        fullUrl.searchParams.set(`_header_${key}`, value);
      });
      
      const eventSource = new EventSource(fullUrl.toString());
      this.connections.set(url, eventSource);
      
      eventSource.onopen = () => {
        log.info('SSE connection opened', 'SSE_MANAGER', { url });
        this.reconnectAttempts.set(url, 0);
        onOpen?.();
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          log.error('SSE message parse error', 'SSE_MANAGER', error);
        }
      };
      
      eventSource.onerror = (event) => {
        log.error('SSE connection error', 'SSE_MANAGER', { url, event });
        onError?.(new Error('SSE connection error'));
        
        // Handle reconnection
        this.handleReconnect(url, options);
      };
      
      // Return cleanup function
      return () => {
        this.disconnect(url);
        onClose?.();
      };
    } catch (error) {
      log.error('SSE connection failed', 'SSE_MANAGER', error);
      onError?.(error as Error);
      return () => {};
    }
  }
  
  private handleReconnect(
    url: string,
    options: {
      onMessage: (data: any) => void;
      onError?: (error: Error) => void;
      onOpen?: () => void;
      onClose?: () => void;
      headers?: Record<string, string>;
    }
  ) {
    const attempts = this.reconnectAttempts.get(url) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      log.error('Max reconnection attempts reached', 'SSE_MANAGER', { url, attempts });
      this.disconnect(url);
      return;
    }
    
    const delay = this.baseReconnectDelay * Math.pow(2, attempts);
    log.info('Scheduling SSE reconnection', 'SSE_MANAGER', { url, attempts, delay });
    
    const timeout = setTimeout(() => {
      this.reconnectAttempts.set(url, attempts + 1);
      this.connect(url, options);
    }, delay);
    
    this.reconnectTimeouts.set(url, timeout);
  }
  
  disconnect(url: string) {
    // Clear reconnection timeout
    const timeout = this.reconnectTimeouts.get(url);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(url);
    }
    
    // Close EventSource connection
    const connection = this.connections.get(url);
    if (connection) {
      connection.close();
      this.connections.delete(url);
    }
    
    // Reset attempts
    this.reconnectAttempts.delete(url);
  }
  
  disconnectAll() {
    for (const url of this.connections.keys()) {
      this.disconnect(url);
    }
  }
}

// Global SSE manager instance
const sseManager = new SSESubscriptionManager();

interface TRPCProviderProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export function TRPCProvider({ children, queryClient: providedQueryClient }: TRPCProviderProps) {
  const [queryClient] = useState(() => providedQueryClient || createQueryClient());
  const [trpcClient, setTrpcClient] = useState(() => createTRPCClient());
  
  function createTRPCClient() {
    const apiUrl = getApiUrl();
    log.info('Creating tRPC SSE client', 'TRPC_SSE', { apiUrl });
    
    return api.createClient({
      transformer,
      links: [
        splitLink({
          // Use SSE for subscriptions
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url: `${apiUrl}/trpc`,
            connectionParams: async () => {
              return {
                headers: getAuthHeaders(),
              };
            },
            // Custom EventSource implementation
            eventSourceOptions: {
              // SSE doesn't support headers directly, so we handle auth via query params
              // This is handled in the SSESubscriptionManager
            },
          }),
          // Use batch link for queries and mutations
          false: httpBatchLink({
            url: `${apiUrl}/trpc`,
            headers: () => getAuthHeaders(),
            fetch: async (url, options) => {
              const startTime = Date.now();
              
              try {
                const response = await fetch(url, {
                  ...options,
                  credentials: 'include',
                });
                
                const duration = Date.now() - startTime;
                log.api.response('tRPC request completed', {
                  url: url.toString(),
                  status: response.status,
                  duration,
                });
                
                return response;
              } catch (error) {
                const duration = Date.now() - startTime;
                log.api.error('tRPC request failed', {
                  url: url.toString(),
                  duration,
                  error,
                });
                throw error;
              }
            },
          }),
        }),
      ],
    });
  }
  
  // Recreate client when auth state changes
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      if (state.sessionToken !== prevState.sessionToken) {
        log.info('Auth state changed, recreating tRPC client', 'TRPC_SSE');
        setTrpcClient(createTRPCClient());
        
        // Clear query cache on logout
        if (!state.sessionToken && prevState.sessionToken) {
          queryClient.clear();
        }
      }
    });
    
    return () => {
      unsubscribe();
      // Cleanup SSE connections on unmount
      sseManager.disconnectAll();
    };
  }, [queryClient]);
  
  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </api.Provider>
  );
}

// Helper hooks for subscription management
export function useSubscription<
  TPath extends keyof RouterOutputs,
  TOutput = RouterOutputs[TPath]
>(
  path: TPath,
  options?: {
    enabled?: boolean;
    onData?: (data: TOutput) => void;
    onError?: (error: Error) => void;
  }
) {
  const [data, setData] = useState<TOutput | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!options?.enabled) return;
    
    const apiUrl = getAPIUrl();
    const subscriptionUrl = `${apiUrl}/trpc/${String(path)}`;
    
    const cleanup = sseManager.connect(subscriptionUrl, {
      onOpen: () => {
        setIsConnected(true);
        setError(undefined);
      },
      onMessage: (data) => {
        setData(data as TOutput);
        options?.onData?.(data as TOutput);
      },
      onError: (err) => {
        setError(err);
        setIsConnected(false);
        options?.onError?.(err);
      },
      onClose: () => {
        setIsConnected(false);
      },
    });
    
    return cleanup;
  }, [path, options?.enabled]);
  
  return {
    data,
    error,
    isConnected,
  };
}

// Helper to invalidate queries related to subscriptions
export function useInvalidateOnSubscription<
  TPath extends keyof RouterOutputs
>(
  subscriptionPath: TPath,
  queryPaths: string[],
  options?: { enabled?: boolean }
) {
  const queryClient = api.useUtils();
  
  useSubscription(subscriptionPath, {
    enabled: options?.enabled ?? true,
    onData: () => {
      // Invalidate related queries when subscription data arrives
      queryPaths.forEach((path) => {
        const parts = path.split('.');
        let current: any = queryClient;
        for (const part of parts) {
          current = current[part];
        }
        current?.invalidate?.();
      });
    },
  });
}

// Export everything needed
export {
  getQueryKey,
  type TRPCClientError,
};

// Re-export subscription status helper
export function useSubscriptionStatus() {
  return {
    manager: sseManager,
    disconnectAll: () => sseManager.disconnectAll(),
  };
}