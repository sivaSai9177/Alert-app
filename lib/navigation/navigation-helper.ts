import { router } from 'expo-router';
import { log } from '@/lib/core/logger';
import type { AppUser } from '@/lib/stores/auth-store';

/**
 * Navigation helper for consistent routing logic
 */
export const NavigationHelper = {
  /**
   * Navigate based on authentication state
   */
  navigateBasedOnAuth(isAuthenticated: boolean, user: AppUser | null) {
    log.info('NavigationHelper: Evaluating navigation', 'NAV_HELPER', {
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      needsProfileCompletion: user?.needsProfileCompletion,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A'
    });

    if (!isAuthenticated || !user) {
      log.info('NavigationHelper: Not authenticated, going to login', 'NAV_HELPER');
      router.replace('/(auth)/login');
      return;
    }

    if (user.needsProfileCompletion || user.role === 'guest') {
      log.info('NavigationHelper: Profile completion needed', 'NAV_HELPER');
      router.replace('/(auth)/complete-profile');
      return;
    }

    log.info('NavigationHelper: Authenticated with complete profile, going to home', 'NAV_HELPER');
    router.replace('/(home)');
  },

  /**
   * Navigate after successful login
   */
  navigateAfterLogin(user: AppUser) {
    log.info('NavigationHelper: Post-login navigation', 'NAV_HELPER', {
      userId: user.id,
      role: user.role,
      needsProfileCompletion: user.needsProfileCompletion
    });

    if (user.needsProfileCompletion || user.role === 'guest') {
      router.replace('/(auth)/complete-profile');
    } else {
      router.replace('/(home)');
    }
  },

  /**
   * Navigate after profile completion
   */
  navigateAfterProfileComplete() {
    log.info('NavigationHelper: Profile completed, going to home', 'NAV_HELPER');
    router.replace('/(home)');
  },

  /**
   * Navigate to login with optional return path
   */
  navigateToLogin(returnPath?: string) {
    log.info('NavigationHelper: Going to login', 'NAV_HELPER', { returnPath });
    if (returnPath) {
      router.replace(`/(auth)/login?returnTo=${encodeURIComponent(returnPath)}`);
    } else {
      router.replace('/(auth)/login');
    }
  },

  /**
   * Check if current path is authentication related
   */
  isAuthPath(pathname: string): boolean {
    return pathname.includes('/auth/') || 
           pathname.includes('/login') || 
           pathname.includes('/signup') ||
           pathname.includes('/auth-callback');
  },

  /**
   * Force navigation refresh (useful after OAuth)
   */
  forceNavigationRefresh() {
    log.info('NavigationHelper: Forcing navigation refresh', 'NAV_HELPER');
    
    // For web, we can use window.location
    if (typeof window !== 'undefined') {
      // Remove any hash fragments that might interfere
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      
      // If we're at root, force a small delay then navigate
      if (window.location.pathname === '/') {
        setTimeout(() => {
          router.replace('/');
        }, 100);
      }
    }
  }
};