import { z } from 'zod';
import { 
  emailSchema, 
  passwordSchema, 
  nameSchema, 
  phoneSchema,
  roleSchema,
  departmentSchema,
  deviceInfoSchema,
  ipAddressSchema,
  userAgentSchema
} from './common';

// Enhanced authentication schemas with comprehensive validation

// Sign in schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
  deviceInfo: deviceInfoSchema.optional(),
});

export const socialSignInSchema = z.object({
  provider: z.enum(['google', 'apple', 'microsoft', 'github']),
  redirectUrl: z.string().url().optional(),
  deviceInfo: deviceInfoSchema.optional(),
});

// Organization-related schemas
export const organizationCodeSchema = z.string()
  .min(4, 'Organization code must be at least 4 characters')
  .max(12, 'Organization code too long')
  .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers')
  .optional();

export const organizationNameSchema = z.string()
  .min(2, 'Organization name must be at least 2 characters')
  .max(100, 'Organization name too long')
  .trim()
  .optional();

// Enhanced sign up schema with role-based organization flow
export const signUpSchema = z.object({
  // Personal information
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  
  // Role-based business information (user must select)
  role: roleSchema, // No default - user must choose
  organizationCode: organizationCodeSchema, // For users joining existing org
  organizationName: organizationNameSchema, // For managers/admins creating new org
  organizationId: z.string().optional(), // Legacy support - auto-populated
  department: departmentSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  
  // Terms and privacy
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy',
  }),
  marketingConsent: z.boolean().optional().default(false),
  
  // System information
  deviceInfo: deviceInfoSchema.optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine(data => {
  // Validate organization requirements based on role
  if ((data.role === 'manager' || data.role === 'admin') && !data.organizationName) {
    return false;
  }
  return true;
}, {
  message: 'Organization name is required for managers and admins',
  path: ['organizationName'],
});

// Profile management schemas
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  department: departmentSchema.optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(),
  language: z.string().length(2).optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }).optional(),
});

export const profileCompletionSchema = z.object({
  role: roleSchema,
  organizationId: z.string().uuid().optional(),
  department: departmentSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  bio: z.string().max(500).optional(),
}).refine(data => {
  // Managers and admins should have department
  if (['admin', 'manager'].includes(data.role) && !data.department) {
    return false;
  }
  return true;
}, {
  message: 'Department is required for admin and manager roles',
  path: ['department'],
});

// Password management schemas
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  captcha: z.string().optional(), // For bot protection
});

export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Two-factor authentication schemas
export const enable2FASchema = z.object({
  password: z.string().min(1, 'Password is required for 2FA setup'),
});

export const verify2FASetupSchema = z.object({
  secret: z.string().min(1, 'Secret is required'),
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Code must contain only numbers'),
});

export const verify2FASchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Code must contain only numbers'),
  backupCode: z.string().length(8, 'Backup code must be 8 characters').optional(),
  trustDevice: z.boolean().optional().default(false),
}).refine(data => data.code || data.backupCode, {
  message: 'Either verification code or backup code is required',
});

export const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
  code: z.string().length(6).regex(/^\d{6}$/).optional(),
  confirmDisable: z.boolean().refine(val => val === true, {
    message: 'You must confirm disabling 2FA',
  }),
});

// Session management schemas
export const sessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string().min(32),
  deviceId: z.string().optional(),
  deviceName: z.string().max(100).optional(),
  platform: z.enum(['ios', 'android', 'web']),
  ipAddress: ipAddressSchema,
  userAgent: userAgentSchema,
  createdAt: z.date(),
  lastActivity: z.date(),
  expiresAt: z.date(),
  isActive: z.boolean(),
  isSuspicious: z.boolean().default(false),
  trustScore: z.number().int().min(0).max(100),
});

export const revokeSessionSchema = z.object({
  sessionId: z.string().uuid(),
  reason: z.string().max(200).optional(),
});

export const deviceManagementSchema = z.object({
  deviceId: z.string(),
  deviceName: z.string().max(100),
  trusted: z.boolean().default(false),
  action: z.enum(['trust', 'untrust', 'remove']),
});

// User management schemas (admin)
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: roleSchema,
  organizationId: z.string().uuid().optional(),
  department: departmentSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  sendWelcomeEmail: z.boolean().default(true),
  temporaryPassword: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  role: roleSchema.optional(),
  organizationId: z.string().uuid().optional(),
  department: departmentSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  isActive: z.boolean().optional(),
});

export const deleteUserSchema = z.object({
  userId: z.string().uuid(),
  transferDataTo: z.string().uuid().optional(),
  reason: z.string().min(10, 'Deletion reason must be at least 10 characters'),
  confirmDelete: z.boolean().refine(val => val === true, {
    message: 'You must confirm user deletion',
  }),
});

// Organization schemas
export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(200),
  type: z.enum(['business', 'nonprofit', 'government', 'education', 'other']),
  size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']),
  industry: z.string().max(100).optional(),
  website: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  settings: z.object({
    allowSelfRegistration: z.boolean().default(false),
    requireApproval: z.boolean().default(true),
    sessionTimeout: z.number().int().min(15).max(480).default(30), // minutes
    maxSessions: z.number().int().min(1).max(20).default(5),
    require2FA: z.boolean().default(false),
    allowedDomains: z.array(z.string().email()).optional(),
  }),
});

// Invitation schemas
export const inviteUserSchema = z.object({
  email: emailSchema,
  role: roleSchema,
  department: departmentSchema.optional(),
  message: z.string().max(500).optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  name: nameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Audit and security schemas
export const auditLogSchema = z.object({
  action: z.string(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  ipAddress: ipAddressSchema.optional(),
  userAgent: userAgentSchema.optional(),
  outcome: z.enum(['SUCCESS', 'FAILURE', 'PARTIAL']),
  details: z.record(z.any()).optional(),
  timestamp: z.date(),
});

export const securityEventSchema = z.object({
  type: z.enum([
    'failed_login',
    'account_locked',
    'suspicious_activity',
    'privilege_escalation',
    'unusual_location',
    'device_mismatch',
  ]),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  userId: z.string().uuid().optional(),
  details: z.record(z.any()),
  autoResolved: z.boolean().default(false),
});

// API key management schemas
export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  ipWhitelist: z.array(ipAddressSchema).optional(),
});

export const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  ipWhitelist: z.array(ipAddressSchema).optional(),
});

// Legacy compatibility - keep existing exports
export const UserRole = roleSchema;
export const loginSchema = signInSchema;
export const signupSchema = signUpSchema;
export const forgotPasswordSchema = resetPasswordSchema;

// Export all types
export type UserRole = z.infer<typeof roleSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SocialSignInInput = z.infer<typeof socialSignInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordConfirmInput = z.infer<typeof resetPasswordConfirmSchema>;
export type Enable2FAInput = z.infer<typeof enable2FASchema>;
export type Verify2FASetupInput = z.infer<typeof verify2FASetupSchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
export type Disable2FAInput = z.infer<typeof disable2FASchema>;
export type SessionData = z.infer<typeof sessionSchema>;
export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>;
export type DeviceManagementInput = z.infer<typeof deviceManagementSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type OrganizationData = z.infer<typeof organizationSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type AuditLogData = z.infer<typeof auditLogSchema>;
export type SecurityEventData = z.infer<typeof securityEventSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;

// Legacy compatibility
export type LoginInput = SignInInput;
export type SignupInput = SignUpInput;
export type ForgotPasswordInput = ResetPasswordInput;