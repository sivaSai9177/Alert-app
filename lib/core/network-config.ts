/**
 * Network Configuration for Multiple WiFi Networks
 * Supports automatic detection and fallback for different network environments
 */

import { Platform } from 'react-native';
import * as Network from 'expo-network';
import { log } from './logger';

// Known network configurations
export const NETWORK_CONFIGS = {
  // Primary WiFi (original network)
  primary: {
    name: 'Primary WiFi',
    ipRange: '192.168.1.x',
    expectedIPs: ['192.168.1.16', '192.168.1.101'],
    apiPort: 8081,
    dbPort: 5432,
  },
  // Secondary WiFi (new network)
  secondary: {
    name: 'Secondary WiFi',
    ipRange: '192.168.2.x',
    expectedIPs: ['192.168.2.1'],
    apiPort: 8081,
    dbPort: 5432,
  },
  // Tertiary WiFi
  tertiary: {
    name: 'Tertiary WiFi',
    ipRange: '192.168.3.x',
    expectedIPs: ['192.168.3.1'],
    apiPort: 8081,
    dbPort: 5432,
  }
};

// Get all possible API endpoints based on known networks
export async function getAllPossibleEndpoints(): Promise<string[]> {
  const endpoints: string[] = [];
  
  // Add all known IPs
  Object.values(NETWORK_CONFIGS).forEach(config => {
    config.expectedIPs.forEach(ip => {
      endpoints.push(`http://${ip}:${config.apiPort}`);
    });
  });
  
  // Add current network IP if available
  try {
    const currentIP = await getCurrentNetworkIP();
    if (currentIP) {
      endpoints.unshift(`http://${currentIP}:8081`); // Priority to current network
    }
  } catch (error) {
    log.debug('Could not detect current IP', 'NETWORK_CONFIG', error);
  }
  
  // Add localhost for simulators
  if (Platform.OS === 'ios' || Platform.OS === 'web') {
    endpoints.push('http://localhost:8081');
  }
  
  // Android emulator
  if (Platform.OS === 'android') {
    endpoints.push('http://10.0.2.2:8081');
  }
  
  return [...new Set(endpoints)]; // Remove duplicates
}

// Get current network IP address
export async function getCurrentNetworkIP(): Promise<string | null> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    
    if (!networkState.isConnected) {
      log.warn('No network connection', 'NETWORK_CONFIG');
      return null;
    }
    
    // Try to get IP from network state
    const ip = await Network.getIpAddressAsync();
    if (ip && ip !== '0.0.0.0') {
      log.info('Current network IP detected', 'NETWORK_CONFIG', { ip });
      return ip;
    }
  } catch (error) {
    log.error('Failed to get network IP', 'NETWORK_CONFIG', error);
  }
  
  return null;
}

// Detect which network configuration we're on
export async function detectNetworkConfig(): Promise<typeof NETWORK_CONFIGS[keyof typeof NETWORK_CONFIGS] | null> {
  const currentIP = await getCurrentNetworkIP();
  
  if (!currentIP) {
    return null;
  }
  
  // Check which network range the IP belongs to
  for (const [key, config] of Object.entries(NETWORK_CONFIGS)) {
    if (config.expectedIPs.includes(currentIP)) {
      log.info('Detected network configuration', 'NETWORK_CONFIG', { 
        network: config.name, 
        ip: currentIP 
      });
      return config;
    }
    
    // Check IP range pattern
    const ipPrefix = currentIP.substring(0, currentIP.lastIndexOf('.'));
    const expectedPrefix = config.ipRange.replace('.x', '');
    if (ipPrefix === expectedPrefix) {
      log.info('Detected network by range', 'NETWORK_CONFIG', { 
        network: config.name, 
        ip: currentIP 
      });
      return config;
    }
  }
  
  // Unknown network
  log.warn('Unknown network configuration', 'NETWORK_CONFIG', { ip: currentIP });
  return null;
}

// Get API URL for current network
export async function getNetworkApiUrl(): Promise<string> {
  const config = await detectNetworkConfig();
  const currentIP = await getCurrentNetworkIP();
  
  if (currentIP) {
    return `http://${currentIP}:8081`;
  }
  
  if (config && config.expectedIPs.length > 0) {
    return `http://${config.expectedIPs[0]}:${config.apiPort}`;
  }
  
  // Fallback
  return Platform.OS === 'android' ? 'http://10.0.2.2:8081' : 'http://localhost:8081';
}

// Test all network endpoints
export async function testNetworkEndpoints(): Promise<{ endpoint: string; success: boolean; responseTime?: number }[]> {
  const endpoints = await getAllPossibleEndpoints();
  const results = [];
  
  for (const endpoint of endpoints) {
    const startTime = Date.now();
    try {
      const response = await fetch(`${endpoint}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      results.push({
        endpoint,
        success: response.ok,
        responseTime
      });
    } catch (error) {
      results.push({
        endpoint,
        success: false
      });
    }
  }
  
  return results;
}

export default {
  NETWORK_CONFIGS,
  getAllPossibleEndpoints,
  getCurrentNetworkIP,
  detectNetworkConfig,
  getNetworkApiUrl,
  testNetworkEndpoints,
};