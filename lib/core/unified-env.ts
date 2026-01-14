/**
 * Unified Environment Configuration
 * Handles all environment scenarios: local, network, tunnel, OAuth
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { log } from './logger';
import { getRuntimeConfig } from './runtime-config';

// Log environment details on module load (iOS only for debugging)
if (Platform.OS === 'ios' && __DEV__) {
  setTimeout(() => {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      REACT_NATIVE_PACKAGER_HOSTNAME: process.env.REACT_NATIVE_PACKAGER_HOSTNAME,
      expoConfigExtra: Constants.expoConfig?.extra,
      manifestExtra: (Constants as any).manifest?.extra,
      isDevice: Constants.isDevice,
      runtimeConfig: getRuntimeConfig(),
    });
  }, 1000);
}

export type EnvironmentMode = 'local' | 'network' | 'tunnel' | 'production';

// Cache for environment config with TTL
let configCache: { config: EnvConfig; timestamp: number } | null = null;
const CACHE_TTL = 5000; // 5 seconds cache to allow for environment changes

interface EnvConfig {
  apiUrl: string;
  authUrl: string;
  authBaseUrl: string;
  databaseUrl: string;
  mode: EnvironmentMode;
  isOAuthSafe: boolean;
}

/**
 * Detect current environment mode
 */
function detectEnvironmentMode(): EnvironmentMode {
  // Check if we're in tunnel mode
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname.includes('.exp.direct') || hostname.includes('.exp.host')) {
      return 'tunnel';
    }
  }
  
  // Check environment variables
  const appEnv = process.env.APP_ENV;
  if (appEnv === 'production' || process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  // For iOS, check if we're in local mode but with a network IP
  if (appEnv === 'local' && Platform.OS === 'ios') {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    // If API URL is set to a network IP (not localhost), force network mode
    if (apiUrl && !apiUrl.includes('localhost') && apiUrl.includes('192.168')) {
      log.debug('iOS local mode with network IP detected', 'ENV', { apiUrl });
      return 'network';
    }
  }
  
  // For iOS devices, always prefer network mode
  if (Platform.OS === 'ios') {
    // Check if we have expo manifest with a network IP
    const manifestHost = Constants.expoConfig?.hostUri || 
                        (Constants as any).manifest?.hostUri ||
                        (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    
    // If we have a non-localhost manifest, use network mode
    if (manifestHost && !manifestHost.includes('localhost')) {
      log.debug('iOS device detected with network manifest', 'ENV', { manifestHost });
      return 'network';
    }
    
    // For physical devices, always use network mode
    if (Constants.isDevice !== false) {
      log.debug('iOS physical device detected, forcing network mode', 'ENV');
      return 'network';
    }
  }
  
  // Check if explicitly set to local
  if (appEnv === 'local' || (process.env.EXPO_PUBLIC_API_URL?.includes('localhost') && Platform.OS !== 'ios')) {
    return 'local';
  }
  
  // Default to network mode for development
  return 'network';
}

/**
 * Get unified environment configuration
 */
export function getUnifiedEnvConfig(): EnvConfig {
  // Check cache first
  if (configCache && Date.now() - configCache.timestamp < CACHE_TTL) {
    return configCache.config;
  }
  
  const mode = detectEnvironmentMode();
  
  // Check if we're using a separate API server (for Expo Go compatibility)
  const apiServerUrl = process.env.EXPO_PUBLIC_API_SERVER_URL || process.env.API_SERVER_URL;
  const useApiServer = !!apiServerUrl || process.env.EXPO_PUBLIC_USE_API_SERVER === 'true';
  
  switch (mode) {
    case 'local':
      // If using separate API server, point to it instead of Expo dev server
      const localApiUrl = useApiServer 
        ? (apiServerUrl || 'http://localhost:3000')
        : 'http://localhost:8081';
        
      const localConfig = {
        apiUrl: localApiUrl,
        authUrl: localApiUrl,
        authBaseUrl: `${localApiUrl}/api/auth`,
        databaseUrl: process.env.LOCAL_DATABASE_URL || 'postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev',
        mode: 'local' as EnvironmentMode,
        isOAuthSafe: true, // localhost is OAuth-safe
      };
      
      configCache = { config: localConfig, timestamp: Date.now() };
      return localConfig;
      
    case 'tunnel':
      const tunnelUrl = getTunnelUrl();
      const tunnelConfig = {
        apiUrl: tunnelUrl,
        authUrl: tunnelUrl,
        authBaseUrl: `${tunnelUrl}/api/auth`,
        databaseUrl: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '',
        mode: 'tunnel' as EnvironmentMode,
        isOAuthSafe: true, // Public URLs are OAuth-safe
      };
      
      configCache = { config: tunnelConfig, timestamp: Date.now() };
      return tunnelConfig;
      
    case 'production':
      const prodUrl = process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'https://api.myapp.com';
      const prodConfig = {
        apiUrl: prodUrl,
        authUrl: prodUrl,
        authBaseUrl: `${prodUrl}/api/auth`,
        databaseUrl: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '',
        mode: 'production' as EnvironmentMode,
        isOAuthSafe: true, // Production URLs are OAuth-safe
      };
      
      configCache = { config: prodConfig, timestamp: Date.now() };
      return prodConfig;
      
    case 'network':
    default:
      // Network mode - detect best URL
      const networkUrl = getNetworkUrl();
      const isPrivateIP = networkUrl.includes('192.168') || networkUrl.includes('10.0');
      
      // If using separate API server, use it for all API calls
      if (useApiServer) {
        const networkApiUrl = apiServerUrl || 'http://localhost:3000';
        return {
          apiUrl: networkApiUrl,
          authUrl: networkApiUrl,
          authBaseUrl: `${networkApiUrl}/api/auth`,
          databaseUrl: process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL || '',
          mode: 'network',
          isOAuthSafe: true, // API server on localhost is OAuth-safe
        };
      }
      
      // For iOS physical devices, ALWAYS use the network URL, never localhost
      const isIOSDevice = Platform.OS === 'ios' && Constants.isDevice !== false;
      
      const config = {
        apiUrl: networkUrl,
        authUrl: isIOSDevice ? networkUrl : (isPrivateIP ? 'http://localhost:8081' : networkUrl),
        authBaseUrl: isIOSDevice ? `${networkUrl}/api/auth` : (isPrivateIP ? 'http://localhost:8081/api/auth' : `${networkUrl}/api/auth`),
        databaseUrl: process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL || '',
        mode: 'network' as EnvironmentMode,
        isOAuthSafe: !isPrivateIP || isIOSDevice, // iOS devices with network URLs are OAuth-safe
      };
      
      // Cache the config
      configCache = { config, timestamp: Date.now() };
      return config;
  }
}

/**
 * Get tunnel URL
 */
function getTunnelUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  
  // Check environment variable
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && (envUrl.includes('.exp.direct') || envUrl.includes('.exp.host'))) {
    return envUrl;
  }
  
  return 'http://localhost:8081'; // Fallback
}

/**
 * Get network URL based on platform
 */
function getNetworkUrl(): string {
  // Web always uses origin
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Check runtime config first (highest priority for iOS)
  if (Platform.OS === 'ios') {
    const runtimeConfig = getRuntimeConfig();
    if (runtimeConfig.apiUrl && !runtimeConfig.apiUrl.includes('localhost')) {
      log.info('Using API URL from runtime config', 'ENV', { url: runtimeConfig.apiUrl });
      return runtimeConfig.apiUrl;
    }
  }
  
  // Check expo config extra (set dynamically by expo.config.js)
  const expoExtra = Constants.expoConfig?.extra || (Constants as any).manifest?.extra;
  if (expoExtra?.apiUrl && !expoExtra.apiUrl.includes('localhost')) {
    log.info('Using API URL from expo config', 'ENV', { url: expoExtra.apiUrl });
    return expoExtra.apiUrl;
  }
  
  // Check environment variable (fallback)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    log.info('Using API URL from environment', 'ENV', { url: envUrl });
    return envUrl;
  }
  
  // Check if running with specific host (set by REACT_NATIVE_PACKAGER_HOSTNAME)
  const packagerHost = process.env.REACT_NATIVE_PACKAGER_HOSTNAME;
  if (packagerHost && packagerHost !== 'localhost') {
    const hostUrl = `http://${packagerHost}:8081`;
    log.debug('Using packager hostname', 'ENV', { url: hostUrl });
    return hostUrl;
  }
  
  // Android emulator
  if (Platform.OS === 'android' && __DEV__) {
    return 'http://10.0.2.2:8081';
  }
  
  // iOS - Always use network IP for physical devices
  if (Platform.OS === 'ios') {
    // Skip EXPO_PUBLIC_API_URL if it contains localhost
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl && envUrl.includes('localhost')) {
      log.warn('Ignoring localhost EXPO_PUBLIC_API_URL for iOS device', 'ENV', { envUrl });
    } else if (envUrl) {
      log.info('Using iOS env URL', 'ENV', { url: envUrl });
      return envUrl;
    }
    
    // Second priority: Use Expo manifest host
    const manifestUrl = Constants.expoConfig?.hostUri || 
                       (Constants.expoConfig as any)?.debuggerHost ||
                       Constants.manifest2?.extra?.expoGo?.debuggerHost ||
                       (Constants as any).manifest?.debuggerHost ||
                       (Constants as any).manifest?.hostUri ||
                       (Constants as any).expoConfig?.hostUri ||
                       (Constants as any).experienceUrl;
                       
    // Also check for expo-updates manifest
    const updatesUrl = (Constants as any).manifest?.bundleUrl || 
                      Constants.manifest2?.launchAsset?.url;
                      
    log.debug('iOS URL detection', 'ENV', {
      envUrl,
      manifestUrl,
      updatesUrl,
      expoConfig: Constants.expoConfig,
      manifest: (Constants as any).manifest,
      manifest2: Constants.manifest2,
    });
                       
    if (manifestUrl && typeof manifestUrl === 'string') {
      // Extract just the IP:port from manifestUrl (might be in format 192.168.1.9:8081)
      const cleanHost = manifestUrl.split('/')[0].split('?')[0];
      // Don't use localhost for iOS devices
      if (!cleanHost.includes('localhost')) {
        const iosManifestUrl = `http://${cleanHost}`;
        log.info('Using iOS manifest URL', 'ENV', { url: iosManifestUrl, manifestUrl });
        return iosManifestUrl;
      }
    }
    
    // Try to extract from updates URL
    if (updatesUrl) {
      try {
        const url = new URL(updatesUrl);
        const iosUpdatesUrl = `http://${url.hostname}:8081`;
        log.info('Using iOS updates URL', 'ENV', { url: iosUpdatesUrl, updatesUrl });
        return iosUpdatesUrl;
      } catch (e) {
        log.debug('Failed to parse updates URL', 'ENV', { updatesUrl });
      }
    }
    
    // Check if we're on a physical device
    const isDevice = !__DEV__ || !(global as any).nativePerformanceNow;
    
    // If localhost works, we're on simulator
    // Physical devices need the actual IP address
    const debuggerHost = (global as any).__REMOTEDEV_HOSTNAME__;
    if (debuggerHost && debuggerHost !== 'localhost') {
      const iosUrl = `http://${debuggerHost}:8081`;
      log.debug('Using iOS debugger host', 'ENV', { url: iosUrl });
      return iosUrl;
    }
    
    // For physical devices, try to get the packager hostname
    if (isDevice && packagerHost && packagerHost !== 'localhost') {
      const deviceUrl = `http://${packagerHost}:8081`;
      log.debug('Using packager hostname for iOS device', 'ENV', { url: deviceUrl });
      return deviceUrl;
    }
  }
  
  // For iOS physical devices, try to detect from environment
  if (Platform.OS === 'ios' && __DEV__) {
    // Check if we're actually on a physical device by looking for specific markers
    const isPhysicalDevice = !Constants.isDevice === false; // Double negative because isDevice might be undefined
    
    if (isPhysicalDevice) {
      // Try to get IP from environment or use fallback
      const fallbackIP = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || '192.168.1.9';
      const deviceUrl = `http://${fallbackIP}:8081`;
      log.info('Using IP for iOS physical device', 'ENV', { 
        url: deviceUrl,
        isDevice: Constants.isDevice,
        packagerHost: process.env.REACT_NATIVE_PACKAGER_HOSTNAME 
      });
      return deviceUrl;
    }
  }
  
  // Default to localhost (works for simulator/web)
  return 'http://localhost:8081';
}

/**
 * Get API URL for general use
 */
export function getApiUrl(): string {
  const config = getUnifiedEnvConfig();
  return config.apiUrl;
}

/**
 * Get Auth URL (OAuth-safe)
 */
export function getAuthUrl(): string {
  const config = getUnifiedEnvConfig();
  return config.authUrl;
}

/**
 * Get Auth Base URL for Better Auth
 */
export function getAuthBaseUrl(): string {
  const config = getUnifiedEnvConfig();
  return config.authBaseUrl;
}

/**
 * Check if current environment is OAuth-safe
 */
export function isOAuthSafe(): boolean {
  const config = getUnifiedEnvConfig();
  return config.isOAuthSafe;
}

/**
 * Get database URL
 */
export function getDatabaseUrl(): string {
  const config = getUnifiedEnvConfig();
  return config.databaseUrl;
}

/**
 * Clear environment config cache
 */
export function clearEnvCache(): void {
  configCache = null;
  log.debug('Environment config cache cleared', 'ENV');
}

/**
 * Log current environment (debug)
 */
export function logEnvironment(): void {
  const config = getUnifiedEnvConfig();
    mode: config.mode,
    apiUrl: config.apiUrl,
    authUrl: config.authUrl,
    authBaseUrl: config.authBaseUrl,
    isOAuthSafe: config.isOAuthSafe,
    platform: Platform.OS,
    isDev: __DEV__,
    constants: {
      expoConfig: Constants.expoConfig,
      manifest2: Constants.manifest2,
      experienceUrl: (Constants as any).experienceUrl,
    }
  });
}