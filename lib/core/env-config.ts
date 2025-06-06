/**
 * Enhanced Environment Configuration System
 * Handles dynamic API URL resolution across different environments
 * Supports: local development, EAS builds, ngrok tunnels, and production
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Environment = 'local' | 'preview' | 'development' | 'staging' | 'production';
export type ApiUrlType = 'localhost' | 'lan' | 'ngrok' | 'production' | 'custom';

interface ApiEndpoint {
  type: ApiUrlType;
  url: string;
  priority: number;
  testPath?: string;
}

interface EnvironmentConfig {
  name: Environment;
  database: {
    type: 'local' | 'neon';
    url: string;
    poolUrl?: string;
    ssl: boolean;
  };
  api: {
    endpoints: ApiEndpoint[];
    timeout: number;
    fallbackEnabled: boolean;
    cacheKey: string;
  };
  features: {
    debug: boolean;
    devTools: boolean;
    hotReload: boolean;
    analytics: boolean;
    errorTracking: boolean;
  };
}

// Cache for working endpoints
const ENDPOINT_CACHE_KEY = 'WORKING_API_ENDPOINT';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get current environment
export function getCurrentEnvironment(): Environment {
  // Check multiple sources for environment
  const env = process.env.EXPO_PUBLIC_ENVIRONMENT || 
              process.env.APP_ENV || 
              process.env.NODE_ENV || 
              'local';
  
  switch (env) {
    case 'local':
    case 'preview':
    case 'development':
    case 'staging':
    case 'production':
      return env as Environment;
    default:
      console.warn(`Unknown environment: ${env}, defaulting to local`);
      return 'local';
  }
}

// Detect if running in EAS build
export function isEASBuild(): boolean {
  return Constants.executionEnvironment === 'storeClient' ||
         Constants.executionEnvironment === 'standalone' ||
         !!process.env.EAS_BUILD;
}

// Get local network IP address
export async function getLocalIPAddress(): Promise<string | null> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    if (networkState.isConnected && networkState.type === Network.NetworkStateType.WIFI) {
      // Try to get IP from Constants first
      const hostUri = Constants.expoConfig?.hostUri || 
                     Constants.manifest2?.extra?.expoGo?.debuggerHost ||
                     (Constants as any).manifest?.debuggerHost;
      
      if (hostUri) {
        const ip = hostUri.split(':')[0];
        return ip;
      }
    }
  } catch (error) {
    console.warn('Failed to get local IP address:', error);
  }
  return null;
}

// Build API endpoints based on environment
async function buildApiEndpoints(env: Environment): Promise<ApiEndpoint[]> {
  const endpoints: ApiEndpoint[] = [];
  
  // Environment-specific endpoint configuration
  if (env === 'production') {
    // Production endpoints
    endpoints.push({
      type: 'production',
      url: process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'https://api.myexpo.com',
      priority: 1,
      testPath: '/api/health'
    });
  } else if (env === 'staging') {
    // Staging endpoints
    endpoints.push({
      type: 'production',
      url: process.env.EXPO_PUBLIC_API_URL_STAGING || 'https://staging-api.myexpo.com',
      priority: 1,
      testPath: '/api/health'
    });
  } else {
    // Development/Local/Preview endpoints
    
    // 1. Custom URL (highest priority if set)
    if (process.env.EXPO_PUBLIC_API_URL) {
      endpoints.push({
        type: 'custom',
        url: process.env.EXPO_PUBLIC_API_URL,
        priority: 1,
        testPath: '/api/health'
      });
    }
    
    // 2. Ngrok URL (for stable testing)
    if (process.env.EXPO_PUBLIC_API_URL_NGROK) {
      endpoints.push({
        type: 'ngrok',
        url: process.env.EXPO_PUBLIC_API_URL_NGROK,
        priority: 2,
        testPath: '/api/health'
      });
    }
    
    // 3. Local network IP (for physical devices)
    const localIP = await getLocalIPAddress();
    if (localIP && Platform.OS !== 'web') {
      endpoints.push({
        type: 'lan',
        url: `http://${localIP}:8081`,
        priority: 3,
        testPath: '/api/health'
      });
      
      // Also try port 3000 (common API port)
      endpoints.push({
        type: 'lan',
        url: `http://${localIP}:3000`,
        priority: 4,
        testPath: '/api/health'
      });
    }
    
    // 4. Localhost (for simulators/web)
    if (Platform.OS === 'web' || Platform.OS === 'ios') {
      endpoints.push({
        type: 'localhost',
        url: process.env.EXPO_PUBLIC_API_URL_LOCAL || 'http://localhost:8081',
        priority: 5,
        testPath: '/api/health'
      });
    }
    
    // 5. Android emulator special IP
    if (Platform.OS === 'android') {
      endpoints.push({
        type: 'localhost',
        url: 'http://10.0.2.2:8081',
        priority: 5,
        testPath: '/api/health'
      });
    }
  }
  
  // Sort by priority
  return endpoints.sort((a, b) => a.priority - b.priority);
}

// Get cached working endpoint
async function getCachedEndpoint(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      const cached = localStorage.getItem(ENDPOINT_CACHE_KEY);
      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return url;
        }
      }
    } catch {}
  } else {
    try {
      const cached = await AsyncStorage.getItem(ENDPOINT_CACHE_KEY);
      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return url;
        }
      }
    } catch {}
  }
  return null;
}

// Cache working endpoint
async function cacheEndpoint(url: string): Promise<void> {
  const data = JSON.stringify({ url, timestamp: Date.now() });
  
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(ENDPOINT_CACHE_KEY, data);
    } catch {}
  } else {
    try {
      await AsyncStorage.setItem(ENDPOINT_CACHE_KEY, data);
    } catch {}
  }
}

// Get environment configuration
export async function getEnvironmentConfig(): Promise<EnvironmentConfig> {
  const env = getCurrentEnvironment();
  const endpoints = await buildApiEndpoints(env);
  
  const configs: Record<Environment, EnvironmentConfig> = {
    local: {
      name: 'local',
      database: {
        type: 'local',
        url: process.env.LOCAL_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/myexpo',
        ssl: false
      },
      api: {
        endpoints,
        timeout: 30000,
        fallbackEnabled: process.env.EXPO_PUBLIC_API_FALLBACK_ENABLED !== 'false',
        cacheKey: `api_endpoint_${env}`
      },
      features: {
        debug: true,
        devTools: true,
        hotReload: true,
        analytics: false,
        errorTracking: false
      }
    },
    
    preview: {
      name: 'preview',
      database: {
        type: 'local',
        url: process.env.PREVIEW_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/myexpo_preview',
        ssl: false
      },
      api: {
        endpoints,
        timeout: 30000,
        fallbackEnabled: process.env.EXPO_PUBLIC_API_FALLBACK_ENABLED !== 'false',
        cacheKey: `api_endpoint_${env}`
      },
      features: {
        debug: true,
        devTools: true,
        hotReload: true,
        analytics: false,
        errorTracking: false
      }
    },
    
    development: {
      name: 'development',
      database: {
        type: 'neon',
        url: process.env.NEON_DATABASE_URL!,
        poolUrl: process.env.NEON_DATABASE_POOL_URL,
        ssl: true
      },
      api: {
        endpoints,
        timeout: 10000,
        fallbackEnabled: true,
        cacheKey: `api_endpoint_${env}`
      },
      features: {
        debug: true,
        devTools: true,
        hotReload: true,
        analytics: false,
        errorTracking: true
      }
    },
    
    staging: {
      name: 'staging',
      database: {
        type: 'neon',
        url: process.env.NEON_DATABASE_URL!,
        poolUrl: process.env.NEON_DATABASE_POOL_URL,
        ssl: true
      },
      api: {
        endpoints,
        timeout: 10000,
        fallbackEnabled: true,
        cacheKey: `api_endpoint_${env}`
      },
      features: {
        debug: false,
        devTools: false,
        hotReload: false,
        analytics: true,
        errorTracking: true
      }
    },
    
    production: {
      name: 'production',
      database: {
        type: 'neon',
        url: process.env.NEON_DATABASE_URL!,
        poolUrl: process.env.NEON_DATABASE_POOL_URL,
        ssl: true
      },
      api: {
        endpoints,
        timeout: 10000,
        fallbackEnabled: false, // Disable fallback in production
        cacheKey: `api_endpoint_${env}`
      },
      features: {
        debug: false,
        devTools: false,
        hotReload: false,
        analytics: true,
        errorTracking: true
      }
    }
  };
  
  return configs[env];
}

// Check if using local database
export function isUsingLocalDatabase(): boolean {
  const env = getCurrentEnvironment();
  return env === 'local' || env === 'preview';
}

// Check if in development mode
export function isDevelopment(): boolean {
  const env = getCurrentEnvironment();
  return env === 'local' || env === 'preview' || env === 'development';
}

// Check if debug mode is enabled
export function isDebugEnabled(): boolean {
  return process.env.EXPO_PUBLIC_DEBUG_MODE === 'true' || isDevelopment();
}

// Get database configuration
export async function getDatabaseConfig() {
  const config = await getEnvironmentConfig();
  
  if (config.database.type === 'local') {
    return {
      connectionString: config.database.url,
      ssl: false
    };
  }
  
  return {
    connectionString: config.database.url,
    poolConnectionString: config.database.poolUrl,
    ssl: {
      rejectUnauthorized: false
    }
  };
}

// Log current environment
export async function logEnvironment() {
  const env = getCurrentEnvironment();
  const config = await getEnvironmentConfig();
  const isEAS = isEASBuild();
  const localIP = await getLocalIPAddress();
  
  console.log(`
🌍 Environment: ${env}
📱 Platform: ${Platform.OS}
🏗️  EAS Build: ${isEAS ? 'Yes' : 'No'}
📊 Database: ${config.database.type} (${config.database.type === 'neon' ? 'Neon Cloud' : 'Local Docker'})
🌐 API Endpoints (${config.api.endpoints.length}):
${config.api.endpoints.map(e => `   - ${e.type}: ${e.url} (priority: ${e.priority})`).join('\n')}
📶 Local IP: ${localIP || 'Not detected'}
🔄 Fallback: ${config.api.fallbackEnabled ? 'Enabled' : 'Disabled'}
🐛 Debug: ${config.features.debug ? 'Enabled' : 'Disabled'}
📱 Dev Tools: ${config.features.devTools ? 'Enabled' : 'Disabled'}
  `);
}

// Export convenience functions
export { getCachedEndpoint, cacheEndpoint };

// Export types
export type { ApiEndpoint, EnvironmentConfig };