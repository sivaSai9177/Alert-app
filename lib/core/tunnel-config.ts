/**
 * Tunnel Configuration for Expo Go
 * Handles API URL resolution when using Expo tunnel mode
 */

import { Platform } from 'react-native';
import { log } from './logger';

// Check if we're in tunnel mode
export function isInTunnelMode(): boolean {
  // Check for Expo tunnel URL patterns
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    return hostname.includes('.exp.direct') || hostname.includes('.exp.host');
  }
  
  // For native, check if we have tunnel indicators
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
  return apiUrl.includes('.exp.direct') || apiUrl.includes('.exp.host');
}

// Get the tunnel URL from Expo manifest
export function getTunnelUrl(): string | null {
  try {
    // For Expo Go, we need to use the manifest URL
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      if (origin.includes('.exp.direct') || origin.includes('.exp.host')) {
        log.debug('Detected tunnel URL from window.location', 'TUNNEL_CONFIG', { origin });
        return origin;
      }
    }
    
    // Check environment variable
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl && (envUrl.includes('.exp.direct') || envUrl.includes('.exp.host'))) {
      log.debug('Detected tunnel URL from environment', 'TUNNEL_CONFIG', { envUrl });
      return envUrl;
    }
    
    return null;
  } catch (error) {
    log.error('Failed to get tunnel URL', 'TUNNEL_CONFIG', error);
    return null;
  }
}

// Get API URL for tunnel mode
export function getTunnelApiUrl(): string {
  const tunnelUrl = getTunnelUrl();
  
  if (tunnelUrl) {
    // In tunnel mode, the API is served from the same origin
    return tunnelUrl;
  }
  
  // Fallback to localhost for development
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8081';
  }
  
  return 'http://localhost:8081';
}

// Override API URL detection for tunnel mode
export function getApiUrlForTunnel(fallbackUrl: string): string {
  if (isInTunnelMode()) {
    const tunnelUrl = getTunnelApiUrl();
    log.info('Using tunnel URL for API', 'TUNNEL_CONFIG', { tunnelUrl });
    return tunnelUrl;
  }
  
  return fallbackUrl;
}