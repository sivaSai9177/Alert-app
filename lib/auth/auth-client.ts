// Import crypto polyfill first for React Native
import "../core/crypto";

import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { Platform } from "react-native";
import Constants from 'expo-constants';
import { webStorage, mobileStorage } from "../core/secure-storage";
import { getAuthUrl } from "../core/unified-env";
import { sessionManager } from "./auth-session-manager";
import { log } from "../core/logger";
import { createDynamicAuthClient } from './dynamic-auth-client';
// Note: Removed auth-store import to prevent circular dependency

// Get URL dynamically to ensure proper environment detection
const getBaseUrl = () => {
  // Clear cache for iOS devices to ensure fresh URL
  if (Platform.OS === 'ios') {
    const { clearEnvCache } = require('../core/unified-env');
    clearEnvCache();
  }
  return getAuthUrl();
};

// Log configuration once (only on client side)
if (typeof window !== 'undefined' || __DEV__) {
  // Delay logging to ensure environment is properly detected
  setTimeout(() => {
    const baseUrl = getBaseUrl();
    log.info('Auth client initialized', 'AUTH_CLIENT', {
      platform: Platform.OS,
      baseURL: baseUrl,
      authEndpoint: `${baseUrl}/api/auth`,
      isExpoGo: !Platform.OS || Platform.OS === 'ios' || Platform.OS === 'android',
      isDevice: Constants.isDevice,
    });
  }, 500); // Increased delay to ensure environment is fully loaded
}

// Custom fetch implementation to fix body serialization and handle dynamic URLs
const customFetch: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  // If input is a string and it's an auth URL, ensure we're using the current base URL
  if (typeof input === 'string' && input.includes('/api/auth')) {
    const currentBaseUrl = getBaseUrl();
    // Replace any localhost URL with the current base URL for iOS devices
    if (Platform.OS === 'ios' && input.includes('localhost')) {
      input = input.replace(/http:\/\/localhost:\d+/, currentBaseUrl);
      log.debug('Replaced localhost URL with device IP', 'AUTH_CLIENT', { 
        newUrl: input,
        baseUrl: currentBaseUrl 
      });
    }
  }
  
  // If there's a body and it's an object, ensure it's properly stringified
  if (init?.body && typeof init.body === 'object' && !(init.body instanceof FormData)) {
    init = {
      ...init,
      body: JSON.stringify(init.body),
    };
  }
  
  return fetch(input, init);
};

const baseAuthClient = createAuthClient({
  baseURL: `${getBaseUrl()}/api/auth`, // Get URL dynamically
  fetch: customFetch, // Use custom fetch to fix serialization
  plugins: [
    expoClient({
      scheme: "expo-starter", // App scheme from app.json
      storagePrefix: "better-auth", // Use Better Auth's default prefix
      storage: Platform.OS === 'web' ? webStorage : mobileStorage,
      disableCache: false, // Enable session caching
    }),
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: true,
          defaultValue: "user",
        },
        organizationId: {
          type: "string", 
          required: false,
        },
        organizationName: {
          type: "string",
          required: false,
        },
        department: {
          type: "string",
          required: false,
        },
        needsProfileCompletion: {
          type: "boolean",
          required: false,
          defaultValue: true,
        },
      },
    }),
  ],
  fetchOptions: {
    credentials: Platform.OS === 'web' ? 'include' : 'omit', // Important for cookie-based auth on web
    headers: {
      'Content-Type': 'application/json',
    },
    onRequest: (ctx: any) => {
      // The Expo plugin handles cookie management automatically
      // No need to manually add headers
      log.debug('Request to', 'AUTH_CLIENT', { url: ctx.url });
      
      // Debug the request body
      if (ctx.options?.body) {
        log.debug('Request body', 'AUTH_CLIENT', {
          bodyType: typeof ctx.options.body,
          hasBody: !!ctx.options.body
        });
        
        // Ensure body is properly stringified
        if (typeof ctx.options.body === 'object' && !(ctx.options.body instanceof FormData)) {
          ctx.options.body = JSON.stringify(ctx.options.body);
        }
      }
    },
    onResponse: async (ctx: any) => {
      // The Expo plugin handles cookie storage automatically
      // Log for debugging purposes only
      if (ctx.response && ctx.response.headers) {
        const setCookie = ctx.response.headers.get('set-cookie');
        if (setCookie) {
          log.debug('Set-Cookie header received (handled by Expo plugin)', 'AUTH_CLIENT');
        }
      }
      
      // Update Zustand store on successful auth responses
      if (ctx.response && ctx.response.ok && ctx.url && ctx.url.includes('/api/auth')) {
        try {
          const data = await ctx.response.clone().json();
          
          // Handle sign-in/sign-up responses
          if (ctx.url && (ctx.url.includes('/signin') || ctx.url.includes('/signup')) && data.user) {
            log.debug('Response received, storing session data', 'AUTH_CLIENT');
            
            // Log the response structure for debugging
            log.debug('Sign-in response structure', 'AUTH_CLIENT', {
              platform: Platform.OS,
              hasToken: !!data.token,
              hasSession: !!data.session,
              hasSessionToken: !!data.session?.token,
              tokenValue: data.token ? `${data.token.substring(0, 10)}...` : null,
              sessionKeys: data.session ? Object.keys(data.session) : [],
              dataKeys: Object.keys(data),
            });
            
            // Better Auth returns the token at the top level or in session
            const token = data.token || data.session?.token || data.sessionToken;
            
            // Create a proper session object
            const session = data.session || (token ? { 
              id: crypto.randomUUID(),
              token: token, 
              userId: data.user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            } : null);
            
            // Store token for mobile platforms
            if (Platform.OS !== 'web' && token) {
              log.debug('Mobile session - ensuring token is accessible', 'AUTH_CLIENT');
              
              try {
                // Store in session manager for persistence
                await sessionManager.storeSession({ token, userId: data.user.id });
                log.debug('Stored session token for mobile API access', 'AUTH_CLIENT');
                
                // Update Zustand store with session info
                const { useAuthStore } = require('@/lib/stores/auth-store');
                const authStore = useAuthStore.getState();
                if (session) {
                  authStore.setSession(session);
                }
                
              } catch (e) {
                log.error('Could not store session token', 'AUTH_CLIENT', e);
              }
            }
          }
        } catch (error) {
          // Response might not be JSON, ignore
        }
      }
    },
  },
});

// Wrap the auth client for dynamic URL resolution
export const authClient = createDynamicAuthClient(baseAuthClient);
export type AuthClient = typeof authClient;

// Helper function to get auth headers for tRPC
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    // For mobile, try to get the token from session manager first
    if (Platform.OS !== 'web') {
      const token = sessionManager.getSessionToken();
      if (token) {
        log.debug('Using cached token from session manager', 'AUTH_CLIENT');
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
      }
    }
    
    // Fall back to getting session from auth client
    const sessionData = await authClient.getSession();
    
    // Better Auth returns { data: { session, user } } or { error }
    if (sessionData && 'data' in sessionData && sessionData.data?.session) {
      // Try to get token from various possible locations
      const session = sessionData.data.session;
      const token = (session as any).token || (session as any).sessionToken;
      
      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
      }
    }
    
    // For unauthenticated requests, just return content-type
    return {
      'Content-Type': 'application/json',
    };
  } catch (error) {
    log.error('Failed to get auth headers', 'AUTH_CLIENT', error);
    // Return basic headers on error
    return {
      'Content-Type': 'application/json',
    };
  }
}