/**
 * Runtime Configuration
 * Allows dynamic configuration updates without relying on build-time environment variables
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from './logger';

export interface RuntimeConfig {
  apiUrl: string;
  wsUrl: string;
  isPhysicalDevice: boolean;
  detectedIp: string;
}

// Default configuration
const DEFAULT_CONFIG: RuntimeConfig = {
  apiUrl: 'http://localhost:8081',
  wsUrl: 'ws://localhost:3001',
  isPhysicalDevice: false,
  detectedIp: 'localhost',
};

// Runtime configuration storage
let runtimeConfig: RuntimeConfig = { ...DEFAULT_CONFIG };

// Storage key
const RUNTIME_CONFIG_KEY = '@runtime_config';

/**
 * Initialize runtime configuration
 */
export async function initializeRuntimeConfig(): Promise<void> {
  try {
    // Try to load from AsyncStorage first
    if (Platform.OS !== 'web') {
      const stored = await AsyncStorage.getItem(RUNTIME_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        runtimeConfig = { ...DEFAULT_CONFIG, ...parsed };
        log.info('Loaded runtime config from storage', 'RUNTIME_CONFIG', runtimeConfig);
        return;
      }
    }
    
    // Detect configuration from environment
    const detectedConfig = await detectConfiguration();
    runtimeConfig = detectedConfig;
    
    // Save to storage
    if (Platform.OS !== 'web') {
      await AsyncStorage.setItem(RUNTIME_CONFIG_KEY, JSON.stringify(runtimeConfig));
    }
    
    log.info('Initialized runtime config', 'RUNTIME_CONFIG', runtimeConfig);
  } catch (error) {
    log.error('Failed to initialize runtime config', 'RUNTIME_CONFIG', error);
  }
}

/**
 * Detect configuration from environment
 */
async function detectConfiguration(): Promise<RuntimeConfig> {
  // Check expo config extra
  const expoExtra = Constants.expoConfig?.extra || (Constants as any).manifest?.extra;
  if (expoExtra?.detectedIp && expoExtra.detectedIp !== 'localhost') {
    return {
      apiUrl: `http://${expoExtra.detectedIp}:8081`,
      wsUrl: `ws://${expoExtra.detectedIp}:3001`,
      isPhysicalDevice: true,
      detectedIp: expoExtra.detectedIp,
    };
  }
  
  // Check manifest for iOS
  if (Platform.OS === 'ios') {
    const manifestUrl = Constants.expoConfig?.hostUri || 
                       (Constants as any).manifest?.hostUri ||
                       (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    
    if (manifestUrl && !manifestUrl.includes('localhost')) {
      const cleanHost = manifestUrl.split('/')[0].split('?')[0].split(':')[0];
      return {
        apiUrl: `http://${cleanHost}:8081`,
        wsUrl: `ws://${cleanHost}:3001`,
        isPhysicalDevice: true,
        detectedIp: cleanHost,
      };
    }
  }
  
  // For Android emulator
  if (Platform.OS === 'android' && __DEV__) {
    return {
      apiUrl: 'http://10.0.2.2:8081',
      wsUrl: 'ws://10.0.2.2:3001',
      isPhysicalDevice: false,
      detectedIp: '10.0.2.2',
    };
  }
  
  // Default
  return DEFAULT_CONFIG;
}

/**
 * Get current runtime configuration
 */
export function getRuntimeConfig(): RuntimeConfig {
  return runtimeConfig;
}

/**
 * Update runtime configuration
 */
export async function updateRuntimeConfig(updates: Partial<RuntimeConfig>): Promise<void> {
  runtimeConfig = { ...runtimeConfig, ...updates };
  
  // Save to storage
  if (Platform.OS !== 'web') {
    await AsyncStorage.setItem(RUNTIME_CONFIG_KEY, JSON.stringify(runtimeConfig));
  }
  
  log.info('Updated runtime config', 'RUNTIME_CONFIG', runtimeConfig);
}

/**
 * Clear runtime configuration
 */
export async function clearRuntimeConfig(): Promise<void> {
  runtimeConfig = { ...DEFAULT_CONFIG };
  
  if (Platform.OS !== 'web') {
    await AsyncStorage.removeItem(RUNTIME_CONFIG_KEY);
  }
  
  log.info('Cleared runtime config', 'RUNTIME_CONFIG');
}

/**
 * Get API URL from runtime config
 */
export function getRuntimeApiUrl(): string {
  return runtimeConfig.apiUrl;
}

/**
 * Get WebSocket URL from runtime config
 */
export function getRuntimeWsUrl(): string {
  return runtimeConfig.wsUrl;
}