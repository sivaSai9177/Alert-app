import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@/lib/auth';
import type { Session, User } from 'better-auth';
import { log , trpcLogger } from '@/lib/core';

// Base context type for tRPC procedures
export interface Context {
  session: {
    session: Session;
    user: User;
  } | null;
  req: Request;
}

// Enhanced context type for protected procedures
export interface AuthenticatedContext extends Context {
  session: {
    session: Session;
    user: User;
  };
  user: User;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Create context function
export async function createContext(req: Request): Promise<Context> {
  try {
    // Get session from Better Auth with improved error handling
    const sessionData = await auth.api.getSession({
      headers: req.headers,
    });

    // Log session status for debugging
    if (sessionData) {
      log.auth.debug('Session found in tRPC context', {
        userId: sessionData.user?.id,
        sessionId: sessionData.session?.id,
        userAgent: req.headers.get('user-agent'),
      });
    } else {
      log.auth.debug('No session found in tRPC context', {
        hasAuthHeader: !!req.headers.get('authorization'),
        hasCookieHeader: !!req.headers.get('cookie'),
        userAgent: req.headers.get('user-agent'),
        url: req.url,
      });
    }

    return {
      session: sessionData,
      req,
    };
  } catch (err) {
    // If session fetch fails, return null session
    log.auth.error('Session fetch error in tRPC context', err);
    return {
      session: null,
      req,
    };
  }
}

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Enhanced logging middleware with structured logging
const loggingMiddleware = t.middleware(async ({ path, type, next, ctx, input }) => {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  // Log request start using advanced logger
  trpcLogger.logRequestStart(path, type, ctx, input, requestId);
  
  try {
    const result = await next();
    const durationMs = Date.now() - start;
    
    // Log successful response using advanced logger
    trpcLogger.logRequestSuccess(path, type, result, durationMs, requestId);
    
    return result;
  } catch (error) {
    const durationMs = Date.now() - start;
    
    // Log error response using advanced logger
    trpcLogger.logRequestError(path, type, error, durationMs, requestId);
    
    throw error;
  }
});

// Audit middleware for compliance and security
const auditMiddleware = t.middleware(async ({ path, type, ctx, next }) => {
  const start = Date.now();
  
  try {
    const result = await next();
    const durationMs = Date.now() - start;
    
    // Import audit service dynamically to avoid circular dependencies
    const { auditService, AuditAction, AuditOutcome, AuditSeverity, auditHelpers } = await import('./services/audit');
    const context = auditHelpers.extractContext(ctx.req, ctx.session);
    
    // Log successful API access
    await auditService.log({
      action: AuditAction.API_ACCESS,
      outcome: AuditOutcome.SUCCESS,
      entityType: 'api_endpoint',
      entityId: path,
      description: `${type.toUpperCase()} ${path} completed successfully`,
      metadata: {
        type,
        path,
        durationMs,
        resultSize: typeof result === 'object' ? JSON.stringify(result).length : 0,
      },
      severity: 'INFO' as any,
    }, context);
    
    return result;
  } catch (error) {
    const durationMs = Date.now() - start;
    
    // Import audit service dynamically
    const { auditService, AuditAction, AuditOutcome, auditHelpers } = await import('./services/audit');
    const context = auditHelpers.extractContext(ctx.req, ctx.session);
    
    // Log failed API access
    await auditService.log({
      action: AuditAction.API_ACCESS,
      outcome: AuditOutcome.FAILURE,
      entityType: 'api_endpoint',
      entityId: path,
      description: `${type.toUpperCase()} ${path} failed`,
      metadata: {
        type,
        path,
        durationMs,
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof TRPCError ? error.code : 'UNKNOWN',
      },
      severity: 'WARNING' as any,
      alertGenerated: error instanceof TRPCError && error.code === 'UNAUTHORIZED',
    }, context);
    
    throw error;
  }
});

// Performance monitoring middleware
const performanceMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = performance.now();
  
  try {
    const result = await next();
    const duration = performance.now() - start;
    
    // Log slow requests (over 1 second)
    if (duration > 1000) {
      log.warn('Slow tRPC request detected', 'PERFORMANCE', {
        path,
        type,
        duration: Math.round(duration),
        threshold: 1000,
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    // Log performance data even for failed requests
    log.debug('tRPC request performance', 'PERFORMANCE', {
      path,
      type,
      duration: Math.round(duration),
      failed: true,
    });
    
    throw error;
  }
});

// Rate limiting middleware (basic implementation)
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  // In production, implement proper rate limiting with Redis
  // This is a basic example for the starter template
  return next();
});

// Enhanced authentication middleware following tRPC best practices
const authMiddleware = t.middleware(async ({ ctx, next, path }) => {
  if (!ctx.session) {
    trpcLogger.logAuthEvent('unauthorized_access', path, ctx);
    throw new TRPCError({ 
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }
  
  trpcLogger.logAuthEvent('authenticated_access', path, ctx);
  
  // Enhance context with type-safe user data
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
      // Add helper functions for authorization checks
      hasRole: (role: string) => (ctx.session.user as any).role === role,
      hasPermission: (permission: string) => {
        const userRole = (ctx.session.user as any).role || 'user';
        const rolePermissions: Record<string, string[]> = {
          admin: ['*'], // Admin can access everything
          manager: ['manage_users', 'view_analytics', 'manage_content'],
          user: ['view_content', 'edit_profile'],
          guest: ['view_content'],
        };
        const permissions = rolePermissions[userRole] || [];
        return permissions.includes('*') || permissions.includes(permission);
      },
    },
  });
});

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure
  .use(performanceMiddleware)
  .use(loggingMiddleware)
  .use(auditMiddleware)
  .use(authMiddleware);

// Role-based procedure factory
export const createRoleProcedure = (allowedRoles: string[]) => {
  return protectedProcedure.use(async ({ ctx, next, path }) => {
    const userRole = (ctx.session.user as any).role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      trpcLogger.logAuthEvent('insufficient_permissions', path, ctx, {
        userRole,
        requiredRoles: allowedRoles,
      });
      
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }
    
    trpcLogger.logAuthEvent('role_authorized', path, ctx, {
      userRole,
      allowedRoles,
    });
    
    return next({ ctx });
  });
};

// Public procedure with logging and audit
export const publicProcedureWithLogging = t.procedure
  .use(performanceMiddleware)
  .use(loggingMiddleware)
  .use(auditMiddleware);

// Specific role-based procedures
export const adminProcedure = createRoleProcedure(['admin']);
export const managerProcedure = createRoleProcedure(['admin', 'manager']);
export const userProcedure = createRoleProcedure(['admin', 'manager', 'user']);

// Permission-based procedure factory (more granular than roles)
export const createPermissionProcedure = (requiredPermission: string) => {
  return protectedProcedure.use(async ({ ctx, next, path }) => {
    if (!ctx.hasPermission(requiredPermission)) {
      trpcLogger.logAuthEvent('insufficient_permissions', path, ctx, {
        userRole: (ctx.session.user as any).role,
        requiredPermission,
      });
      
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access denied. Required permission: ${requiredPermission}`
      });
    }
    
    trpcLogger.logAuthEvent('permission_authorized', path, ctx, {
      userRole: (ctx.session.user as any).role,
      requiredPermission,
    });
    
    return next({ ctx });
  });
};

// Common permission-based procedures
export const viewContentProcedure = createPermissionProcedure('view_content');
export const manageUsersProcedure = createPermissionProcedure('manage_users');
export const viewAnalyticsProcedure = createPermissionProcedure('view_analytics');
export const manageContentProcedure = createPermissionProcedure('manage_content');