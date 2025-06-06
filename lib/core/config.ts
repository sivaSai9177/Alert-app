import { getApiUrlSync as getEnvApiUrl } from "./env";

/**
 * Get the API URL based on the platform and environment (synchronous version)
 * @deprecated Use getApiUrl from env.ts instead
 */
export function getApiUrlSync(): string {
  return getEnvApiUrl();
}

/**
 * Get the API URL based on the platform and environment (async version for compatibility)
 * @deprecated Use getApiUrl from env.ts instead
 */
export function getApiUrl(): string {
  return getEnvApiUrl();
}

/**
 * Get the auth base URL (Better Auth automatically appends /api/auth)
 */
export function getAuthBaseUrl(): string {
  return getApiUrl();
}

/**
 * Get the tRPC URL
 */
export function getTrpcUrl(): string {
  return `${getApiUrl()}/api/trpc`;
}

/**
 * Environment configuration
 */
export const config = {
  // API URLs
  apiUrl: getApiUrlSync(),
  authBaseUrl: getApiUrlSync(),
  trpcUrl: `${getApiUrlSync()}/api/trpc`,
  
  // App configuration
  appScheme: "my-expo",
  
  // OAuth configuration
  oauth: {
    google: {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    }
  },
  
  // Feature flags
  features: {
    emailVerification: process.env.EXPO_PUBLIC_ENABLE_EMAIL_VERIFICATION === "true",
    pushNotifications: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS !== "false", // Default to true
    biometricAuth: process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH === "true",
  },
  
  // Security
  sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  
  // Development
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
} as const;

export default config;