import { z } from 'zod';
import { auditService, AuditAction, AuditOutcome, AuditSeverity } from './audit';

// Permission system configuration
export enum ResourceType {
  USER = 'user',
  ORGANIZATION = 'organization',
  CONTENT = 'content',
  ANALYTICS = 'analytics',
  SYSTEM = 'system',
  AUDIT = 'audit',
  API = 'api',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  APPROVE = 'approve',
  EXPORT = 'export',
  INVITE = 'invite',
}

export enum Role {
  GUEST = 'guest',
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

// Permission schemas
export const permissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  resource: z.nativeEnum(ResourceType),
  action: z.nativeEnum(Action),
  conditions: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

export const rolePermissionSchema = z.object({
  roleId: z.string(),
  permissionId: z.string(),
  grantedAt: z.date().default(() => new Date()),
  grantedBy: z.string(),
  conditions: z.record(z.any()).optional(),
});

export const accessRequestSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(Role),
  resource: z.nativeEnum(ResourceType),
  action: z.nativeEnum(Action),
  resourceId: z.string().optional(),
  context: z.record(z.any()).optional(),
});

export type Permission = z.infer<typeof permissionSchema>;
export type RolePermission = z.infer<typeof rolePermissionSchema>;
export type AccessRequest = z.infer<typeof accessRequestSchema>;

// Access control result
interface AccessResult {
  granted: boolean;
  reason?: string;
  conditions?: Record<string, any>;
  auditRequired?: boolean;
}

// Permission definitions for business application
const BUSINESS_PERMISSIONS: Record<string, Permission> = {
  // User management permissions
  'user.create': {
    id: 'user.create',
    name: 'Create Users',
    description: 'Create new user accounts',
    resource: ResourceType.USER,
    action: Action.CREATE,
  },
  'user.read': {
    id: 'user.read',
    name: 'View Users',
    description: 'View user profiles and information',
    resource: ResourceType.USER,
    action: Action.READ,
  },
  'user.update': {
    id: 'user.update',
    name: 'Update Users',
    description: 'Edit user profiles and settings',
    resource: ResourceType.USER,
    action: Action.UPDATE,
  },
  'user.delete': {
    id: 'user.delete',
    name: 'Delete Users',
    description: 'Delete user accounts',
    resource: ResourceType.USER,
    action: Action.DELETE,
  },
  'user.manage': {
    id: 'user.manage',
    name: 'Manage Users',
    description: 'Full user management capabilities',
    resource: ResourceType.USER,
    action: Action.MANAGE,
  },
  'user.invite': {
    id: 'user.invite',
    name: 'Invite Users',
    description: 'Send user invitations',
    resource: ResourceType.USER,
    action: Action.INVITE,
  },

  // Organization permissions
  'organization.read': {
    id: 'organization.read',
    name: 'View Organization',
    description: 'View organization information',
    resource: ResourceType.ORGANIZATION,
    action: Action.READ,
  },
  'organization.update': {
    id: 'organization.update',
    name: 'Update Organization',
    description: 'Edit organization settings',
    resource: ResourceType.ORGANIZATION,
    action: Action.UPDATE,
  },
  'organization.manage': {
    id: 'organization.manage',
    name: 'Manage Organization',
    description: 'Full organization management',
    resource: ResourceType.ORGANIZATION,
    action: Action.MANAGE,
  },

  // Content permissions
  'content.create': {
    id: 'content.create',
    name: 'Create Content',
    description: 'Create new content',
    resource: ResourceType.CONTENT,
    action: Action.CREATE,
  },
  'content.read': {
    id: 'content.read',
    name: 'View Content',
    description: 'View content',
    resource: ResourceType.CONTENT,
    action: Action.READ,
  },
  'content.update': {
    id: 'content.update',
    name: 'Update Content',
    description: 'Edit existing content',
    resource: ResourceType.CONTENT,
    action: Action.UPDATE,
  },
  'content.delete': {
    id: 'content.delete',
    name: 'Delete Content',
    description: 'Delete content',
    resource: ResourceType.CONTENT,
    action: Action.DELETE,
  },
  'content.approve': {
    id: 'content.approve',
    name: 'Approve Content',
    description: 'Approve content for publication',
    resource: ResourceType.CONTENT,
    action: Action.APPROVE,
  },

  // Analytics permissions
  'analytics.read': {
    id: 'analytics.read',
    name: 'View Analytics',
    description: 'View analytics and reports',
    resource: ResourceType.ANALYTICS,
    action: Action.READ,
  },
  'analytics.export': {
    id: 'analytics.export',
    name: 'Export Analytics',
    description: 'Export analytics data',
    resource: ResourceType.ANALYTICS,
    action: Action.EXPORT,
  },

  // System permissions
  'system.read': {
    id: 'system.read',
    name: 'View System Info',
    description: 'View system information',
    resource: ResourceType.SYSTEM,
    action: Action.READ,
  },
  'system.update': {
    id: 'system.update',
    name: 'Update System',
    description: 'Update system settings',
    resource: ResourceType.SYSTEM,
    action: Action.UPDATE,
  },
  'system.manage': {
    id: 'system.manage',
    name: 'Manage System',
    description: 'Full system management',
    resource: ResourceType.SYSTEM,
    action: Action.MANAGE,
  },

  // Audit permissions
  'audit.read': {
    id: 'audit.read',
    name: 'View Audit Logs',
    description: 'View audit logs and security events',
    resource: ResourceType.AUDIT,
    action: Action.READ,
  },
  'audit.export': {
    id: 'audit.export',
    name: 'Export Audit Logs',
    description: 'Export audit logs for compliance',
    resource: ResourceType.AUDIT,
    action: Action.EXPORT,
  },

  // API permissions
  'api.read': {
    id: 'api.read',
    name: 'API Read Access',
    description: 'Read access via API',
    resource: ResourceType.API,
    action: Action.READ,
  },
  'api.manage': {
    id: 'api.manage',
    name: 'API Management',
    description: 'Manage API keys and access',
    resource: ResourceType.API,
    action: Action.MANAGE,
  },
};

// Role-based permission mappings
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.GUEST]: [
    'content.read', // Limited content access
  ],
  [Role.USER]: [
    'content.read',
    'content.create',
    'user.read', // Own profile only
    'organization.read',
  ],
  [Role.MANAGER]: [
    // All user permissions plus:
    'content.read',
    'content.create',
    'content.update',
    'content.approve',
    'user.read',
    'user.update', // Team members only
    'user.invite',
    'organization.read',
    'organization.update',
    'analytics.read',
  ],
  [Role.ADMIN]: [
    // All permissions
    ...Object.keys(BUSINESS_PERMISSIONS),
  ],
};

export class AccessControlService {
  private static instance: AccessControlService;
  private permissionCache: Map<string, Permission[]> = new Map();
  private cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): AccessControlService {
    if (!AccessControlService.instance) {
      AccessControlService.instance = new AccessControlService();
    }
    return AccessControlService.instance;
  }

  /**
   * Check if user has permission to perform action
   */
  async hasPermission(request: AccessRequest): Promise<AccessResult> {
    try {
      // Validate request
      const validatedRequest = accessRequestSchema.parse(request);
      
      // Get user permissions
      const userPermissions = await this.getUserPermissions(validatedRequest.userId, validatedRequest.role);
      
      // Find matching permission
      const permissionKey = `${validatedRequest.resource}.${validatedRequest.action}`;
      const hasBasePermission = userPermissions.some(p => p.id === permissionKey);
      
      if (!hasBasePermission) {
        // Log access denial
        await auditService.log({
          action: AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
          outcome: AuditOutcome.FAILURE,
          entityType: validatedRequest.resource,
          entityId: validatedRequest.resourceId || 'unknown',
          description: `Access denied: ${permissionKey}`,
          metadata: {
            requestedPermission: permissionKey,
            userRole: validatedRequest.role,
            context: validatedRequest.context,
          },
          severity: AuditSeverity.WARNING,
          alertGenerated: true,
        }, {
          userId: validatedRequest.userId,
          ...validatedRequest.context,
        });

        return {
          granted: false,
          reason: `Permission denied: ${permissionKey}`,
          auditRequired: true,
        };
      }

      // Check additional conditions
      const conditionResult = await this.checkConditions(validatedRequest);
      if (!conditionResult.granted) {
        return conditionResult;
      }

      // Log successful access (for sensitive resources)
      if (this.requiresAuditLogging(validatedRequest.resource, validatedRequest.action)) {
        await auditService.log({
          action: AuditAction.DATA_VIEWED,
          outcome: AuditOutcome.SUCCESS,
          entityType: validatedRequest.resource,
          entityId: validatedRequest.resourceId || 'unknown',
          description: `Access granted: ${permissionKey}`,
          metadata: {
            permission: permissionKey,
            userRole: validatedRequest.role,
            context: validatedRequest.context,
          },
          severity: AuditSeverity.INFO,
        }, {
          userId: validatedRequest.userId,
          ...validatedRequest.context,
        });
      }

      return {
        granted: true,
        auditRequired: this.requiresAuditLogging(validatedRequest.resource, validatedRequest.action),
      };
    } catch (error) {
      console.error('[ACCESS CONTROL] Permission check failed:', error);
      return {
        granted: false,
        reason: 'Permission check failed',
      };
    }
  }

  /**
   * Check multiple permissions at once
   */
  async hasAnyPermission(
    userId: string,
    role: Role,
    permissions: { resource: ResourceType; action: Action; resourceId?: string }[]
  ): Promise<boolean> {
    for (const perm of permissions) {
      const result = await this.hasPermission({
        userId,
        role,
        ...perm,
      });
      if (result.granted) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string, role: Role): Promise<Permission[]> {
    const cacheKey = `${userId}:${role}`;
    
    // Check cache
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    // Get role-based permissions
    const rolePermissionIds = ROLE_PERMISSIONS[role] || [];
    const permissions = rolePermissionIds
      .map(id => BUSINESS_PERMISSIONS[id])
      .filter(Boolean);

    // Cache the result
    this.permissionCache.set(cacheKey, permissions);
    
    // Set expiry
    setTimeout(() => {
      this.permissionCache.delete(cacheKey);
    }, this.cacheExpiryMs);

    return permissions;
  }

  /**
   * Get permissions required for a specific resource/action
   */
  getRequiredPermissions(resource: ResourceType, action: Action): Permission[] {
    const permissionKey = `${resource}.${action}`;
    const permission = BUSINESS_PERMISSIONS[permissionKey];
    return permission ? [permission] : [];
  }

  /**
   * Check if user can access specific resource
   */
  async canAccessResource(
    userId: string,
    role: Role,
    resource: ResourceType,
    resourceId: string,
    action: Action = Action.READ
  ): Promise<boolean> {
    const result = await this.hasPermission({
      userId,
      role,
      resource,
      action,
      resourceId,
    });
    return result.granted;
  }

  /**
   * Get accessible resources for user
   */
  async getAccessibleResources(
    userId: string,
    role: Role,
    resource: ResourceType
  ): Promise<string[]> {
    // In a real implementation, this would query the database
    // based on user permissions and resource ownership
    
    const canRead = await this.hasPermission({
      userId,
      role,
      resource,
      action: Action.READ,
    });

    if (!canRead.granted) {
      return [];
    }

    // For demo purposes, return based on role
    switch (role) {
      case Role.ADMIN:
        return ['*']; // All resources
      case Role.MANAGER:
        return [`org:${userId}`, `dept:${userId}`]; // Organization and department resources
      case Role.USER:
        return [`user:${userId}`]; // Own resources only
      case Role.GUEST:
        return []; // No resources
      default:
        return [];
    }
  }

  /**
   * Grant temporary elevated permissions
   */
  async grantTemporaryPermission(
    userId: string,
    permission: string,
    durationMinutes: number,
    grantedBy: string,
    reason: string
  ): Promise<boolean> {
    try {
      // Log the temporary permission grant
      await auditService.log({
        action: AuditAction.USER_ROLE_CHANGED,
        outcome: AuditOutcome.SUCCESS,
        entityType: 'user',
        entityId: userId,
        description: `Temporary permission granted: ${permission}`,
        metadata: {
          permission,
          durationMinutes,
          grantedBy,
          reason,
          expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000),
        },
        severity: AuditSeverity.WARNING,
        alertGenerated: true,
      }, {
        userId: grantedBy,
      });

      // In production, store temporary permission in database with expiry
      
      // Clear user permission cache
      this.clearUserCache(userId);

      return true;
    } catch (error) {
      console.error('[ACCESS CONTROL] Failed to grant temporary permission:', error);
      return false;
    }
  }

  /**
   * Emergency access procedures
   */
  async grantEmergencyAccess(
    userId: string,
    resource: ResourceType,
    justification: string,
    approvedBy?: string
  ): Promise<boolean> {
    try {
      // Log emergency access
      await auditService.log({
        action: AuditAction.SECURITY_VIOLATION,
        outcome: AuditOutcome.SUCCESS,
        entityType: 'user',
        entityId: userId,
        description: `Emergency access granted for ${resource}`,
        metadata: {
          resource,
          justification,
          approvedBy,
          emergencyAccess: true,
        },
        severity: AuditSeverity.CRITICAL,
        alertGenerated: true,
      }, {
        userId: approvedBy || 'system',
      });

      // In production, grant emergency access with automatic expiry
      
      return true;
    } catch (error) {
      console.error('[ACCESS CONTROL] Failed to grant emergency access:', error);
      return false;
    }
  }

  /**
   * Validate role permissions
   */
  validateRolePermissions(role: Role): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions && permissions.length > 0;
  }

  /**
   * Get permission hierarchy
   */
  getPermissionHierarchy(): Record<Role, string[]> {
    return { ...ROLE_PERMISSIONS };
  }

  /**
   * Check if permission exists
   */
  permissionExists(permissionId: string): boolean {
    return permissionId in BUSINESS_PERMISSIONS;
  }

  /**
   * Private helper methods
   */
  private async checkConditions(request: AccessRequest): Promise<AccessResult> {
    // Resource-specific condition checks
    switch (request.resource) {
      case ResourceType.USER:
        return this.checkUserResourceConditions(request);
      
      case ResourceType.ORGANIZATION:
        return this.checkOrganizationResourceConditions(request);
      
      case ResourceType.AUDIT:
        return this.checkAuditResourceConditions(request);
      
      default:
        return { granted: true };
    }
  }

  private async checkUserResourceConditions(request: AccessRequest): Promise<AccessResult> {
    // Users can only modify their own profile (unless manager/admin)
    if (request.action === Action.UPDATE && request.role === Role.USER) {
      if (request.resourceId && request.resourceId !== request.userId) {
        return {
          granted: false,
          reason: 'Users can only modify their own profile',
        };
      }
    }

    // Managers can only manage users in their organization/department
    if (request.role === Role.MANAGER && [Action.UPDATE, Action.DELETE].includes(request.action)) {
      // In production, check if target user is in same organization/department
      // For now, allow manager actions
    }

    return { granted: true };
  }

  private async checkOrganizationResourceConditions(request: AccessRequest): Promise<AccessResult> {
    // Users can only read their own organization
    if (request.role === Role.USER && request.action !== Action.READ) {
      return {
        granted: false,
        reason: 'Users have read-only access to organization',
      };
    }

    return { granted: true };
  }

  private async checkAuditResourceConditions(request: AccessRequest): Promise<AccessResult> {
    // Only admins can access audit logs
    if (request.role !== Role.ADMIN) {
      return {
        granted: false,
        reason: 'Audit log access restricted to administrators',
      };
    }

    return { granted: true };
  }

  private requiresAuditLogging(resource: ResourceType, action: Action): boolean {
    const sensitiveResources = [ResourceType.USER, ResourceType.AUDIT, ResourceType.SYSTEM];
    const sensitiveActions = [Action.DELETE, Action.MANAGE, Action.EXPORT];
    
    return sensitiveResources.includes(resource) || sensitiveActions.includes(action);
  }

  private clearUserCache(userId: string): void {
    const keysToDelete = Array.from(this.permissionCache.keys())
      .filter(key => key.startsWith(`${userId}:`));
    
    keysToDelete.forEach(key => this.permissionCache.delete(key));
  }

  public clearCache(): void {
    this.permissionCache.clear();
  }
}

// Export singleton instance
export const accessControlService = AccessControlService.getInstance();

// Utility functions for common access control checks
export const accessUtils = {
  /**
   * Check if user can create content
   */
  async canCreateContent(userId: string, role: Role): Promise<boolean> {
    const result = await accessControlService.hasPermission({
      userId,
      role,
      resource: ResourceType.CONTENT,
      action: Action.CREATE,
    });
    return result.granted;
  },

  /**
   * Check if user can manage users
   */
  async canManageUsers(userId: string, role: Role): Promise<boolean> {
    const result = await accessControlService.hasPermission({
      userId,
      role,
      resource: ResourceType.USER,
      action: Action.MANAGE,
    });
    return result.granted;
  },

  /**
   * Check if user can view analytics
   */
  async canViewAnalytics(userId: string, role: Role): Promise<boolean> {
    const result = await accessControlService.hasPermission({
      userId,
      role,
      resource: ResourceType.ANALYTICS,
      action: Action.READ,
    });
    return result.granted;
  },

  /**
   * Check if user can access admin features
   */
  async isAdmin(userId: string, role: Role): Promise<boolean> {
    return role === Role.ADMIN;
  },

  /**
   * Get user capabilities based on role
   */
  async getUserCapabilities(_userId: string, role: Role): Promise<Record<string, boolean>> {
    const permissions = await accessControlService.getUserPermissions(_userId, role);
    
    return {
      canCreateUsers: permissions.some(p => p.id === 'user.create'),
      canManageUsers: permissions.some(p => p.id === 'user.manage'),
      canCreateContent: permissions.some(p => p.id === 'content.create'),
      canApproveContent: permissions.some(p => p.id === 'content.approve'),
      canViewAnalytics: permissions.some(p => p.id === 'analytics.read'),
      canExportData: permissions.some(p => p.id === 'analytics.export'),
      canManageOrganization: permissions.some(p => p.id === 'organization.manage'),
      canViewAuditLogs: permissions.some(p => p.id === 'audit.read'),
      canManageSystem: permissions.some(p => p.id === 'system.manage'),
    };
  },
};

export default accessControlService;