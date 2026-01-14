/**
 * Authentication Module Exports
 * Centralized authentication functionality for the app
 */

// Core authentication setup
// Note: Server-side auth should be imported directly from './auth-server'
export { authClient } from './auth-client';
export type { AuthClient } from './auth-client';

// Session management
export { sessionManager } from './session-manager';
export { mobileTokenStore } from './mobile-token-store';

// Server-side utilities for Expo Go compatibility
export { getSessionWithBearerFix } from './get-session-with-bearer-fix';

// Types
export type { Session, User } from 'better-auth/types';