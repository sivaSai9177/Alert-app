import { Platform } from 'react-native';
import { webStorage, mobileStorage } from '../core/secure-storage';
import { Session, User } from 'better-auth/types';

const SESSION_TOKEN_KEY = 'better-auth.session-token';
const SESSION_DATA_KEY = 'better-auth.session_data';
const USER_DATA_KEY = 'better-auth.user_data';

export const sessionManager = {
  // Get session token for API requests (simplified)
  getSessionToken() {
    const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
    return storage.getItem(SESSION_TOKEN_KEY);
  },
  
  // Store session data
  async storeSession(session: Partial<Session> | { token: string; userId: string }) {
    const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
    
    try {
      if ('token' in session && session.token) {
        storage.setItem(SESSION_TOKEN_KEY, session.token);
      }
      storage.setItem(SESSION_DATA_KEY, JSON.stringify(session));
      return true;
    } catch (error) {
      console.error('[SESSION MANAGER] Failed to store session:', error);
      return false;
    }
  },
  
  // Get cached session data
  async getCachedSession(): Promise<{ session: any | null; user: User | null }> {
    const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
    
    try {
      const sessionData = storage.getItem(SESSION_DATA_KEY);
      const userData = storage.getItem(USER_DATA_KEY);
      
      return {
        session: sessionData ? JSON.parse(sessionData) : null,
        user: userData ? JSON.parse(userData) : null,
      };
    } catch (error) {
      console.error('[SESSION MANAGER] Failed to get cached session:', error);
      return { session: null, user: null };
    }
  },
  
  // Store user data alongside session
  async storeUserData(user: User) {
    const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
    
    try {
      storage.setItem(USER_DATA_KEY, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('[SESSION MANAGER] Failed to store user data:', error);
      return false;
    }
  },
  
  // Clear session (used by signOut)
  async clearSession() {
    const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
    
    try {
      storage.removeItem(SESSION_TOKEN_KEY);
      storage.removeItem(SESSION_DATA_KEY);
      storage.removeItem(USER_DATA_KEY);
      storage.removeItem('better-auth_cookie');
      storage.removeItem('better-auth_session_data');
      return true;
    } catch (error) {
      console.error('[SESSION MANAGER] Failed to clear session:', error);
      return false;
    }
  },
  
  // Add session token to request headers
  addAuthHeaders(headers: Record<string, string> = {}) {
    const token = this.getSessionToken();
    
    if (token) {
      return {
        ...headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    
    return headers;
  }
};