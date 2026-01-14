// hooks/useAuth.tsx
// Pure Zustand implementation - no React Context anti-pattern
import React from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

export { 
  useAuth, 
  useAuthGuard,
  useAuthStore,
  // Legacy exports for backward compatibility
  useUser,
  useSession,
  useIsAuthenticated,
  useAuthLoading
} from '@/lib/stores/auth-store';

// Re-export types that components might need
export type { AppUser, LoginCredentials } from '@/lib/stores/auth-store';

// Legacy method for tests
export const useAuthWithLegacy = () => {
  const auth = useAuthStore();
  return {
    ...auth,
    refreshUser: auth.checkSession, // Map to existing method
  };
};

// Legacy compatibility hooks for tests
export const useRequireAuth = () => {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  return {
    isAuthenticated: isAuthenticated && hasHydrated,
    isLoading: !hasHydrated,
  };
};

export const useRequireRole = (requiredRole: string) => {
  const { hasRole, hasHydrated } = useAuthStore();
  return {
    hasRole: hasHydrated ? hasRole(requiredRole) : false,
    isLoading: !hasHydrated,
  };
};

// Mock AuthProvider for tests (Zustand doesn't need a provider)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};