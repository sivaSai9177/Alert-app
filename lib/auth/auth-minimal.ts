import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/src/db";
import * as schema from "../../src/db/schema";

// Minimal auth configuration for testing
export const authMinimal = betterAuth({
  baseURL: "http://localhost:8081/api/auth",
  secret: process.env.BETTER_AUTH_SECRET || "test-secret",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  // Minimal configuration - no plugins
});