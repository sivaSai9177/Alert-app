import { Platform } from 'react-native';
import { webStorage, mobileStorage } from '../core/secure-storage';
import { Session, User } from 'better-auth/types';

// Use underscore notation for consistency with existing storage
const SESSION_TOKEN_KEY = 'better-auth_session-token';
const SESSION_DATA_KEY = 'better-auth_session_data';
const USER_DATA_KEY = 'better-auth_user_data';

export const sessionManager = {
  // Get session token for API requests (simplified)
  getSessionToken() {
    const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
    
    if (Platform.OS !== 'web') {
      // Debug: Check all possible keys where token might be stored
      const possibleKeys = [
        'better-auth_session-token',
        'better-auth.session-token',
        'better-auth_cookie',
        'better-auth.cookie',
        'session-token',
        'auth-token'
      ];
      
      let foundToken = null;
      for (const key of possibleKeys) {
        const value = storage.getItem(key);
        if (value) {
          
          // Check if it's a cookie format and extract token
          if (key.includes('cookie')) {
            // The Better Auth Expo plugin stores the entire cookie string
            // We need to parse it correctly
            
            // Format 1: Full cookie string with multiple cookies
            // Example: "better-auth.session-token=xyz123; Path=/; HttpOnly"
            const sessionTokenMatch = value.match(/better-auth\.session-token=([^;\s]+)/);
            if (sessionTokenMatch) {
              foundToken = sessionTokenMatch[1];
              break;
            }
            
            // Format 2: Just the session token part
            // Example: "better-auth.session-token=xyz123"
            if (value.startsWith('better-auth.session-token=')) {
              foundToken = value.split('=')[1].split(';')[0].trim();
              break;
            }
            
            // Format 3: Raw token (no cookie format)
            // If it's a valid JWT-like token (has dots)
            if (value.includes('.') && !value.includes('=') && !value.includes(';')) {
              foundToken = value.trim();
              break;
            }
            
            // Format 4: JSON stringified
            try {
              const parsed = JSON.parse(value);
              if (typeof parsed === 'string' && parsed.includes('.')) {
                foundToken = parsed;
                break;
              } else if (parsed.token || parsed.sessionToken || parsed['better-auth.session-token']) {
                foundToken = parsed.token || parsed.sessionToken || parsed['better-auth.session-token'];
                break;
              }
            } catch (e) {
              // Not JSON, continue
            }
          } else {
            // Direct token storage (not in cookie key)
            if (value.includes('.')) { // Likely a JWT token
              foundToken = value.trim();
              break;
            }
          }
        }
      }
      
      // If no token found in known keys, check if there's a session stored
      if (!foundToken) {
        const sessionData = storage.getItem(SESSION_DATA_KEY);
        if (sessionData) {
          try {
            const parsed = JSON.parse(sessionData);
            if (parsed.token) {
              foundToken = parsed.token;
            }
          } catch (e) {
            // Not valid JSON
          }
        }
      }
      
      return foundToken;
    }
    
    // Web uses standard key
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
      // Also clear old keys for backward compatibility
      storage.removeItem('better-auth_cookie');
      storage.removeItem('better-auth.session-token');
      storage.removeItem('better-auth.session_data');
      storage.removeItem('better-auth.user_data');
      storage.removeItem('better-auth.cookie');
      return true;
    } catch (error) {
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
  },
  
  // Debug helper to check all storage locations
  async debugTokenStorage() {
    const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
    const debug: any = {
      platform: Platform.OS,
      tokens: {},
      rawValues: {}
    };
    
    const keysToCheck = [
      'better-auth_cookie',
      'better-auth.cookie', 
      'better-auth_session-token',
      'better-auth.session-token',
      'better-auth_session_data',
      'better-auth.session_data',
      'better-auth_user_data',
      'better-auth.user_data'
    ];
    
    for (const key of keysToCheck) {
      const value = storage.getItem(key);
      if (value) {
        debug.rawValues[key] = value.substring(0, 100) + (value.length > 100 ? '...' : '');
        
        // Try to extract token
        if (key.includes('cookie')) {
          const match = value.match(/better-auth\.session-token=([^;\s]+)/);
          if (match) {
            debug.tokens[`${key}_extracted`] = match[1].substring(0, 20) + '...';
          }
        } else if (value.includes('.')) {
          debug.tokens[key] = value.substring(0, 20) + '...';
        }
      }
    }
    
    return debug;
  }
};