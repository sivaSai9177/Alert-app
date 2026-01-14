import React, { useEffect } from 'react';
import { api } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { log } from '@/lib/core/logger';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { updateAuth, clearAuth, hasHydrated, isAuthenticated } = useAuth();
  
  // Keep auth state synchronized between server and client using TanStack Query
  const { data, error } = api.auth.getSession.useQuery(undefined, {
    // Only enable the query after hydration and when authenticated
    // This prevents unnecessary calls when user is logged out
    enabled: hasHydrated && isAuthenticated,
    
    // Don't retry too many times on mobile to prevent blocking
    retry: 1,
    
    // Poll every 10 minutes (increased to reduce server load)
    refetchInterval: 10 * 60 * 1000,
    
    // Disable aggressive refetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    
    // Consider data fresh for 30 minutes
    staleTime: 30 * 60 * 1000,
    
    // Keep in cache for 60 minutes
    gcTime: 60 * 60 * 1000,
  });
  
  // Handle state updates with useEffect (TanStack Query v5 pattern)
  useEffect(() => {
    // Only update if we have actual data
    if (data && (data as any).user) {
      updateAuth((data as any).user, (data as any).session);
    }
    // Don't clear auth just because the query returned null
    // Let the error handler deal with actual auth failures
  }, [data, updateAuth]);
  
  // Handle auth errors
  useEffect(() => {
    if (error?.data?.httpStatus === 401) {
      clearAuth();
      log.auth.error('Auth error, clearing session', error);
    }
  }, [error, clearAuth]);
  
  return <>{children}</>;
}