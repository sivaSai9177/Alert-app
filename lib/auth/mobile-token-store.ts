import { Platform } from 'react-native';
import { log } from '@/lib/core/logger';

/**
 * Simple in-memory token store for mobile platforms
 * Provides fast access to session tokens without async storage calls
 */
class MobileTokenStore {
  private token: string | null = null;

  setToken(token: string | null) {
    if (Platform.OS !== 'web') {
      this.token = token;
      log.debug('Token updated', 'TOKEN_STORE', { 
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null' 
      });
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clear() {
    this.token = null;
  }
}

export const mobileTokenStore = new MobileTokenStore();