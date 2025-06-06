import { db } from "@/src/db";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, multiSession, organization, admin } from "better-auth/plugins";
import * as schema from "../../src/db/schema";

import { log } from "@/lib/core/logger";

// Dynamic base URL based on request context
const getBaseURL = () => {
  // For OAuth callbacks, always use localhost to avoid Google's private IP restriction
  if (typeof process !== 'undefined') {
    const url = process.env.BETTER_AUTH_BASE_URL;
    if (url && url.includes('192.168')) {
      // Replace private IP with localhost for OAuth compatibility
      return url.replace(/192\.168\.\d+\.\d+/, 'localhost');
    }
    return url || "http://localhost:8081/api/auth";
  }
  return "http://localhost:8081/api/auth";
};

const getTrustedOrigins = () => {
  const origins = [
    // Local development origins - prioritize localhost
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8082",
    "http://127.0.0.1:3000",
  ];

  // Add local network IP for mobile testing
  if (process.env.NODE_ENV === "development") {
    // You can dynamically get your local IP or set it via environment variable
    const localIP = process.env.LOCAL_IP || "192.168.1.101";
    // Also add the API URL's IP if different
    const apiUrlIP = process.env.EXPO_PUBLIC_API_URL?.match(/(\d+\.\d+\.\d+\.\d+)/)?.[1];
    origins.push(
      `http://${localIP}:8081`,
      `http://${localIP}:8082`, // Add 8082 for web development
      `http://${localIP}:3000`,
      // Expo development server patterns
      `http://${localIP}:19000`,
      `http://${localIP}:19001`,
      `http://${localIP}:19002`
    );
    
    // Add API URL IP if different from LOCAL_IP
    if (apiUrlIP && apiUrlIP !== localIP) {
      origins.push(
        `http://${apiUrlIP}:8081`,
        `http://${apiUrlIP}:8082`,
        `http://${apiUrlIP}:3000`,
        `http://${apiUrlIP}:19000`,
        `http://${apiUrlIP}:19001`,
        `http://${apiUrlIP}:19002`
      );
    }
  }

  // Add production origins from environment variables
  if (process.env.PRODUCTION_URL) {
    origins.push(process.env.PRODUCTION_URL);
  }

  // Add any additional trusted origins from environment
  if (process.env.ADDITIONAL_TRUSTED_ORIGINS) {
    const additionalOrigins = process.env.ADDITIONAL_TRUSTED_ORIGINS.split(",");
    origins.push(...additionalOrigins);
  }

  log.info("[AUTH SERVER] Trusted origins", "AUTH_CONFIG", { origins });
  return origins;
};

log.info("[AUTH CONFIG] Initializing Better Auth", "AUTH_CONFIG", {
  baseURL: getBaseURL(),
  databaseAvailable: !!db,
  googleClientId: !!process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  googleConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
});

export const auth = betterAuth({
  baseURL: getBaseURL(),
  secret:
    process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // Enhanced scope for healthcare applications
        scope: ["openid", "email", "profile"],
        // Better Auth will automatically detect the redirect URI from the incoming request
        // No need to hard-code it here since we're using different URIs for web vs mobile
      },
    }),
    // Add Apple Sign-In for iOS healthcare apps when credentials are available
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET && {
      apple: {
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
        scope: ["email", "name"],
      },
    }),
    // Microsoft Azure AD for enterprise healthcare when credentials are available
    ...(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET && process.env.MICROSOFT_TENANT_ID && {
      microsoftEntraId: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        tenantId: process.env.MICROSOFT_TENANT_ID, // Hospital's Azure tenant
      },
    }),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false, // Make optional for OAuth users
        defaultValue: null, // No default - user must choose
      },
      organizationId: {
        type: "string",
        required: false,
      },
      needsProfileCompletion: {
        type: "boolean",
        required: true,
        defaultValue: true, // Default to true for new users
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for MVP
    sendResetPassword: async ({ user, url }) => {
      // Implement your email sending logic here
      log.auth.info(`Password reset link generated`, { email: user.email, url });
      // In production, replace with actual email service
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema },
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true, // Enable cookie cache for proper session persistence
    },
  },
  // Cookie configuration
  cookies: {
    sessionToken: {
      name: "better-auth.session-token",
      httpOnly: false, // Set to false for mobile compatibility
      sameSite: "lax", // Allow cookies in OAuth redirects
      secure: false, // Allow HTTP in development
      path: "/",
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined, // Let browser handle domain in dev
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    // Add state cookie configuration
    state: {
      name: "better-auth.state",
      httpOnly: false,
      sameSite: "lax",
      secure: false, // Allow HTTP in development
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    },
  },
  // Note: Hook implementation moved to middleware in server/routers/auth.ts
  // to avoid Better Auth type conflicts
  plugins: [
    expo(), // The Expo plugin configuration is done on the client side
    oAuthProxy(), // OAuth proxy for better mobile OAuth support
    multiSession({ 
      maximumSessions: 5 // Allow up to 5 sessions per user
    }), // Multi-session support
    organization({
      // Organization configuration
      allowUserToCreateOrganization: true,
      membershipLimits: {
        'free': 5,
        'pro': 50,
        'enterprise': -1 // unlimited
      }
    }), // Organization management
    admin({
      defaultRole: 'user',
      // Admin user IDs can be set via environment variable
      adminUserIds: process.env.ADMIN_USER_IDS?.split(',') || []
    }) // Admin functionality
  ],
  // CORS and trusted origins - include app scheme for mobile
  trustedOrigins: [
    ...getTrustedOrigins(),
    "expo-starter://", // Add your app scheme
    "expo-starter://auth-callback", // Specific callback path
    "expo-starter://*", // Allow all paths with your app scheme
    "my-expo://", // Legacy app scheme
    "my-expo://home", // Legacy specific callback path
    "my-expo://*", // Legacy allow all paths with your app scheme
    "exp://192.168.1.104:8081", // Expo development URL
    "exp://192.168.1.104:8081/--/", // Expo development URL with path
    "exp://localhost:8081", // Local Expo development
    "exp://localhost:8081/--/", // Local Expo development with path
    "http://192.168.1.104:8081/home", // Mobile callback URL
    "http://localhost:8081/home", // Web callback URL
    // Expo auth proxy patterns
    "https://auth.expo.io/*",
    "https://auth.expo.io",
  ],
  
  // Explicit CORS configuration
  cors: {
    origin: getTrustedOrigins(),
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
  // trustedOrigins: [
  //   // For local web development
  //   "http://localhost:8081",
  //   "http://localhost:3000",

  //   // Keep your local network IP if testing on other devices
  //   "http://192.168.1.104:8081",

  //   // You can add your production domains here when deploying
  //   // "https://yourapp.com",
  // ],
  // Advanced options
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: process.env.COOKIE_DOMAIN, // Set this for production subdomains
    },
    database: {
      generateId: () => {
        // Custom ID generation if needed
        return crypto.randomUUID();
      },
    },
  },
  // Rate limiting (recommended for production)
  rateLimit: {
    window: 15 * 60, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 100 : 1000, // requests per window
    storage: "memory", // Use "redis" in production for distributed systems
  },

  // Logger configuration
  logger: {
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
    disabled: false,
  },
  // Error handling
  onError: (error: any) => {
    log.auth.error("[AUTH ERROR]", error);
    // You can add error reporting service here (e.g., Sentry)

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === "production") {
      return {
        message: "An error occurred during authentication",
        status: 500,
      };
    }

    return {
      message: error.message,
      status: error.status || 500,
    };
  },
  // Add callback handlers
  callbacks: {
    signIn: {
      async before({ user, isNewUser }) {
        log.auth.debug("[AUTH CALLBACK] Sign in before", { userId: user?.id, isNewUser });
        // For new social users, set a temporary role and mark for profile completion
        if (isNewUser) {
          // Set a temporary role that indicates profile completion is needed
          user.role = 'guest'; // Temporary role until they complete profile
          // New OAuth users need to complete their profile
          user.needsProfileCompletion = true;
          log.auth.debug("[AUTH CALLBACK] New OAuth user, setting needsProfileCompletion=true, role=guest");
        }
      },
      async after({ user, session, request }) {
        log.auth.login("[AUTH CALLBACK] Sign in after", { userId: user?.id, sessionId: session?.id });
        
        // Check if this is a mobile OAuth callback
        const userAgent = request.headers.get('user-agent') || '';
        const isMobileOAuth = userAgent.includes('Expo') || userAgent.includes('okhttp');
        
        if (isMobileOAuth && session) {
          log.auth.debug("[AUTH CALLBACK] Mobile OAuth detected, redirecting to success page");
          // For mobile OAuth, redirect to a success page that opens the app
          return {
            redirect: true,
            url: `/api/auth/mobile-oauth-success?token=${session.token}`,
          };
        }
        
        // Default behavior for web
        return { user, session };
      },
    },
  },
});

// Log Better Auth initialization
if (process.env.NODE_ENV === "development") {
  log.auth.debug("[AUTH] Better Auth initialized", { 
    hasHandler: typeof auth.handler === 'function',
    hasApi: !!auth.api,
    apiKeys: auth.api ? Object.keys(auth.api) : [],
    baseURL: getBaseURL()
  });
}

// Export type for use in other files
export type Auth = typeof auth;
