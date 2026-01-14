import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/trpc';
import { log } from '@/lib/core/logger';
import { toAppUser } from '@/lib/stores/auth-store';

export default function AuthCallback() {
  const router = useRouter();
  const { updateAuth, isAuthenticated, user } = useAuth();
  
  // Use tRPC to get session with enhanced error handling
  const { data: sessionData, isLoading, error, refetch } = api.auth.getSession.useQuery(undefined, {
    refetchInterval: false,
    retry: 1,
    staleTime: 0, // Always fetch fresh data in auth callback
    gcTime: 0, // Don't cache in auth callback (gcTime in v5)
  });

  useEffect(() => {
    log.auth.oauth('Processing OAuth callback', { 
      provider: 'google',
      hasSessionData: !!sessionData,
      isLoading,
      hasError: !!error,
      localAuthState: { isAuthenticated, hasUser: !!user },
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
    });
    
    // Force refetch session data for OAuth callbacks to ensure we have latest profile completion status
    if (isAuthenticated && user && !isLoading && !sessionData) {
      log.auth.oauth('User authenticated but no fresh session data, refetching...', {
        userId: user.id,
        userRole: user.role,
        needsProfileCompletion: user.needsProfileCompletion
      });
      refetch();
      return;
    }
    
    // If we already have auth state, check if we can proceed (but prefer fresh session data)
    if (isAuthenticated && user && !isLoading && !sessionData) {
      log.auth.oauth('User already authenticated in auth store (using cached data)', {
        userId: user.id,
        userRole: user.role,
        needsProfileCompletion: user.needsProfileCompletion
      });
      
      // Navigate based on existing user state, but this should be rare now
      if (user.needsProfileCompletion) {
        log.info('Navigating to profile completion (from auth store)', 'AUTH_CALLBACK');
        router.replace('/(auth)/complete-profile');
      } else {
        log.info('Navigating after auth (from auth store)', 'AUTH_CALLBACK', { role: user.role });
        
        // Check for healthcare roles
        const healthcareRoles = ['doctor', 'nurse', 'head_doctor'];
        const operatorRole = ['operator'];
        
        if (user.role && operatorRole.includes(user.role)) {
          router.replace('/(home)/operator-dashboard');
        } else if (user.role && healthcareRoles.includes(user.role)) {
          router.replace('/(home)/healthcare-dashboard');
        } else {
          router.replace('/(home)');
        }
      }
      return;
    }
    
    if (sessionData && (sessionData as any)?.user && (sessionData as any)?.session) {
      const sessionUser = (sessionData as any).user;
      const sessionObj = (sessionData as any).session;
      
      log.auth.oauth('Session data received from tRPC', { 
        userId: sessionUser.id,
        email: sessionUser.email,
        needsProfileCompletion: sessionUser.needsProfileCompletion 
      });
      
      // Update auth store with session data (convert to AppUser)
      const appUser = toAppUser(sessionUser);
      updateAuth(appUser, sessionObj as any);
      
      // Navigate based on profile completion and role using Expo Router
      if (sessionUser.needsProfileCompletion || sessionUser.role === 'guest') {
        log.info('Navigating to profile completion (from tRPC)', 'AUTH_CALLBACK');
        router.replace('/(auth)/complete-profile');
      } else {
        log.info('Navigating after auth (from tRPC)', 'AUTH_CALLBACK', { role: sessionUser.role });
        
        // Check for healthcare roles
        const healthcareRoles = ['doctor', 'nurse', 'head_doctor'];
        const operatorRole = ['operator'];
        
        if (sessionUser.role && operatorRole.includes(sessionUser.role)) {
          router.replace('/(home)/operator-dashboard');
        } else if (sessionUser.role && healthcareRoles.includes(sessionUser.role)) {
          router.replace('/(home)/healthcare-dashboard');
        } else {
          router.replace('/(home)');
        }
      }
    } else if (!isLoading && (!sessionData || error)) {
      log.warn('No session found or error occurred', 'AUTH_CALLBACK', { 
        hasError: !!error,
        errorMessage: error?.message,
        recommendation: 'User needs to complete authentication flow'
      });
      
      // Redirect to login using Expo Router
      log.info('Redirecting to login - no valid session', 'AUTH_CALLBACK');
      router.replace('/(auth)/login');
    }
  }, [sessionData, isLoading, error, updateAuth, router, isAuthenticated, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 20 }}>Processing login...</Text>
    </View>
  );
}