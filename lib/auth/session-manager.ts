/**
 * Unified Session Management for Mobile and Web
 * Handles token storage, retrieval, and session validation
 */

import { Platform } from 'react-native';
import { mobileStorage, webStorage } from '../core/secure-storage';
import { mobileTokenStore } from './mobile-token-store';
import { log } from '../core/logger';
import type { Session, User } from 'better-auth/types';

// Token storage keys
const TOKEN_KEYS = {
  SESSION_TOKEN: 'better-auth_session-token',
  COOKIE: 'better-auth_cookie',
  BEARER_TOKEN: 'bearer_token',
  SESSION_DATA: 'better-auth_session_data',
  USER_DATA: 'better-auth_user_data',
} as const;

export const sessionManager = {
  /**
   * Store token for mobile platforms
   * Used after successful login to ensure token is available for API calls
   */
  async storeMobileToken(token: string): Promise<void> {
    if (Platform.OS === 'web' || !token) {
      return;
    }

    try {
      log.auth.debug('Storing mobile token', { tokenPreview: token.substring(0, 20) + '...' });
      
      // Store in memory for immediate access
      mobileTokenStore.setToken(token);
      
      // Store in secure storage with multiple keys for compatibility
      mobileStorage.setItem(TOKEN_KEYS.SESSION_TOKEN, token);
      mobileStorage.setItem(TOKEN_KEYS.BEARER_TOKEN, token);
      
      // Store as cookie format for Better Auth compatibility
      const cookieValue = `better-auth.session-token=${token}; Path=/; HttpOnly`;
      mobileStorage.setItem(TOKEN_KEYS.COOKIE, cookieValue);
      
      // Debug: Verify storage
      log.debug('Token stored, verifying...', 'SESSION_MANAGER', {
        memoryToken: !!mobileTokenStore.getToken(),
        sessionToken: !!mobileStorage.getItem(TOKEN_KEYS.SESSION_TOKEN),
        bearerToken: !!mobileStorage.getItem(TOKEN_KEYS.BEARER_TOKEN),
        cookie: !!mobileStorage.getItem(TOKEN_KEYS.COOKIE),
      });
      
      log.auth.debug('Mobile token stored successfully');
    } catch (error) {
      log.auth.error('Failed to store mobile token', error);
      throw error;
    }
  },

  /**
   * Get token for API requests
   * Checks multiple sources to ensure token is found
   */
  getMobileToken(): string | null {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      // Check memory store first (fastest)
      const memoryToken = mobileTokenStore.getToken();
      if (memoryToken) {
        log.auth.debug('Token found in memory store');
        return memoryToken;
      }
      
      // Debug: Log what's in storage
      log.debug('Checking token storage...', 'SESSION_MANAGER', {
        hasSessionToken: !!mobileStorage.getItem(TOKEN_KEYS.SESSION_TOKEN),
        hasBearerToken: !!mobileStorage.getItem(TOKEN_KEYS.BEARER_TOKEN),
        hasCookie: !!mobileStorage.getItem(TOKEN_KEYS.COOKIE),
      });

      // Check direct token storage
      const directToken = mobileStorage.getItem(TOKEN_KEYS.SESSION_TOKEN) || 
                         mobileStorage.getItem(TOKEN_KEYS.BEARER_TOKEN);
      if (directToken && directToken.includes('.')) {
        log.auth.debug('Token found in direct storage');
        mobileTokenStore.setToken(directToken); // Cache in memory
        return directToken;
      }

      // Check cookie format
      const cookieValue = mobileStorage.getItem(TOKEN_KEYS.COOKIE);
      if (cookieValue) {
        const match = cookieValue.match(/better-auth\.session-token=([^;]+)/);
        if (match && match[1]) {
          log.auth.debug('Token extracted from cookie');
          const token = match[1];
          mobileTokenStore.setToken(token); // Cache in memory
          return token;
        }
      }

      log.auth.debug('No token found in any storage location');
      return null;
    } catch (error) {
      log.auth.error('Failed to get mobile token', error);
      return null;
    }
  },

  /**
   * Get session token for any platform
   */
  getSessionToken(): string | null {
    if (Platform.OS === 'web') {
      return webStorage.getItem(TOKEN_KEYS.SESSION_TOKEN);
    }
    return this.getMobileToken();
  },

  /**
   * Store session data
   */
  async storeSession(session: Partial<Session> | { token: string; userId: string }): Promise<boolean> {
    const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
    
    try {
      if ('token' in session && session.token) {
        if (Platform.OS !== 'web') {
          await this.storeMobileToken(session.token);
        } else {
          storage.setItem(TOKEN_KEYS.SESSION_TOKEN, session.token);
        }
      }
      storage.setItem(TOKEN_KEYS.SESSION_DATA, JSON.stringify(session));
      return true;
    } catch (error) {
      log.error('Failed to store session', 'SESSION_MANAGER', error);
      return false;
    }
  },

  /**
   * Clear all session data
   */
  async clearSession(): Promise<boolean> {
    const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
    
    try {
      // Clear memory store
      if (Platform.OS !== 'web') {
        mobileTokenStore.clear();
      }

      // Clear all storage keys
      Object.values(TOKEN_KEYS).forEach(key => {
        storage.removeItem(key);
      });

      // Clear legacy keys
      storage.removeItem('better-auth.session-token');
      storage.removeItem('better-auth.cookie');
      
      log.auth.debug('Session cleared successfully');
      return true;
    } catch (error) {
      log.error('Failed to clear session', 'SESSION_MANAGER', error);
      return false;
    }
  },

  /**
   * Debug token storage
   */
  debugTokenStorage(): void {
    if (Platform.OS === 'web') {
      return;
    }

    const debug = {
      memoryToken: !!mobileTokenStore.getToken(),
      sessionToken: !!mobileStorage.getItem(TOKEN_KEYS.SESSION_TOKEN),
      bearerToken: !!mobileStorage.getItem(TOKEN_KEYS.BEARER_TOKEN),
      cookieToken: !!mobileStorage.getItem(TOKEN_KEYS.COOKIE),
    };

    log.auth.debug('Token storage status', debug);
  }
};