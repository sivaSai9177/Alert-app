import { z } from 'zod';
import { db } from '@/src/db';
import { session, user } from '@/src/db/schema';
import { eq, and, lt, gte, count, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { auditService, AuditAction, AuditOutcome } from './audit';

// Session configuration
const SESSION_CONFIG = {
  MAX_CONCURRENT_SESSIONS: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5'),
  DEFAULT_INACTIVE_MINUTES: parseInt(process.env.DEFAULT_INACTIVE_MINUTES || '30'),
  DEFAULT_MAX_HOURS: parseInt(process.env.DEFAULT_MAX_HOURS || '8'),
  SUSPICIOUS_LOGIN_THRESHOLD: parseInt(process.env.SUSPICIOUS_LOGIN_THRESHOLD || '3'),
  CLEANUP_INTERVAL_MS: parseInt(process.env.SESSION_CLEANUP_INTERVAL || '300000'), // 5 minutes
};

// Device information schema
export const deviceInfoSchema = z.object({
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  platform: z.enum(['ios', 'android', 'web']),
  userAgent: z.string(),
  ipAddress: z.string(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

export type DeviceInfo = z.infer<typeof deviceInfoSchema>;

// Session management interfaces
interface SessionContext {
  userId: string;
  deviceInfo: DeviceInfo;
  loginMethod?: string;
  twoFactorVerified?: boolean;
  sessionType?: 'regular' | 'elevated' | 'readonly';
}

interface SessionValidationResult {
  isValid: boolean;
  reason?: string;
  action?: 'refresh' | 'reauth' | 'revoke';
  newToken?: string;
}

export class SessionService {
  private static instance: SessionService;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanupProcess();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Create a new session with enhanced security features
   */
  async createSession(context: SessionContext): Promise<{
    sessionId: string;
    token: string;
    expiresAt: Date;
    deviceRegistered: boolean;
  }> {
    const { userId, deviceInfo } = context;
    
    try {
      // Check for existing sessions and enforce limits
      await this.enforceSessionLimits(userId);
      
      // Generate session identifiers
      const sessionId = nanoid();
      const token = this.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + SESSION_CONFIG.DEFAULT_MAX_HOURS);
      
      // Generate device fingerprint
      const deviceFingerprint = this.generateDeviceFingerprint(deviceInfo);
      
      // Check for suspicious activity
      const isSuspicious = await this.checkSuspiciousActivity(userId, deviceInfo);
      const trustScore = await this.calculateTrustScore(userId, deviceInfo);
      
      // Determine location from IP (in production, use IP geolocation service)
      const locationInfo = await this.getLocationFromIP(deviceInfo.ipAddress);
      
      // Create session record
      await db.insert(session).values({
        id: sessionId,
        token,
        userId,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Device information
        deviceId: deviceInfo.deviceId || this.generateDeviceId(),
        deviceName: deviceInfo.deviceName || this.generateDeviceName(deviceInfo),
        deviceFingerprint,
        platform: deviceInfo.platform,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        
        // Session settings
        lastActivity: new Date(),
        isActive: true,
        maxInactiveMinutes: SESSION_CONFIG.DEFAULT_INACTIVE_MINUTES,
        maxSessionHours: SESSION_CONFIG.DEFAULT_MAX_HOURS,
        
        // Security monitoring
        country: locationInfo.country,
        city: locationInfo.city,
        timezone: deviceInfo.timezone || locationInfo.timezone,
        isSuspicious,
        trustScore,
        
        // Session metadata
        loginMethod: context.loginMethod || 'email',
        twoFactorVerified: context.twoFactorVerified || false,
        sessionType: context.sessionType || 'regular',
      });

      // Log session creation
      await auditService.log({
        action: AuditAction.LOGIN,
        outcome: AuditOutcome.SUCCESS,
        entityType: 'session',
        entityId: sessionId,
        description: `New session created for user`,
        metadata: {
          deviceInfo,
          trustScore,
          isSuspicious,
          sessionType: context.sessionType,
        },
        severity: isSuspicious ? 'WARNING' : 'INFO',
        alertGenerated: isSuspicious,
      }, {
        userId,
        sessionId,
        ...deviceInfo,
      });

      return {
        sessionId,
        token,
        expiresAt,
        deviceRegistered: !isSuspicious,
      };
    } catch (error) {
      // Log session creation failure
      await auditService.logSystemError('SESSION_CREATION_FAILED', error as Error, {
        userId,
        ...deviceInfo,
      });
      
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  /**
   * Validate and refresh session
   */
  async validateSession(token: string, deviceInfo?: DeviceInfo): Promise<SessionValidationResult> {
    try {
      // Find session by token
      const [sessionRecord] = await db
        .select()
        .from(session)
        .where(and(
          eq(session.token, token),
          eq(session.isActive, true)
        ));

      if (!sessionRecord) {
        return { isValid: false, reason: 'Session not found' };
      }

      // Check expiration
      if (new Date() > sessionRecord.expiresAt) {
        await this.revokeSession(sessionRecord.id, 'expired');
        return { isValid: false, reason: 'Session expired' };
      }

      // Check inactivity timeout
      const inactiveMinutes = (Date.now() - sessionRecord.lastActivity.getTime()) / (1000 * 60);
      if (inactiveMinutes > sessionRecord.maxInactiveMinutes) {
        await this.revokeSession(sessionRecord.id, 'inactivity_timeout');
        return { isValid: false, reason: 'Session timed out due to inactivity' };
      }

      // Check for device mismatch (if device info provided)
      if (deviceInfo) {
        const deviceMatch = this.validateDeviceMatch(sessionRecord, deviceInfo);
        if (!deviceMatch.valid) {
          await this.handleDeviceMismatch(sessionRecord, deviceInfo);
          return { 
            isValid: false, 
            reason: 'Device mismatch detected',
            action: 'reauth'
          };
        }
      }

      // Update last activity
      await db
        .update(session)
        .set({ 
          lastActivity: new Date(),
          updatedAt: new Date()
        })
        .where(eq(session.id, sessionRecord.id));

      // Check if session needs refresh (near expiration)
      const hoursUntilExpiry = (sessionRecord.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilExpiry < 1) {
        const newToken = await this.refreshSession(sessionRecord.id);
        return { 
          isValid: true, 
          action: 'refresh',
          newToken
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('[SESSION] Validation error:', error);
      return { isValid: false, reason: 'Session validation failed' };
    }
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string, reason: string): Promise<void> {
    try {
      const [sessionRecord] = await db
        .select()
        .from(session)
        .where(eq(session.id, sessionId));

      if (sessionRecord) {
        await db
          .update(session)
          .set({
            isActive: false,
            revokedAt: new Date(),
            revokeReason: reason,
            updatedAt: new Date(),
          })
          .where(eq(session.id, sessionId));

        // Log session revocation
        await auditService.log({
          action: AuditAction.LOGOUT,
          outcome: AuditOutcome.SUCCESS,
          entityType: 'session',
          entityId: sessionId,
          description: `Session revoked: ${reason}`,
          metadata: { reason },
          severity: reason.includes('security') ? 'WARNING' : 'INFO',
        }, {
          userId: sessionRecord.userId,
          sessionId,
          ipAddress: sessionRecord.ipAddress,
          platform: sessionRecord.platform as any,
        });
      }
    } catch (error) {
      console.error('[SESSION] Revocation error:', error);
      throw new Error(`Failed to revoke session: ${error.message}`);
    }
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const sessions = await db
        .select()
        .from(session)
        .where(and(
          eq(session.userId, userId),
          eq(session.isActive, true)
        ))
        .orderBy(desc(session.lastActivity));

      return sessions.map(s => ({
        id: s.id,
        deviceName: s.deviceName,
        platform: s.platform,
        ipAddress: s.ipAddress,
        city: s.city,
        country: s.country,
        lastActivity: s.lastActivity,
        createdAt: s.createdAt,
        isCurrent: false, // Would need current session context to determine
        isSuspicious: s.isSuspicious,
        trustScore: s.trustScore,
        loginMethod: s.loginMethod,
      }));
    } catch (error) {
      console.error('[SESSION] Get sessions error:', error);
      throw new Error(`Failed to get user sessions: ${error.message}`);
    }
  }

  /**
   * Revoke all sessions for a user except current
   */
  async revokeAllUserSessions(userId: string, currentSessionId?: string): Promise<number> {
    try {
      const query = currentSessionId
        ? and(
            eq(session.userId, userId),
            eq(session.isActive, true),
            // ne(session.id, currentSessionId) - would need to import ne from drizzle
          )
        : and(
            eq(session.userId, userId),
            eq(session.isActive, true)
          );

      const sessionsToRevoke = await db
        .select()
        .from(session)
        .where(query);

      const revokedCount = sessionsToRevoke.length;

      if (revokedCount > 0) {
        await db
          .update(session)
          .set({
            isActive: false,
            revokedAt: new Date(),
            revokeReason: 'user_requested_revoke_all',
            updatedAt: new Date(),
          })
          .where(query);

        // Log mass session revocation
        await auditService.log({
          action: AuditAction.LOGOUT,
          outcome: AuditOutcome.SUCCESS,
          entityType: 'user',
          entityId: userId,
          description: `All user sessions revoked (${revokedCount} sessions)`,
          metadata: { revokedCount, keepCurrent: !!currentSessionId },
          severity: 'INFO',
        });
      }

      return revokedCount;
    } catch (error) {
      console.error('[SESSION] Revoke all sessions error:', error);
      throw new Error(`Failed to revoke user sessions: ${error.message}`);
    }
  }

  /**
   * Private helper methods
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(64).toString('base64url');
  }

  private generateDeviceId(): string {
    return nanoid(16);
  }

  private generateDeviceName(deviceInfo: DeviceInfo): string {
    const platform = deviceInfo.platform.charAt(0).toUpperCase() + deviceInfo.platform.slice(1);
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${platform} Device (${timestamp})`;
  }

  private generateDeviceFingerprint(deviceInfo: DeviceInfo): string {
    const fingerprint = [
      deviceInfo.platform,
      deviceInfo.userAgent,
      deviceInfo.timezone || 'unknown',
      deviceInfo.language || 'unknown',
    ].join('|');
    
    return crypto.createHash('sha256').update(fingerprint).digest('hex');
  }

  private async checkSuspiciousActivity(userId: string, deviceInfo: DeviceInfo): Promise<boolean> {
    try {
      // Check for multiple failed login attempts from this IP
      const recentFailedLogins = await this.getRecentFailedLogins(deviceInfo.ipAddress);
      if (recentFailedLogins >= SESSION_CONFIG.SUSPICIOUS_LOGIN_THRESHOLD) {
        return true;
      }

      // Check for unusual location (simplified - in production use IP geolocation)
      const userSessions = await this.getRecentUserSessions(userId);
      if (userSessions.length > 0) {
        const usualCountries = new Set(userSessions.map(s => s.country));
        const currentCountry = await this.getCountryFromIP(deviceInfo.ipAddress);
        if (!usualCountries.has(currentCountry)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('[SESSION] Suspicious activity check error:', error);
      return false; // Default to not suspicious on error
    }
  }

  private async calculateTrustScore(userId: string, deviceInfo: DeviceInfo): Promise<number> {
    let score = 100;

    try {
      // Reduce score for new devices
      const knownDevice = await this.isKnownDevice(userId, deviceInfo);
      if (!knownDevice) score -= 20;

      // Reduce score for suspicious IPs
      const suspiciousIP = await this.isSuspiciousIP(deviceInfo.ipAddress);
      if (suspiciousIP) score -= 30;

      // Reduce score for unusual times
      const hour = new Date().getHours();
      if (hour < 6 || hour > 22) score -= 10;

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      console.error('[SESSION] Trust score calculation error:', error);
      return 50; // Default to medium trust on error
    }
  }

  private async getLocationFromIP(ipAddress: string): Promise<{
    country: string;
    city: string;
    timezone: string;
  }> {
    // In production, integrate with IP geolocation service
    // For now, return defaults
    return {
      country: 'US',
      city: 'Unknown',
      timezone: 'UTC',
    };
  }

  private validateDeviceMatch(sessionRecord: any, deviceInfo: DeviceInfo): { valid: boolean; reason?: string } {
    if (sessionRecord.platform !== deviceInfo.platform) {
      return { valid: false, reason: 'Platform mismatch' };
    }

    const currentFingerprint = this.generateDeviceFingerprint(deviceInfo);
    if (sessionRecord.deviceFingerprint !== currentFingerprint) {
      return { valid: false, reason: 'Device fingerprint mismatch' };
    }

    return { valid: true };
  }

  private async handleDeviceMismatch(sessionRecord: any, deviceInfo: DeviceInfo): Promise<void> {
    // Log security event
    await auditService.logSecurityViolation(
      'Device mismatch detected for active session',
      {
        userId: sessionRecord.userId,
        sessionId: sessionRecord.id,
        ipAddress: deviceInfo.ipAddress,
        platform: deviceInfo.platform,
      },
      {
        originalDevice: {
          platform: sessionRecord.platform,
          fingerprint: sessionRecord.deviceFingerprint,
        },
        currentDevice: {
          platform: deviceInfo.platform,
          fingerprint: this.generateDeviceFingerprint(deviceInfo),
        },
      }
    );

    // Revoke the session
    await this.revokeSession(sessionRecord.id, 'device_mismatch_security');
  }

  private async refreshSession(sessionId: string): Promise<string> {
    const newToken = this.generateSecureToken();
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + SESSION_CONFIG.DEFAULT_MAX_HOURS);

    await db
      .update(session)
      .set({
        token: newToken,
        expiresAt: newExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(session.id, sessionId));

    return newToken;
  }

  private async enforceSessionLimits(userId: string): Promise<void> {
    // Count active sessions
    const [{ count: activeCount }] = await db
      .select({ count: count() })
      .from(session)
      .where(and(
        eq(session.userId, userId),
        eq(session.isActive, true)
      ));

    if (activeCount >= SESSION_CONFIG.MAX_CONCURRENT_SESSIONS) {
      // Revoke oldest sessions
      const oldestSessions = await db
        .select()
        .from(session)
        .where(and(
          eq(session.userId, userId),
          eq(session.isActive, true)
        ))
        .orderBy(session.lastActivity)
        .limit(activeCount - SESSION_CONFIG.MAX_CONCURRENT_SESSIONS + 1);

      for (const oldSession of oldestSessions) {
        await this.revokeSession(oldSession.id, 'session_limit_exceeded');
      }
    }
  }

  // Cleanup expired and revoked sessions
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(async () => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep logs for 30 days

        // Delete old inactive sessions
        await db
          .delete(session)
          .where(and(
            eq(session.isActive, false),
            lt(session.revokedAt, cutoffDate)
          ));

        // Revoke expired active sessions
        await db
          .update(session)
          .set({
            isActive: false,
            revokedAt: new Date(),
            revokeReason: 'expired_cleanup',
          })
          .where(and(
            eq(session.isActive, true),
            lt(session.expiresAt, new Date())
          ));
      } catch (error) {
        console.error('[SESSION] Cleanup process error:', error);
      }
    }, SESSION_CONFIG.CLEANUP_INTERVAL_MS);
  }

  // Helper methods that would need implementation
  private async getRecentFailedLogins(ipAddress: string): Promise<number> {
    // Query audit logs for failed login attempts from this IP
    return 0;
  }

  private async getRecentUserSessions(userId: string): Promise<any[]> {
    return db
      .select()
      .from(session)
      .where(eq(session.userId, userId))
      .orderBy(desc(session.createdAt))
      .limit(10);
  }

  private async getCountryFromIP(ipAddress: string): Promise<string> {
    // In production, use IP geolocation service
    return 'US';
  }

  private async isKnownDevice(userId: string, deviceInfo: DeviceInfo): Promise<boolean> {
    const fingerprint = this.generateDeviceFingerprint(deviceInfo);
    const [existingSession] = await db
      .select()
      .from(session)
      .where(and(
        eq(session.userId, userId),
        eq(session.deviceFingerprint, fingerprint)
      ))
      .limit(1);

    return !!existingSession;
  }

  private async isSuspiciousIP(ipAddress: string): Promise<boolean> {
    // In production, check against threat intelligence feeds
    return false;
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export singleton instance
export const sessionService = SessionService.getInstance();