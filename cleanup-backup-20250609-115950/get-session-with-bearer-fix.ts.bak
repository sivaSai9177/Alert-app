import { auth } from './auth-server';
import { db } from '@/src/db';
import { session as sessionTable, user as userTable } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import type { Session, User } from 'better-auth/types';

/**
 * Enhanced session retrieval that works with Expo Go
 * This version directly queries the database when Better Auth fails
 */
export async function getSessionWithBearerFix(headers: Headers): Promise<{
  session: Session;
  user: User;
} | null> {
  try {
// TODO: Replace with structured logging - console.log('[SESSION FIX] getSessionWithBearerFix called');
    
    // First try standard Better Auth approach
    const cookieSession = await auth.api.getSession({ headers });
    if (cookieSession) {
// TODO: Replace with structured logging - console.log('[SESSION FIX] Found session via cookie');
      return cookieSession;
    }

    // Check for Bearer token
    const authHeader = headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
// TODO: Replace with structured logging - console.log('[SESSION FIX] No Bearer token found');
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
// TODO: Replace with structured logging - console.log('[SESSION FIX] Trying Bearer token:', token.substring(0, 20) + '...');
    
    // Try Better Auth with cookie format first
    const modifiedHeaders = new Headers(headers);
    modifiedHeaders.set('cookie', `better-auth.session-token=${token}`);
    
    const bearerSession = await auth.api.getSession({ 
      headers: modifiedHeaders 
    });
    
    if (bearerSession) {
// TODO: Replace with structured logging - console.log('[SESSION FIX] Found session via Bearer token with Better Auth');
      return bearerSession;
    }

    // If Better Auth fails, query the database directly
// TODO: Replace with structured logging - console.log('[SESSION FIX] Better Auth failed, querying database directly');
    
    const sessionData = await db
      .select({
        session: sessionTable,
        user: userTable,
      })
      .from(sessionTable)
      .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
      .where(eq(sessionTable.token, token))
      .limit(1);

    if (sessionData.length === 0) {
// TODO: Replace with structured logging - console.log('[SESSION FIX] No session found in database');
      return null;
    }

    const { session, user } = sessionData[0];
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
// TODO: Replace with structured logging - console.log('[SESSION FIX] Session expired');
      return null;
    }

// TODO: Replace with structured logging - console.log('[SESSION FIX] Found valid session in database');
    
    // Return in Better Auth format
    return {
      session: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        token: session.token,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      } as Session,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Include custom fields
        role: user.role,
        organizationId: user.organizationId,
        needsProfileCompletion: user.needsProfileCompletion,
      } as User,
    };
  } catch (error) {
    console.error('[SESSION FIX] Error retrieving session:', error);
    return null;
  }
}