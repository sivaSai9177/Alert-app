/**
 * Dynamic Auth Client Wrapper
 * Ensures auth requests always use the current environment URL
 */

import { Platform } from 'react-native';
import { getAuthUrl } from '../core/unified-env';
import { log } from '../core/logger';

// Create a proxy for the auth client that intercepts URL construction
export function createDynamicAuthClient(authClient: any) {
  // Store original methods
  const originalSignIn = authClient.signIn;
  const originalSignUp = authClient.signUp;
  const originalGetSession = authClient.getSession;
  
  // Helper to ensure correct URL
  const ensureCorrectUrl = (url: string) => {
    if (Platform.OS === 'ios' && url.includes('localhost')) {
      const correctUrl = getAuthUrl();
      const newUrl = url.replace(/http:\/\/localhost:\d+/, correctUrl);
      log.debug('Corrected auth URL for iOS', 'DYNAMIC_AUTH', { 
        original: url, 
        corrected: newUrl 
      });
      return newUrl;
    }
    return url;
  };
  
  // Override methods to use dynamic URLs
  authClient.signIn = async (options: any) => {
    log.debug('Dynamic signIn called', 'DYNAMIC_AUTH');
    // The fetch interceptor in auth-client.ts will handle URL correction
    return originalSignIn.call(authClient, options);
  };
  
  authClient.signUp = async (options: any) => {
    log.debug('Dynamic signUp called', 'DYNAMIC_AUTH');
    // The fetch interceptor in auth-client.ts will handle URL correction
    return originalSignUp.call(authClient, options);
  };
  
  authClient.getSession = async () => {
    log.debug('Dynamic getSession called', 'DYNAMIC_AUTH');
    // The fetch interceptor in auth-client.ts will handle URL correction
    return originalGetSession.call(authClient);
  };
  
  return authClient;
}