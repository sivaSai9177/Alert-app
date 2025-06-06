import { router } from 'expo-router';
import { log } from '@/lib/core/logger';

export const navigation = {
  // Navigate to a route
  navigate: (href: string) => {
    log.debug('Navigating to', 'NAVIGATION', { href });
    router.push(href as any);
  },

  // Replace current route
  replace: (href: string) => {
    log.debug('Replacing route with', 'NAVIGATION', { href });
    router.replace(href as any);
  },

  // Go back
  back: () => {
    log.debug('Going back', 'NAVIGATION');
    router.back();
  },

  // Check if can go back
  canGoBack: () => {
    return router.canGoBack();
  },

  // Auth routes
  toLogin: () => navigation.replace('/(auth)/login'),
  toSignup: () => navigation.replace('/(auth)/signup'),
  toCompleteProfile: () => navigation.replace('/(auth)/complete-profile'),
  toForgotPassword: () => navigation.navigate('/(auth)/forgot-password'),

  // App routes
  toHome: () => navigation.replace('/(home)'),
  toExplore: () => navigation.navigate('/(home)/explore'),
  toSettings: () => navigation.navigate('/(home)/settings'),
  toAdmin: () => navigation.navigate('/(home)/admin'),
  toManager: () => navigation.navigate('/(home)/manager'),

  // Profile routes
  toProfile: () => navigation.navigate('/profile'),
  
  // Dynamic navigation based on auth state
  navigateAfterAuth: (user: { role: string; needsProfileCompletion?: boolean }) => {
    if (user.needsProfileCompletion || user.role === 'guest') {
      navigation.toCompleteProfile();
    } else {
      navigation.toHome();
    }
  },

  // Navigate after logout
  navigateAfterLogout: () => {
    navigation.toLogin();
  },
};