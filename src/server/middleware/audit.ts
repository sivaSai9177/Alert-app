import { TRPCError } from '@trpc/server';
import { auditService, AuditAction, AuditOutcome, auditHelpers } from '../services/audit';
import type { Context } from '../trpc';

/**
 * Audit middleware for tRPC procedures
 * Automatically logs all API operations for compliance and security monitoring
 */
export const auditMiddleware = {
  /**
   * General audit middleware for all procedures
   */
  general: async (opts: {
    path: string;
    type: string;
    ctx: Context;
    next: () => Promise<any>;
  }) => {
    const { path, type, ctx, next } = opts;
    const start = Date.now();
    const context = auditHelpers.extractContext(ctx.req, ctx.session);
    
    try {
      // Execute the procedure
      const result = await next();
      const durationMs = Date.now() - start;
      
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
          resultSize: JSON.stringify(result).length,
        },
        severity: 'INFO',
      }, context);
      
      return result;
    } catch (error) {
      const durationMs = Date.now() - start;
      
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
        severity: 'WARNING',
        alertGenerated: error instanceof TRPCError && error.code === 'UNAUTHORIZED',
      }, context);
      
      throw error;
    }
  },

  /**
   * Authentication-specific audit middleware
   */
  auth: async (opts: {
    path: string;
    type: string;
    ctx: Context;
    next: () => Promise<any>;
    input?: any;
  }) => {
    const { path, type, ctx, next, input } = opts;
    const context = auditHelpers.extractContext(ctx.req, ctx.session);
    
    // Determine the audit action based on the path
    let auditAction: AuditAction;
    switch (path) {
      case 'auth.signIn':
        auditAction = AuditAction.LOGIN;
        break;
      case 'auth.signUp':
        auditAction = AuditAction.USER_CREATED;
        break;
      case 'auth.signOut':
        auditAction = AuditAction.LOGOUT;
        break;
      case 'auth.updateProfile':
        auditAction = AuditAction.USER_UPDATED;
        break;
      case 'auth.changePassword':
        auditAction = AuditAction.PASSWORD_CHANGED;
        break;
      case 'auth.resetPassword':
        auditAction = AuditAction.PASSWORD_RESET;
        break;
      default:
        auditAction = AuditAction.SYSTEM_ACCESS;
    }
    
    try {
      const result = await next();
      
      // Log successful authentication action
      await auditService.logAuth(
        auditAction as any,
        AuditOutcome.SUCCESS,
        context,
        {
          twoFactorUsed: input?.twoFactorCode ? true : false,
        }
      );
      
      return result;
    } catch (error) {
      // Log failed authentication action
      await auditService.logAuth(
        auditAction as any,
        AuditOutcome.FAILURE,
        context,
        {
          reason: error instanceof Error ? error.message : String(error),
          attemptCount: 1, // Could be enhanced to track actual attempt count
        }
      );
      
      throw error;
    }
  },

  /**
   * Data access audit middleware for sensitive operations
   */
  dataAccess: (sensitiveData: boolean = false) => {
    return async (opts: {
      path: string;
      type: string;
      ctx: Context;
      next: () => Promise<any>;
      input?: any;
    }) => {
      const { path, type, ctx, next, input } = opts;
      const context = auditHelpers.extractContext(ctx.req, ctx.session);
      
      // Determine the audit action based on operation type
      let auditAction: AuditAction;
      if (type === 'query') {
        auditAction = AuditAction.DATA_VIEWED;
      } else if (type === 'mutation') {
        if (path.includes('create')) {
          auditAction = AuditAction.DATA_CREATED;
        } else if (path.includes('update')) {
          auditAction = AuditAction.DATA_UPDATED;
        } else if (path.includes('delete')) {
          auditAction = AuditAction.DATA_DELETED;
        } else {
          auditAction = AuditAction.DATA_UPDATED;
        }
      } else {
        auditAction = AuditAction.API_ACCESS;
      }
      
      try {
        const result = await next();
        
        // Log successful data access
        await auditService.logDataAccess(
          auditAction,
          AuditOutcome.SUCCESS,
          'data',
          input?.id || 'unknown',
          context,
          `Business operation: ${path}`,
          sensitiveData
        );
        
        return result;
      } catch (error) {
        // Log failed data access
        await auditService.logDataAccess(
          auditAction,
          AuditOutcome.FAILURE,
          'data',
          input?.id || 'unknown',
          context,
          `Failed operation: ${path}`,
          sensitiveData
        );
        
        throw error;
      }
    };
  },

  /**
   * User management audit middleware
   */
  userManagement: async (opts: {
    path: string;
    type: string;
    ctx: Context;
    next: () => Promise<any>;
    input?: any;
  }) => {
    const { path, type, ctx, next, input } = opts;
    const context = auditHelpers.extractContext(ctx.req, ctx.session);
    
    // Capture before state for update operations
    let beforeState: any = null;
    if (input?.id && (path.includes('update') || path.includes('delete'))) {
      try {
        // This would need to be implemented based on your user service
        // beforeState = await getUserById(input.id);
      } catch (error) {
        // Continue if we can't get before state
      }
    }
    
    try {
      const result = await next();
      
      // Determine audit action
      let auditAction: AuditAction;
      if (path.includes('create')) {
        auditAction = AuditAction.USER_CREATED;
      } else if (path.includes('update')) {
        auditAction = AuditAction.USER_UPDATED;
      } else if (path.includes('delete')) {
        auditAction = AuditAction.USER_DELETED;
      } else if (path.includes('role')) {
        auditAction = AuditAction.USER_ROLE_CHANGED;
      } else {
        auditAction = AuditAction.USER_UPDATED;
      }
      
      // Log successful user management action
      await auditService.logUserManagement(
        auditAction,
        AuditOutcome.SUCCESS,
        input?.id || result?.id || 'unknown',
        context,
        beforeState,
        result
      );
      
      return result;
    } catch (error) {
      // Log failed user management action
      await auditService.logUserManagement(
        AuditAction.USER_UPDATED,
        AuditOutcome.FAILURE,
        input?.id || 'unknown',
        context,
        beforeState,
        null
      );
      
      throw error;
    }
  },

  /**
   * Security monitoring middleware for suspicious activities
   */
  security: async (opts: {
    path: string;
    type: string;
    ctx: Context;
    next: () => Promise<any>;
    input?: any;
  }) => {
    const { path, type, ctx, next, input } = opts;
    const context = auditHelpers.extractContext(ctx.req, ctx.session);
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      // Multiple failed login attempts from same IP
      // Unusual access patterns
      // Privilege escalation attempts
      // Data export operations
    ];
    
    // Rate limiting check
    const isRateLimited = await checkRateLimit(context.ipAddress || '', path);
    if (isRateLimited) {
      await auditService.logSecurityViolation(
        `Rate limit exceeded for ${path}`,
        context,
        { path, type, attempts: 'exceeded' }
      );
      
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded',
      });
    }
    
    // Check for unauthorized access patterns
    if (ctx.session?.user && path.includes('admin') && ctx.session.user.role !== 'admin') {
      await auditService.logSecurityViolation(
        `Unauthorized admin access attempt: ${path}`,
        context,
        { path, userRole: ctx.session.user.role }
      );
    }
    
    return next();
  },
};

/**
 * Simple rate limiting implementation
 * In production, use Redis or a proper rate limiting service
 */
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

async function checkRateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): Promise<boolean> {
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const current = rateLimitStore.get(key);
  
  if (!current || current.resetTime < windowStart) {
    // New window or expired
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (current.count >= maxRequests) {
    return true; // Rate limited
  }
  
  current.count++;
  return false;
}

/**
 * Clean up expired rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export default auditMiddleware;