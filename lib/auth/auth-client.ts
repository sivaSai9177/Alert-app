// Import crypto polyfill first for React Native
import "../core/crypto";

import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { Platform } from "react-native";
import { webStorage, mobileStorage } from "../core/secure-storage";
import { getApiUrlSync } from "../core/config";
import { sessionManager } from "./auth-session-manager";
// Note: Removed auth-store import to prevent circular dependency

const BASE_URL = getApiUrlSync();

// Log configuration once
console.log("[AUTH CLIENT] Initialized:", {
  platform: Platform.OS,
  baseURL: BASE_URL,
  authEndpoint: `${BASE_URL}/api/auth`
});

export const authClient = createAuthClient({
  baseURL: `${BASE_URL}/api/auth`, // Full auth endpoint path
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
    credentials: 'include', // Important for cookie-based auth on web
    onRequest: (ctx: any) => {
      // For mobile, add stored session token to headers
      if (Platform.OS !== 'web') {
        const token = sessionManager.getSessionToken();
        if (token) {
          if (!ctx.headers) ctx.headers = {};
          ctx.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    },
    onResponse: async (ctx: any) => {
      // Log response for debugging
      if (ctx.response && ctx.response.headers) {
        const setCookie = ctx.response.headers.get('set-cookie');
        if (setCookie) {
          console.log('[AUTH CLIENT] Set-Cookie header received:', setCookie);
        }
      }
      
      // Update Zustand store on successful auth responses
      if (ctx.response && ctx.response.ok && ctx.url && ctx.url.includes('/api/auth')) {
        try {
          const data = await ctx.response.clone().json();
          
          // Handle sign-in/sign-up responses
          if (ctx.url && (ctx.url.includes('/signin') || ctx.url.includes('/signup')) && data.user) {
            console.log('[AUTH CLIENT] Response received, storing session data');
            
            // Create a proper session object
            const session = data.session || (data.token ? { 
              id: crypto.randomUUID(),
              token: data.token, 
              userId: data.user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            } : null);
            
            // Store session for mobile (auth store will handle its own state)
            if (Platform.OS !== 'web' && session) {
              await sessionManager.storeSession(session);
              await sessionManager.storeUserData(data.user);
            }
          }
        } catch (error) {
          // Response might not be JSON, ignore
        }
      }
    },
  },
});

// Export the properly typed auth client
export type AuthClient = typeof authClient;