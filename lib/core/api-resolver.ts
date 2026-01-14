/**
 * API Resolver with Intelligent Fallback
 * Provides automatic endpoint discovery and failover for robust API connectivity
 */

import { Platform } from 'react-native';
import { getEnvironmentConfig, cacheEndpoint, getCachedEndpoint, type ApiEndpoint } from './env-config';
import { log } from './logger';
import { getAllPossibleEndpoints } from './network-config';

interface TestResult {
  endpoint: ApiEndpoint;
  success: boolean;
  responseTime?: number;
  error?: string;
}

interface ResolverOptions {
  forceRefresh?: boolean;
  timeout?: number;
  testPath?: string;
  maxRetries?: number;
}

class ApiResolver {
  private static instance: ApiResolver;
  private workingEndpoint: string | null = null;
  private isResolving = false;
  private resolvePromise: Promise<string> | null = null;
  private lastResolveTime = 0;
  private readonly RESOLVE_COOLDOWN = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): ApiResolver {
    if (!ApiResolver.instance) {
      ApiResolver.instance = new ApiResolver();
    }
    return ApiResolver.instance;
  }

  /**
   * Test if an endpoint is reachable
   */
  private async testEndpoint(endpoint: ApiEndpoint, timeout = 5000): Promise<TestResult> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const testUrl = endpoint.testPath 
        ? `${endpoint.url}${endpoint.testPath}`
        : `${endpoint.url}/api/health`;

      log.api.request('Testing endpoint', { 
        type: endpoint.type, 
        url: testUrl 
      });

      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        log.api.response('Endpoint test successful', {
          type: endpoint.type,
          url: endpoint.url,
          responseTime,
          status: response.status
        });

        return {
          endpoint,
          success: true,
          responseTime
        };
      } else {
        log.api.error('Endpoint test failed', new Error(`HTTP ${response.status}`), {
          type: endpoint.type,
          url: endpoint.url
        });

        return {
          endpoint,
          success: false,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.api.error('Endpoint test error', error as Error, {
        type: endpoint.type,
        url: endpoint.url,
        error: errorMessage
      });

      return {
        endpoint,
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Test endpoints in parallel and return the fastest working one
   */
  private async testEndpointsInParallel(endpoints: ApiEndpoint[], timeout = 5000): Promise<string | null> {
    if (endpoints.length === 0) {
      return null;
    }

    // Test all endpoints in parallel
    const testPromises = endpoints.map(endpoint => this.testEndpoint(endpoint, timeout));
    const results = await Promise.all(testPromises);

    // Filter successful results and sort by response time
    const successfulResults = results
      .filter(r => r.success)
      .sort((a, b) => (a.responseTime || 0) - (b.responseTime || 0));

    if (successfulResults.length > 0) {
      const fastest = successfulResults[0];
      log.info('Selected fastest endpoint', 'API_RESOLVER', {
        type: fastest.endpoint.type,
        url: fastest.endpoint.url,
        responseTime: fastest.responseTime
      });
      return fastest.endpoint.url;
    }

    return null;
  }

  /**
   * Resolve the best API endpoint to use
   */
  async resolve(options: ResolverOptions = {}): Promise<string> {
    const { forceRefresh = false, timeout = 5000 } = options;

    // Return cached endpoint if available and not forcing refresh
    if (!forceRefresh && this.workingEndpoint) {
      return this.workingEndpoint;
    }

    // Check persistent cache
    if (!forceRefresh) {
      const cached = await getCachedEndpoint();
      if (cached) {
        this.workingEndpoint = cached;
        return cached;
      }
    }

    // Prevent multiple simultaneous resolutions
    if (this.isResolving && this.resolvePromise) {
      return this.resolvePromise;
    }

    // Rate limit resolution attempts
    const timeSinceLastResolve = Date.now() - this.lastResolveTime;
    if (!forceRefresh && timeSinceLastResolve < this.RESOLVE_COOLDOWN) {
      if (this.workingEndpoint) {
        return this.workingEndpoint;
      }
    }

    // Start resolution process
    this.isResolving = true;
    this.lastResolveTime = Date.now();

    this.resolvePromise = this.performResolution(timeout);

    try {
      const result = await this.resolvePromise;
      return result;
    } finally {
      this.isResolving = false;
      this.resolvePromise = null;
    }
  }

  /**
   * Perform the actual endpoint resolution
   */
  private async performResolution(timeout: number): Promise<string> {
    log.info('Starting API endpoint resolution', 'API_RESOLVER');

    const config = await getEnvironmentConfig();
    const { endpoints, fallbackEnabled } = config.api;

    // Add network-aware endpoints for development
    if (config.name !== 'production' && config.name !== 'staging') {
      try {
        const networkEndpoints = await getAllPossibleEndpoints();
        const additionalEndpoints: ApiEndpoint[] = networkEndpoints.map((url, index) => ({
          type: 'lan' as const,
          url,
          priority: 10 + index, // Lower priority than configured endpoints
          testPath: '/api/health'
        }));
        
        // Merge with existing endpoints
        endpoints.push(...additionalEndpoints);
        log.debug('Added network-aware endpoints', 'API_RESOLVER', { 
          count: additionalEndpoints.length,
          endpoints: networkEndpoints 
        });
      } catch (error) {
        log.warn('Failed to get network endpoints', 'API_RESOLVER', error);
      }
    }

    if (!fallbackEnabled && endpoints.length > 0) {
      // Fallback disabled, use first endpoint
      const primaryEndpoint = endpoints[0].url;
      this.workingEndpoint = primaryEndpoint;
      await cacheEndpoint(primaryEndpoint);
      return primaryEndpoint;
    }

    // Test endpoints to find the best one
    const workingUrl = await this.testEndpointsInParallel(endpoints, timeout);

    if (workingUrl) {
      this.workingEndpoint = workingUrl;
      await cacheEndpoint(workingUrl);
      log.info('API endpoint resolved', 'API_RESOLVER', { url: workingUrl });
      return workingUrl;
    }

    // No working endpoints found, use fallback
    const fallbackUrl = this.getFallbackUrl();
    log.warn('Using fallback API URL', 'API_RESOLVER', { url: fallbackUrl });
    this.workingEndpoint = fallbackUrl;
    return fallbackUrl;
  }

  /**
   * Get fallback URL based on platform
   */
  private getFallbackUrl(): string {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
    } else if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8081';
    } else {
      return 'http://localhost:8081';
    }
  }

  /**
   * Manually set the API endpoint (for debugging/testing)
   */
  async setEndpoint(url: string): Promise<void> {
    log.info('Manually setting API endpoint', 'API_RESOLVER', { url });
    this.workingEndpoint = url;
    await cacheEndpoint(url);
  }

  /**
   * Clear cached endpoint and force re-resolution
   */
  async reset(): Promise<void> {
    log.info('Resetting API resolver', 'API_RESOLVER');
    this.workingEndpoint = null;
    this.lastResolveTime = 0;
    
    // Clear persistent cache
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem('WORKING_API_ENDPOINT');
      } catch {}
    } else {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.removeItem('WORKING_API_ENDPOINT');
      } catch {}
    }
  }

  /**
   * Get current working endpoint without triggering resolution
   */
  getCurrentEndpoint(): string | null {
    return this.workingEndpoint;
  }

  /**
   * Health check for the current endpoint
   */
  async healthCheck(): Promise<boolean> {
    if (!this.workingEndpoint) {
      return false;
    }

    try {
      const response = await fetch(`${this.workingEndpoint}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance methods
const resolver = ApiResolver.getInstance();

export const resolveApiUrl = (options?: ResolverOptions) => resolver.resolve(options);
export const setApiUrl = (url: string) => resolver.setEndpoint(url);
export const resetApiResolver = () => resolver.reset();
export const getCurrentApiUrl = () => resolver.getCurrentEndpoint();
export const checkApiHealth = () => resolver.healthCheck();

// Export for use in other modules
export default resolver;