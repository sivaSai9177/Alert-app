// Working auth handler with no problematic imports
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, multiSession, organization, admin } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/src/db/schema";

// Create database connection inline
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
const db = drizzle(pool);

// Create auth instance
const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:8081/api/auth-working',
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
  disableCsrf: process.env.NODE_ENV === "development",
  
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        scope: ["openid", "email", "profile"],
      },
    }),
  },
  
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: null,
      },
      organizationId: {
        type: "string",
        required: false,
      },
      needsProfileCompletion: {
        type: "boolean",
        required: true,
        defaultValue: true,
      },
    },
  },
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema },
  }),
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
    },
  },
  
  cookies: {
    sessionToken: {
      name: "better-auth.session-token",
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  
  plugins: [
    oAuthProxy(),
    multiSession({ maximumSessions: 5 }),
    organization({
      allowUserToCreateOrganization: true,
      membershipLimits: {
        'free': 5,
        'pro': 50,
        'enterprise': -1,
      }
    }),
    admin({
      defaultRole: 'user',
      adminUserIds: process.env.ADMIN_USER_IDS?.split(',') || []
    })
  ],
  
  trustedOrigins: () => true, // Accept all origins in development
  
  rateLimit: {
    window: 15 * 60,
    max: 1000,
    storage: "memory",
  },
});

// Handler function
async function handler(request: Request) {
  const origin = request.headers.get('origin') || '*';
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const response = await auth.handler(request);
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error: any) {
    console.error('[AUTH WORKING] Handler error:', error.message);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }), 
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as OPTIONS };