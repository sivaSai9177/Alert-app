import { auth } from './auth';
import type { Session, User } from 'better-auth/types';
import { log } from '@/lib/core/logger';

/**
 * Enhanced session retrieval that checks both cookies and Authorization header
 * This is necessary because Better Auth's getSession doesn't automatically check Bearer tokens
 */
export async function getSessionWithBearer(headers: Headers): Promise<{
  session: Session;
  user: User;
} | null> {
  try {
log.debug('[SESSION] getSessionWithBearer called with headers:', 'SESSION', {
      authorization: headers.get('authorization'),
      cookie: headers.get('cookie')?.substring(0, 50) + '...',
    });
    
    // First try standard cookie-based auth
    const cookieSession = await auth.api.getSession({ headers });
    if (cookieSession) {
log.debug('[SESSION] Found session via cookie', 'SESSION');
      return cookieSession;
    }

    // If no cookie session, check for Bearer token
    const authHeader = headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
log.debug('[SESSION] No Bearer token found', 'SESSION');
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
log.debug('[SESSION] Trying Bearer token:', 'SESSION', { token: token.substring(0, 20) + '...' });
    
    // Better Auth expects the token in a cookie format
    // Create a new headers object with the token as a cookie
    const modifiedHeaders = new Headers(headers);
    modifiedHeaders.set('cookie', `better-auth.session-token=${token}`);
    
    // Try to get session with the modified headers
    const bearerSession = await auth.api.getSession({ 
      headers: modifiedHeaders 
    });
    
    if (bearerSession) {
log.debug('[SESSION] Found session via Bearer token', 'SESSION');
    } else {
log.debug('[SESSION] No session found with Bearer token', 'SESSION');
    }
    
    return bearerSession;
  } catch (error) {
    log.error('[SESSION] Error retrieving session', 'SESSION', error);
    return null;
  }
}