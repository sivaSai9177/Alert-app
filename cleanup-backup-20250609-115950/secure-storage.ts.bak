import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Better Auth storage interface for web
export const webStorage = {
  getItem: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item;
    } catch (error) {
      console.error('[WEB STORAGE] Error getting item:', error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('[WEB STORAGE] Error setting item:', error);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[WEB STORAGE] Error removing item:', error);
    }
  },
};

// Initialize storage by loading session data from SecureStore
let storageInitialized = false;
let storageInitPromise: Promise<void> | null = null;

export const waitForStorageInit = async () => {
  if (storageInitialized) return;
  if (storageInitPromise) return storageInitPromise;
  
  storageInitPromise = initializeSecureStorage();
  await storageInitPromise;
};

export const initializeSecureStorage = async () => {
  if (storageInitialized || Platform.OS === 'web') return;
  
  try {
// TODO: Replace with structured logging - console.log('[MOBILE STORAGE] Initializing storage...');
    
    // Initialize the persistent store
    if (!(global as any).__persistentStore) {
      (global as any).__persistentStore = {};
    }
    
    // Load all better-auth related keys from SecureStore
    // Note: Better Auth expo plugin uses underscore notation by default
    const keys = [
      'better-auth_cookie', 
      'better-auth_session_data',
      'better-auth_session-token',
      'better-auth_user_data',
      // Also check for dot notation keys
      'better-auth.cookie', 
      'better-auth.session_data',
      'better-auth.session-token',
      'better-auth.user_data'
    ];
    const loadPromises = keys.map(async (key) => {
      try {
        const value = await SecureStore.getItemAsync(key);
        if (value) {
          (global as any).__persistentStore[key] = value;
// TODO: Replace with structured logging - console.log(`[MOBILE STORAGE] Loaded ${key} from SecureStore`);
        }
      } catch (error) {
        console.error(`[MOBILE STORAGE] Failed to load ${key}:`, error);
      }
    });
    
    await Promise.all(loadPromises);
    storageInitialized = true;
// TODO: Replace with structured logging - console.log('[MOBILE STORAGE] Storage initialization complete');
  } catch (error) {
    console.error('[MOBILE STORAGE] Storage initialization failed:', error);
  }
};

// Keep internal reference for backward compatibility
const initializeStorage = initializeSecureStorage;

// Initialize storage immediately
if (Platform.OS !== 'web') {
  initializeStorage();
}

// Better Auth storage interface for mobile with persistent storage
export const mobileStorage = {
  getItem: (key: string) => {
    try {
      // Ensure storage is initialized
      if (!storageInitialized) {
// TODO: Replace with structured logging - console.log('[MOBILE STORAGE] Storage not initialized, starting initialization...');
        initializeStorage(); // Start initialization if not done
      }
      
      const persistentStore = (global as any).__persistentStore || {};
      const value = persistentStore[key] || null;
      
      if (value) {
// TODO: Replace with structured logging - console.log(`[MOBILE STORAGE] Retrieved ${key}:`, value.substring(0, 50) + '...');
      }
      
      return value;
    } catch (error) {
      console.error('[MOBILE STORAGE] Error getting item:', error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      // Initialize persistent storage if it doesn't exist
      if (!(global as any).__persistentStore) {
        (global as any).__persistentStore = {};
      }
      
      // Store in persistent memory store immediately
      const persistentStore = (global as any).__persistentStore;
      persistentStore[key] = value;
      
      // Also store in SecureStore asynchronously for actual persistence
      SecureStore.setItemAsync(key, value).catch(error => {
        console.error(`[MOBILE STORAGE] Failed to store ${key} in SecureStore:`, error);
      });
    } catch (error) {
      console.error('[MOBILE STORAGE] Error setting item:', error);
    }
  },
  removeItem: (key: string) => {
    try {
      // Remove from persistent memory store
      if ((global as any).__persistentStore) {
        delete (global as any).__persistentStore[key];
      }
      
      // Also remove from SecureStore asynchronously
      SecureStore.deleteItemAsync(key).catch(error => {
        console.error(`[MOBILE STORAGE] Failed to remove ${key} from SecureStore:`, error);
      });
    } catch (error) {
      console.error('[MOBILE STORAGE] Error removing item:', error);
    }
  },
};

// Cross-platform secure storage wrapper
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      return localStorage.getItem(key);
    }
    // Use SecureStore for mobile
    return await SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      localStorage.setItem(key, value);
    } else {
      // Use SecureStore for mobile
      await SecureStore.setItemAsync(key, value);
    }
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      localStorage.removeItem(key);
    } else {
      // Use SecureStore for mobile
      await SecureStore.deleteItemAsync(key);
    }
  },

  // Synchronous methods for Better Auth
  getItemSync(key: string): string | null {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    // SecureStore doesn't have sync methods, so we'll return null
    // This is a limitation on mobile - need to use async storage
    console.warn('Sync storage not available on mobile, use async methods');
    return null;
  },

  setItemSync(key: string, value: string): void {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      console.warn('Sync storage not available on mobile, use async methods');
    }
  },

  deleteItemSync(key: string): void {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      console.warn('Sync storage not available on mobile, use async methods');
    }
  }
};