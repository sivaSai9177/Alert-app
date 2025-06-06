// lib/validations/server.ts
// Server-side Zod validation schemas for tRPC + TanStack Query best practices
import { z } from 'zod';

// ========================================
// User & Authentication Schemas
// ========================================

export const UserRoleSchema = z.enum(['admin', 'manager', 'user', 'guest'], {
  errorMap: () => ({ message: 'Invalid user role. Must be admin, manager, user, or guest.' })
});

export const UserPermissionSchema = z.enum([
  '*', // admin wildcard
  'manage_users',
  'view_analytics', 
  'manage_content',
  'view_content',
  'edit_profile',
  'view_team',
  'view_reports',
  'manage_approvals',
  'manage_schedule'
], {
  errorMap: () => ({ message: 'Invalid permission type.' })
});

export const UserStatusSchema = z.enum(['active', 'inactive', 'suspended', 'pending'], {
  errorMap: () => ({ message: 'Invalid user status.' })
});

// Base user schema for database operations
export const BaseUserSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .max(254, 'Email address too long'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .trim(),
  role: UserRoleSchema,
  organizationId: z.string().optional(),
  organizationName: z.string().max(100).optional(),
  phoneNumber: z.string().optional(),
  department: z.string().max(50).optional(),
  jobTitle: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  needsProfileCompletion: z.boolean().default(false),
  status: UserStatusSchema.default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ========================================
// Authentication Input Schemas
// ========================================

export const SignInInputSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(254, 'Email too long')
    .refine(email => !email.includes('+'), 'Email aliases not allowed for security')
    .refine(email => {
      const domain = email.split('@')[1];
      return domain && domain.length > 0;
    }, 'Invalid email domain'),
  password: z.string()
    .min(1, 'Password is required')
    .max(1000, 'Password too long')
    .refine(val => !val.includes('\x00'), 'Invalid characters in password'),
  deviceInfo: z.object({
    userAgent: z.string().max(500).optional(),
    ipAddress: z.string().ip().optional(),
    platform: z.enum(['ios', 'android', 'web']).optional(),
  }).optional(),
}).strict();

export const SignUpInputSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string()
    .min(12, 'Password must be at least 12 characters for security compliance')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  role: UserRoleSchema.default('user'),
  organizationCode: z.string().min(4).max(12).regex(/^[A-Z0-9]+$/).optional(),
  organizationName: z.string().min(2).max(100).trim().optional(),
  organizationId: z.string().uuid().optional(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms and conditions' }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: 'You must accept the privacy policy' }) }),
  phoneNumber: z.string().optional(),
  department: z.string().max(50).optional(),
}).strict().refine(data => {
  // Organization validation based on role
  if ((data.role === 'manager' || data.role === 'admin') && !data.organizationName) {
    return false;
  }
  return true;
}, {
  message: 'Organization name is required for managers and admins',
  path: ['organizationName'],
}).refine(data => {
  // Password security: cannot contain email username
  const emailUsername = data.email.split('@')[0].toLowerCase();
  return !data.password.toLowerCase().includes(emailUsername);
}, {
  message: 'Password cannot contain your email address',
  path: ['password'],
});

export const CompleteProfileInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  role: UserRoleSchema,
  organizationCode: z.string().min(4).max(12).regex(/^[A-Z0-9]+$/).optional(),
  organizationName: z.string().min(2).max(100).trim().optional(),
  organizationId: z.string().optional(),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  phoneNumber: z.string().optional(),
  department: z.string().max(50).optional(),
  jobTitle: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
}).refine(data => {
  if ((data.role === 'manager' || data.role === 'admin') && !data.organizationName) {
    return false;
  }
  return true;
}, {
  message: 'Organization name is required for managers and admins',
  path: ['organizationName'],
});

// ========================================
// Query & Filter Schemas
// ========================================

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  cursor: z.string().optional(),
});

export const SearchFilterSchema = z.object({
  search: z.string().max(100).optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  organizationId: z.string().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
});

export const ListUsersInputSchema = PaginationSchema.merge(SearchFilterSchema).strict();

// ========================================
// Admin Operation Schemas
// ========================================

export const UpdateUserRoleInputSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  newRole: UserRoleSchema,
  reason: z.string().min(1, 'Reason is required for role changes').max(500),
}).strict();

export const ForcePasswordResetInputSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  reason: z.string().min(1, 'Reason is required').max(500),
}).strict();

// ========================================
// Analytics & Reporting Schemas
// ========================================

export const AnalyticsMetricSchema = z.enum(['users', 'logins', 'activity', 'performance']);

export const AnalyticsInputSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  metric: AnalyticsMetricSchema.default('users'),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
}).strict().refine(data => {
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['startDate'],
});

// ========================================
// Audit & Security Schemas
// ========================================

export const AuditLogFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  severity: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).optional(),
  entityType: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
}).strict();

export const SessionManagementSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  action: z.enum(['revoke', 'extend', 'refresh']),
  reason: z.string().max(200).optional(),
}).strict();

// ========================================
// Two-Factor Authentication Schemas
// ========================================

export const TwoFactorCodeSchema = z.object({
  code: z.string()
    .length(6, 'Two-factor code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Two-factor code must contain only numbers'),
}).strict();

export const TwoFactorSetupSchema = z.object({
  method: z.enum(['totp', 'sms', 'email']),
  phoneNumber: z.string().optional(),
  backupCodes: z.boolean().default(true),
}).strict();

// ========================================
// Response Schemas
// ========================================

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  timestamp: z.date().default(new Date()),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: UserRoleSchema,
  organizationId: z.string().nullable().optional(),
  organizationName: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  needsProfileCompletion: z.boolean().default(false),
  status: UserStatusSchema.default('active'),
  // Make dates flexible to handle string/Date conversion
  createdAt: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  updatedAt: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  // Optional fields that can be null from database
  permissions: z.array(UserPermissionSchema).optional(),
  lastLoginAt: z.date().nullable().optional(),
  isEmailVerified: z.boolean().nullable().default(false),
});

export const AuthResponseSchema = z.object({
  success: z.literal(true),
  user: UserResponseSchema,
  token: z.string().optional(),
  expiresAt: z.date().optional(),
  requiresTwoFactor: z.boolean().default(false),
});

export const SessionResponseSchema = z.object({
  session: z.object({
    id: z.string(),
    userId: z.string(),
    expiresAt: z.date(),
    createdAt: z.date(),
  }),
  user: UserResponseSchema,
});

// ========================================
// Error Schemas
// ========================================

export const ErrorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'BAD_REQUEST',
  'CONFLICT',
  'TOO_MANY_REQUESTS',
  'INTERNAL_SERVER_ERROR',
  'VALIDATION_ERROR',
]);

export const ApiErrorSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.date().default(new Date()),
});

// ========================================
// Utility Types & Validators
// ========================================

export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserPermission = z.infer<typeof UserPermissionSchema>;
export type BaseUser = z.infer<typeof BaseUserSchema>;
export type SignInInput = z.infer<typeof SignInInputSchema>;
export type SignUpInput = z.infer<typeof SignUpInputSchema>;
export type CompleteProfileInput = z.infer<typeof CompleteProfileInputSchema>;
export type ListUsersInput = z.infer<typeof ListUsersInputSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleInputSchema>;
export type AnalyticsInput = z.infer<typeof AnalyticsInputSchema>;
export type AuditLogFilter = z.infer<typeof AuditLogFilterSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;

// ========================================
// Validation Utilities
// ========================================

export const validateUserRole = (role: unknown): UserRole => {
  return UserRoleSchema.parse(role);
};

export const validateEmail = (email: unknown): string => {
  return z.string().email().parse(email);
};

export const validateUUID = (id: unknown): string => {
  return z.string().uuid().parse(id);
};

// Role hierarchy validation
export const canUserAccessRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const hierarchy: Record<UserRole, UserRole[]> = {
    admin: ['admin', 'manager', 'user', 'guest'],
    manager: ['manager', 'user', 'guest'],
    user: ['user', 'guest'],
    guest: ['guest'],
  };
  
  return hierarchy[userRole]?.includes(requiredRole) ?? false;
};

// Permission validation
export const validateUserPermission = (userRole: UserRole, permission: UserPermission): boolean => {
  const rolePermissions: Record<UserRole, UserPermission[]> = {
    admin: ['*'],
    manager: ['manage_users', 'view_analytics', 'manage_content', 'view_team', 'view_reports'],
    user: ['view_content', 'edit_profile'],
    guest: ['view_content'],
  };
  
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes('*') || permissions.includes(permission);
};