import { z } from 'zod';
import { db } from '@/src/db';
import { auditLog } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { nanoid } from 'nanoid';

// Audit action types enum for type safety
export enum AuditAction {
  // Authentication actions
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  
  // User management actions
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  PROFILE_COMPLETED = 'PROFILE_COMPLETED',
  PROFILE_VIEWED = 'PROFILE_VIEWED',
  
  // Data access actions
  DATA_VIEWED = 'DATA_VIEWED',
  DATA_CREATED = 'DATA_CREATED',
  DATA_UPDATED = 'DATA_UPDATED',
  DATA_DELETED = 'DATA_DELETED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_IMPORTED = 'DATA_IMPORTED',
  
  // Content management actions
  CONTENT_CREATED = 'CONTENT_CREATED',
  CONTENT_UPDATED = 'CONTENT_UPDATED',
  CONTENT_DELETED = 'CONTENT_DELETED',
  CONTENT_PUBLISHED = 'CONTENT_PUBLISHED',
  CONTENT_UNPUBLISHED = 'CONTENT_UNPUBLISHED',
  
  // System actions
  SYSTEM_ACCESS = 'SYSTEM_ACCESS',
  CONFIGURATION_CHANGED = 'CONFIGURATION_CHANGED',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  API_ACCESS = 'API_ACCESS',
  
  // Audit actions
  AUDIT_LOG_ACCESSED = 'AUDIT_LOG_ACCESSED',
  AUDIT_LOG_EXPORTED = 'AUDIT_LOG_EXPORTED',
  
  // Organization actions
  ORGANIZATION_CREATED = 'ORGANIZATION_CREATED',
  ORGANIZATION_UPDATED = 'ORGANIZATION_UPDATED',
  ORGANIZATION_DELETED = 'ORGANIZATION_DELETED',
}

export enum AuditOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// Audit log entry schema for validation
export const auditEntrySchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  action: z.nativeEnum(AuditAction),
  outcome: z.nativeEnum(AuditOutcome),
  resource: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  userRole: z.string().optional(),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  platform: z.enum(['ios', 'android', 'web']).optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  beforeState: z.record(z.any()).optional(),
  afterState: z.record(z.any()).optional(),
  reasonCode: z.string().optional(),
  accessJustification: z.string().optional(),
  sensitiveDataAccessed: z.boolean().default(false),
  department: z.string().optional(),
  organizationId: z.string().optional(),
  severity: z.nativeEnum(AuditSeverity).default(AuditSeverity.INFO),
  alertGenerated: z.boolean().default(false),
  applicationVersion: z.string().optional(),
  requestId: z.string().optional(),
  traceId: z.string().optional(),
});

export type AuditEntry = z.infer<typeof auditEntrySchema>;

interface AuditContext {
  userId?: string;
  sessionId?: string;
  userRole?: string;
  userName?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  platform?: 'ios' | 'android' | 'web';
  department?: string;
  organizationId?: string;
  requestId?: string;
  traceId?: string;
}

export class AuditService {
  private static instance: AuditService;
  private readonly applicationVersion: string;
  private readonly retentionYears: number;
  
  private constructor() {
    this.applicationVersion = process.env.APP_VERSION || '1.0.0';
    this.retentionYears = parseInt(process.env.AUDIT_RETENTION_YEARS || '7'); // Default 7 years
  }
  
  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }
  
  /**
   * Log an audit event with business compliance features
   */
  async log(entry: AuditEntry, context?: AuditContext): Promise<string> {
    try {
      // Generate unique ID
      const id = nanoid();
      
      // For development: temporarily disable actual database logging to prevent crashes
      if (process.env.NODE_ENV === 'development') {
          id,
          action: entry.action,
          outcome: entry.outcome,
          description: entry.description,
          timestamp: new Date().toISOString(),
        });
        return id;
      }
      
      // Validate the entry
      const validatedEntry = auditEntrySchema.parse(entry);
      
      const timestamp = new Date();
      
      // Calculate retention date (configurable years for business compliance)
      const retentionUntil = new Date();
      retentionUntil.setFullYear(retentionUntil.getFullYear() + this.retentionYears);
      
      // Merge context data
      const auditData = {
        id,
        ...validatedEntry,
        ...context,
        timestamp,
        retentionUntil,
        applicationVersion: this.applicationVersion,
        metadata: validatedEntry.metadata ? JSON.stringify(validatedEntry.metadata) : null,
        beforeState: validatedEntry.beforeState ? JSON.stringify(validatedEntry.beforeState) : null,
        afterState: validatedEntry.afterState ? JSON.stringify(validatedEntry.afterState) : null,
      };
      
      // Generate checksum for tamper detection
      const checksum = this.generateChecksum(auditData);
      auditData.checksum = checksum;
      
      // Store in database - handle potential schema mismatches gracefully
      try {
        await db.insert(auditLog).values(auditData);
      } catch (dbError: any) {
        // If there's a column mismatch, remove sessionId and try again
        if (dbError.message?.includes('session_id') && dbError.message?.includes('does not exist')) {
          console.warn('[AUDIT] Retrying without sessionId due to schema mismatch');
          const { sessionId, ...auditDataWithoutSessionId } = auditData;
          await db.insert(auditLog).values(auditDataWithoutSessionId);
        } else {
          throw dbError;
        }
      }
      
      // Log critical events to console for immediate monitoring
      if (validatedEntry.severity === AuditSeverity.CRITICAL || validatedEntry.severity === AuditSeverity.ERROR) {
        console.error(`[AUDIT CRITICAL] ${validatedEntry.action}: ${validatedEntry.description || 'No description'}`, {
          userId: context?.userId,
          action: validatedEntry.action,
          outcome: validatedEntry.outcome,
          timestamp: timestamp.toISOString(),
        });
      }
      
      return id;
    } catch (error) {
      // Audit logging should never fail silently
      console.error('[AUDIT SERVICE ERROR] Failed to log audit event:', error);
      console.error('[AUDIT SERVICE ERROR] Original entry:', entry);
      
      // Try to log the audit failure itself
      try {
        await this.logSystemError('AUDIT_LOG_FAILED', error as Error, context);
      } catch (secondaryError) {
        console.error('[AUDIT SERVICE CRITICAL] Failed to log audit failure:', secondaryError);
      }
      
      throw new Error('Audit logging failed');
    }
  }
  
  /**
   * Log authentication events
   */
  async logAuth(
    action: AuditAction.LOGIN | AuditAction.LOGOUT | AuditAction.LOGIN_FAILED,
    outcome: AuditOutcome,
    context: AuditContext,
    details?: {
      reason?: string;
      attemptCount?: number;
      twoFactorUsed?: boolean;
    }
  ): Promise<string> {
    return this.log({
      action,
      outcome,
      entityType: 'user',
      entityId: context.userId,
      description: this.generateAuthDescription(action, outcome, details),
      metadata: {
        twoFactorUsed: details?.twoFactorUsed,
        attemptCount: details?.attemptCount,
        reason: details?.reason,
      },
      severity: outcome === AuditOutcome.FAILURE ? AuditSeverity.WARNING : AuditSeverity.INFO,
      alertGenerated: outcome === AuditOutcome.FAILURE && (details?.attemptCount || 0) > 3,
    }, context);
  }
  
  /**
   * Log user management events
   */
  async logUserManagement(
    action: AuditAction,
    outcome: AuditOutcome,
    targetUserId: string,
    context: AuditContext,
    beforeState?: any,
    afterState?: any
  ): Promise<string> {
    return this.log({
      action,
      outcome,
      entityType: 'user',
      entityId: targetUserId,
      description: this.generateUserManagementDescription(action, outcome),
      beforeState,
      afterState,
      severity: this.getUserManagementSeverity(action),
    }, context);
  }
  
  /**
   * Log data access events (for sensitive business data)
   */
  async logDataAccess(
    action: AuditAction,
    outcome: AuditOutcome,
    entityType: string,
    entityId: string,
    context: AuditContext,
    accessJustification?: string,
    sensitiveDataAccessed: boolean = false
  ): Promise<string> {
    return this.log({
      action,
      outcome,
      entityType,
      entityId,
      sensitiveDataAccessed,
      accessJustification,
      description: this.generateDataAccessDescription(action, entityType, entityId),
      severity: sensitiveDataAccessed ? AuditSeverity.WARNING : AuditSeverity.INFO,
      reasonCode: 'BUSINESS_OPERATION', // Default reason for data access
    }, context);
  }
  
  /**
   * Log content management events
   */
  async logContentManagement(
    action: AuditAction,
    outcome: AuditOutcome,
    contentId: string,
    context: AuditContext,
    beforeState?: any,
    afterState?: any
  ): Promise<string> {
    return this.log({
      action,
      outcome,
      entityType: 'content',
      entityId: contentId,
      description: this.generateContentDescription(action, outcome),
      beforeState,
      afterState,
      severity: AuditSeverity.INFO,
    }, context);
  }
  
  /**
   * Log system errors
   */
  async logSystemError(
    action: string,
    error: Error,
    context?: AuditContext
  ): Promise<string> {
    return this.log({
      action: AuditAction.SYSTEM_ACCESS,
      outcome: AuditOutcome.FAILURE,
      description: `System error: ${action} - ${error.message}`,
      metadata: {
        error: error.message,
        stack: error.stack,
        action,
      },
      severity: AuditSeverity.ERROR,
      alertGenerated: true,
    }, context);
  }
  
  /**
   * Log security violations
   */
  async logSecurityViolation(
    description: string,
    context: AuditContext,
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.log({
      action: AuditAction.SECURITY_VIOLATION,
      outcome: AuditOutcome.FAILURE,
      description,
      metadata,
      severity: AuditSeverity.CRITICAL,
      alertGenerated: true,
    }, context);
  }
  
  /**
   * Generate tamper-evident checksum
   */
  private generateChecksum(data: any): string {
    // Create deterministic string from audit data
    const checksumData = {
      id: data.id,
      userId: data.userId,
      action: data.action,
      outcome: data.outcome,
      timestamp: data.timestamp?.toISOString(),
      entityType: data.entityType,
      entityId: data.entityId,
    };
    
    const dataString = JSON.stringify(checksumData, Object.keys(checksumData).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }
  
  /**
   * Verify audit log integrity
   */
  async verifyIntegrity(auditLogId: string): Promise<boolean> {
    try {
      const [logEntry] = await db.select().from(auditLog).where(eq(auditLog.id, auditLogId));
      
      if (!logEntry) {
        return false;
      }
      
      const expectedChecksum = this.generateChecksum(logEntry);
      return logEntry.checksum === expectedChecksum;
    } catch (error) {
      console.error('[AUDIT SERVICE] Integrity verification failed:', error);
      return false;
    }
  }
  
  /**
   * Generate human-readable descriptions
   */
  private generateAuthDescription(
    action: AuditAction,
    outcome: AuditOutcome,
    details?: any
  ): string {
    const baseAction = action.toLowerCase().replace('_', ' ');
    const outcomeText = outcome === AuditOutcome.SUCCESS ? 'successful' : 'failed';
    
    let description = `${outcomeText} ${baseAction}`;
    
    if (details?.twoFactorUsed) {
      description += ' with 2FA';
    }
    
    if (details?.attemptCount && details.attemptCount > 1) {
      description += ` (attempt ${details.attemptCount})`;
    }
    
    if (details?.reason) {
      description += ` - ${details.reason}`;
    }
    
    return description.charAt(0).toUpperCase() + description.slice(1);
  }
  
  private generateUserManagementDescription(action: AuditAction, outcome: AuditOutcome): string {
    const actionText = action.toLowerCase().replace('_', ' ');
    const outcomeText = outcome === AuditOutcome.SUCCESS ? 'successfully' : 'failed to';
    return `${outcomeText} ${actionText}`.charAt(0).toUpperCase() + `${outcomeText} ${actionText}`.slice(1);
  }
  
  private generateDataAccessDescription(action: AuditAction, entityType: string, entityId: string): string {
    const actionText = action.toLowerCase().replace('_', ' ');
    return `${actionText} ${entityType} ${entityId}`.charAt(0).toUpperCase() + `${actionText} ${entityType} ${entityId}`.slice(1);
  }
  
  private generateContentDescription(action: AuditAction, outcome: AuditOutcome): string {
    const actionText = action.toLowerCase().replace('_', ' ');
    const outcomeText = outcome === AuditOutcome.SUCCESS ? 'successfully' : 'failed to';
    return `${outcomeText} ${actionText}`.charAt(0).toUpperCase() + `${outcomeText} ${actionText}`.slice(1);
  }
  
  private getUserManagementSeverity(action: AuditAction): AuditSeverity {
    const criticalActions = [
      AuditAction.USER_DELETED,
      AuditAction.USER_ROLE_CHANGED,
      AuditAction.ACCOUNT_LOCKED,
    ];
    
    return criticalActions.includes(action) ? AuditSeverity.WARNING : AuditSeverity.INFO;
  }
}

// Export singleton instance
export const auditService = AuditService.getInstance();

// Helper functions for common audit scenarios
export const auditHelpers = {
  /**
   * Extract audit context from request
   */
  extractContext(req: Request, session?: any): AuditContext {
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Determine platform from user agent
    let platform: 'ios' | 'android' | 'web' = 'web';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      platform = 'ios';
    } else if (userAgent.includes('Android')) {
      platform = 'android';
    }
    
    return {
      userId: session?.user?.id,
      sessionId: session?.session?.id,
      userRole: session?.user?.role,
      userName: session?.user?.name,
      userEmail: session?.user?.email,
      ipAddress,
      userAgent,
      platform,
      department: session?.user?.department,
      organizationId: session?.user?.organizationId,
      requestId: nanoid(8), // Generate short request ID
      traceId: req.headers.get('x-trace-id') || nanoid(16),
    };
  },
  
  /**
   * Log successful operations
   */
  async success(action: AuditAction, context: AuditContext, details?: any) {
    return auditService.log({
      action,
      outcome: AuditOutcome.SUCCESS,
      ...details,
    }, context);
  },
  
  /**
   * Log failed operations
   */
  async failure(action: AuditAction, context: AuditContext, error: Error, details?: any) {
    return auditService.log({
      action,
      outcome: AuditOutcome.FAILURE,
      description: error.message,
      metadata: {
        error: error.message,
        stack: error.stack,
        ...details?.metadata,
      },
      severity: AuditSeverity.WARNING,
      ...details,
    }, context);
  },
};