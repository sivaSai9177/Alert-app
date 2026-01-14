/**
 * Server-only auth configuration
 * This file is safe to import in Node.js environments
 */

import { db } from "@/src/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, multiSession, organization, admin } from "better-auth/plugins";
import * as schema from "../../src/db/schema";

// Server-safe environment configuration
const getBaseURL = () => {
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
};

const getTrustedOrigins = () => {
  const origins = [
    "http://localhost:8081",
    "http://localhost:8082", 
    "http://localhost:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:3000",
  ];

  // Add environment-specific origins
  if (process.env.EXPO_PUBLIC_API_URL) {
    origins.push(process.env.EXPO_PUBLIC_API_URL);
  }
  if (process.env.BETTER_AUTH_URL) {
    origins.push(process.env.BETTER_AUTH_URL);
  }

  // Add ngrok URLs if present
  const ngrokUrl = process.env.EXPO_PUBLIC_NGROK_URL;
  if (ngrokUrl) {
    origins.push(ngrokUrl);
    origins.push(`${ngrokUrl}/api/auth`);
  }

  // Add dynamic origins from environment
  if (process.env.EXPO_PUBLIC_ALLOWED_ORIGINS) {
    origins.push(...process.env.EXPO_PUBLIC_ALLOWED_ORIGINS.split(','));
  }

  // In development, accept dynamic origins
  if (process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'local') {
    return (origin: string) => {
      // Accept localhost and private IPs in development
      if (origin.includes('localhost') || 
          origin.includes('127.0.0.1') ||
          origin.includes('192.168.') ||
          origin.includes('10.0.') ||
          origin.includes('.local') ||
          origin.includes('.exp.direct') ||
          origin.includes('ngrok')) {
        return true;
      }
      return origins.includes(origin);
    };
  }

  return origins;
};

export const auth = betterAuth({
  appName: "hospital-alert-system",
  baseURL: getBaseURL(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      organization: schema.organizations,
      member: schema.members,
      invitation: schema.invitations,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
      redirectURI: `${getBaseURL()}/api/auth/callback/google`,
      enabled: !!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "placeholder",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: getTrustedOrigins(),
  advanced: {
    generateId: () => crypto.randomUUID(),
    crossSubDomainCookies: {
      enabled: false,
    },
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    disableCSRFCheck: process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'local',
  },
  logger: {
    disabled: false,
    level: "info",
  },
  plugins: [
    oAuthProxy(),
    multiSession(),
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      creatorRole: "admin",
      membershipLimit: 100,
    }),
    admin(),
  ],
});