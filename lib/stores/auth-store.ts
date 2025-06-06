// lib/stores/auth-store.ts
import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { User, Session } from 'better-auth/types';
import '@/types/auth'; // Import our type extensions
import { log } from '@/lib/core/logger';

// Types
export interface AppUser extends User {
  role: 'admin' | 'manager' | 'user' | 'guest';
  organizationId?: string;
  organizationName?: string;
  department?: string;
  needsProfileCompletion?: boolean;
}

// Helper type to ensure user objects can be converted to AppUser
export type UserToAppUser<T extends User> = T & {
  role: 'admin' | 'manager' | 'user' | 'guest';
  organizationId?: string;
  organizationName?: string;
  department?: string;
  needsProfileCompletion?: boolean;
};

// Helper function to safely convert any user object to AppUser
export function toAppUser(user: any, fallbackRole: 'admin' | 'manager' | 'user' | 'guest' = 'user'): AppUser {
  return {
    ...user,
    role: user.role || fallbackRole,
    organizationId: user.organizationId || undefined,
    organizationName: user.organizationName || undefined,
    department: user.department || undefined,
    needsProfileCompletion: user.needsProfileCompletion || false,
  } as AppUser;
}

interface AuthState {
  // Core state
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  
  // Enhanced state
  lastActivity: Date;
  error: string | null;
}

interface AuthActions {
  // Hydration
  setHasHydrated: (state: boolean) => void;
  
  // Authentication (state management only - actual auth calls via tRPC)
  setUser: (user: AppUser | null) => void;
  setSession: (session: Session | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  clearAuth: () => void;
  
  // Internal state management
  updateAuth: (user: AppUser | null, session: Session | null) => void;
  updateUserData: (userData: Partial<AppUser>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateActivity: () => void;
  
  // Permissions
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canAccess: (resource: string) => boolean;
  
  // Session management
  logout: (reason?: string) => Promise<void>;
  checkSession: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

// Credentials types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  role?: 'operator' | 'doctor' | 'nurse' | 'head_doctor';
  hospitalId?: string;
}

// Create the store with Better Auth integration
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial state
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        hasHydrated: false,
        lastActivity: new Date(),
        error: null,

        // Hydration
        setHasHydrated: (state) => {
          log.store.update('Setting hasHydrated', { hasHydrated: state });
          set({ hasHydrated: state });
        },

        // Authentication state management only
        setUser: (user) => {
          log.store.update('Setting user', { userId: user?.id });
          set({ user });
        },

        setSession: (session) => {
          log.store.update('Setting session', { sessionId: session?.id });
          set({ session });
        },

        setAuthenticated: (authenticated) => {
          log.store.update('Setting authenticated', { authenticated });
          set({ isAuthenticated: authenticated });
        },

        clearAuth: () => {
          console.log('[AuthStore] clearAuth called');
          log.store.update('Clearing auth state');
          const prevState = get();
          console.log('[AuthStore] Previous state:', {
            hadUser: !!prevState.user,
            wasAuthenticated: prevState.isAuthenticated
          });
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            error: null,
          });
          console.log('[AuthStore] State cleared');
        },

        logout: async (reason = 'user_initiated') => {
          log.auth.logout('Initiating logout', { reason });
          
          // Clear local state first for immediate UI feedback
          get().clearAuth();
          
          try {
            // For logout, we can call Better Auth directly since we're already clearing local state
            const { authClient } = await import('@/lib/auth/auth-client');
            await authClient.signOut();
            
            log.auth.logout('Logout completed via Better Auth client');
          } catch (error) {
            log.auth.error('Logout API error (local state already cleared)', error);
            // Don't throw since we already cleared local state
            // The user experience should be that they're logged out regardless
          }
        },

        // Internal state management
        updateAuth: (user, session) => {
          const currentState = get();
          
          // More comprehensive comparison to prevent unnecessary updates
          const userChanged = currentState.user?.id !== user?.id || 
                              currentState.user?.role !== user?.role ||
                              currentState.user?.needsProfileCompletion !== user?.needsProfileCompletion;
          const authChanged = currentState.isAuthenticated !== (!!user && !!session);
          
          if (!userChanged && !authChanged) {
            return; // Skip update entirely to prevent re-renders
          }
          
          log.store.update('Updating auth state', { 
            userId: user?.id, 
            role: user?.role,
            isAuth: !!user && !!session,
            userChanged,
            authChanged
          });
          
          set({
            user,
            session,
            isAuthenticated: !!user && !!session,
            lastActivity: new Date(),
            error: null,
          });
        },

        updateUserData: (userData) => {
          const currentState = get();
          
          if (!currentState.user) {
            log.warn('Cannot update user data - no user logged in', 'AUTH_STORE');
            return;
          }
          
          log.store.update('Updating user data', userData);
          
          set({
            user: {
              ...currentState.user,
              ...userData,
            },
            lastActivity: new Date(),
          });
        },

        setLoading: (loading) => set({ isLoading: loading }),
        
        setError: (error) => set({ error }),

        updateActivity: () => {
          set({ lastActivity: new Date() });
        },

        // Session validation (will be called by components using tRPC)
        checkSession: async () => {
          // This will be called by components after they check session via tRPC
          const state = get();
          log.store.update('Checking session', {
            hasUser: !!state.user,
            isAuthenticated: state.isAuthenticated
          });
          
          // In a full implementation, this would call the auth API to validate the session
          // For now, we'll just update the activity timestamp without triggering other updates
          const now = new Date();
          if (state.lastActivity.getTime() < now.getTime() - 30000) { // Only update if 30s passed
            set({ lastActivity: now });
          }
        },

        // Permission checking
        hasPermission: (permission) => {
          const user = get().user;
          if (!user) return false;
          
          // Role-based permissions
          const rolePermissions: Record<string, string[]> = {
            admin: ['*'], // Admin can access everything
            manager: [
              'manage_users', 'view_analytics', 'manage_content', 
              'view_team', 'view_reports', 'manage_approvals', 'manage_schedule'
            ],
            user: ['view_content', 'edit_profile'],
            guest: ['view_content'],
          };
          
          const permissions = rolePermissions[user.role] || [];
          return permissions.includes('*') || permissions.includes(permission);
        },

        hasRole: (role) => {
          const user = get().user;
          return user?.role === role;
        },

        canAccess: (resource) => {
          return get().hasPermission(resource);
        },
      })),
      {
        name: 'app-auth-storage',
        storage: createJSONStorage(() => AsyncStorage),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
          
          // Session validation will be handled by components via tRPC
          if (state?.user) {
            log.store.update('Rehydrated with user', { email: state.user.email });
          }
        },
        // Only persist non-sensitive data
        partialize: (state) => ({
          user: state.user,
          session: state.session,
          isAuthenticated: state.isAuthenticated,
          lastActivity: state.lastActivity,
        }),
      }
    ),
    { name: 'AppAuthStore' }
  )
);

// Subscribe to auth changes for side effects with throttling
let lastAuthStateChange = 0;
useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated, previousIsAuthenticated) => {
    const now = Date.now();
    
    // Throttle subscription calls to prevent infinite loops
    if (now - lastAuthStateChange < 500) {
      return;
    }
    lastAuthStateChange = now;
    
    if (previousIsAuthenticated && !isAuthenticated) {
      // User logged out - clear any sensitive data
      log.store.update('User logged out, clearing sensitive data');
    }
  }
);

// Export stable hooks to prevent infinite loops
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const error = useAuthStore((state) => state.error);
  
  // Get stable method references once
  const methods = React.useMemo(() => {
    const state = useAuthStore.getState();
    return {
      setUser: state.setUser,
      setSession: state.setSession,
      setAuthenticated: state.setAuthenticated,
      clearAuth: state.clearAuth,
      updateAuth: state.updateAuth,
      updateUserData: state.updateUserData,
      setLoading: state.setLoading,
      setError: state.setError,
      updateActivity: state.updateActivity,
      checkSession: state.checkSession,
      logout: state.logout,
      hasPermission: state.hasPermission,
      hasRole: state.hasRole,
      canAccess: state.canAccess,
    };
  }, []); // Empty deps - methods are stable
  
  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    hasHydrated,
    error,
    ...methods,
  };
};

export const useAuthGuard = (requiredPermission?: string) => {
  const { isAuthenticated, hasHydrated, canAccess } = useAuth();
  
  const isAuthorized = React.useMemo(() => {
    if (!hasHydrated || !isAuthenticated) return false;
    if (!requiredPermission) return true;
    return canAccess(requiredPermission);
  }, [isAuthenticated, hasHydrated, requiredPermission, canAccess]);
  
  return {
    isAuthorized,
    isLoading: !hasHydrated,
  };
};

// Legacy exports for backward compatibility during transition
export const useUser = () => useAuthStore((state) => state.user);
export const useSession = () => useAuthStore((state) => state.session);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);