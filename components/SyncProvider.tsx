import React, { useEffect } from 'react';
import { api } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { log } from '@/lib/core/logger';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { updateAuth, clearAuth } = useAuth();
  
  // Keep auth state synchronized between server and client using TanStack Query
  const { data, error } = api.auth.getSession.useQuery(undefined, {
    // Poll every 5 minutes (reduced frequency to minimize rerenders)
    refetchInterval: 5 * 60 * 1000,
    
    // Refetch on app focus
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    
    // Consider data fresh for 10 minutes
    staleTime: 10 * 60 * 1000,
    
    // Keep in cache for 30 minutes
    gcTime: 30 * 60 * 1000,
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  });
  
  // Handle state updates with useEffect (TanStack Query v5 pattern)
  useEffect(() => {
    if (data) {
      updateAuth((data as any).user, (data as any).session);
    } else if (data === null) {
      clearAuth();
    }
  }, [data, updateAuth, clearAuth]);
  
  // Handle auth errors
  useEffect(() => {
    if (error?.data?.httpStatus === 401) {
      clearAuth();
      log.auth.error('Auth error, clearing session', error);
    }
  }, [error, clearAuth]);
  
  return <>{children}</>;
}