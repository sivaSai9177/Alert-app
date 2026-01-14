import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role"), // admin, manager, user, guest - nullable for new OAuth users who need to complete profile
  organizationId: text("organization_id"),
  needsProfileCompletion: boolean("needs_profile_completion")
    .$defaultFn(() => true)
    .notNull(),
  
  // Additional user fields
  phoneNumber: text("phone_number"),
  department: text("department"),
  organizationName: text("organization_name"),
  jobTitle: text("job_title"),
  bio: text("bio"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  passwordChangedAt: timestamp("password_changed_at"),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  
  // Audit trail
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // Enhanced session security fields
  deviceId: text("device_id"), // Unique device identifier
  deviceName: text("device_name"), // User-friendly device name
  deviceFingerprint: text("device_fingerprint"), // Browser/device fingerprint
  platform: text("platform"), // ios, android, web
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Session monitoring
  lastActivity: timestamp("last_activity").defaultNow(),
  isActive: boolean("is_active").default(true),
  revokedAt: timestamp("revoked_at"),
  revokeReason: text("revoke_reason"),
  
  // Security features
  maxInactiveMinutes: integer("max_inactive_minutes").default(30), // Configurable timeout
  maxSessionHours: integer("max_session_hours").default(8), // Configurable session limit
  requiresReauth: boolean("requires_reauth").default(false), // Force re-authentication
  
  // Geographic and security monitoring
  country: text("country"),
  city: text("city"),
  timezone: text("timezone"),
  isSuspicious: boolean("is_suspicious").default(false),
  trustScore: integer("trust_score").default(100), // 0-100 trust score
  
  // Session metadata
  loginMethod: text("login_method"), // email, google, apple, etc.
  twoFactorVerified: boolean("two_factor_verified").default(false),
  sessionType: text("session_type").default("regular"), // regular, elevated, readonly
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

// Enhanced tables for organizations

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Enhanced audit logging for compliance and security
export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  sessionId: text("session_id").references(() => session.id),
  
  // Core audit information
  action: text("action").notNull(), // LOGIN, LOGOUT, VIEW_DATA, UPDATE_USER, CREATE_CONTENT, etc.
  outcome: text("outcome").notNull(), // SUCCESS, FAILURE, PARTIAL_SUCCESS
  resource: text("resource"), // Resource being accessed (user_id, content_id, etc.)
  entityType: text("entity_type"), // user, content, organization, etc.
  entityId: text("entity_id"),
  
  // User and system context
  userRole: text("user_role"),
  userName: text("user_name"), // Snapshot for audit integrity
  userEmail: text("user_email"), // Snapshot for audit integrity
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  platform: text("platform"), // ios, android, web
  
  // Detailed context and metadata
  description: text("description"), // Human-readable description of the action
  metadata: text("metadata"), // JSON string with additional context
  beforeState: text("before_state"), // JSON snapshot of data before change
  afterState: text("after_state"), // JSON snapshot of data after change
  
  // Business compliance fields
  reasonCode: text("reason_code"), // Business justification for access
  accessJustification: text("access_justification"), // Why access was needed
  sensitiveDataAccessed: boolean("sensitive_data_accessed").default(false), // If sensitive data was accessed
  department: text("department"), // User's department at time of action
  organizationId: text("organization_id"), // Organization context
  
  // Timing and retention
  timestamp: timestamp("timestamp")
    .$defaultFn(() => new Date())
    .notNull(),
  retentionUntil: timestamp("retention_until"), // Configurable retention period
  
  // Integrity and security
  checksum: text("checksum"), // For tamper detection
  severity: text("severity").notNull().default("INFO"), // INFO, WARNING, ERROR, CRITICAL
  alertGenerated: boolean("alert_generated").notNull().default(false), // If security alert was triggered
  
  // System tracking
  applicationVersion: text("application_version"),
  requestId: text("request_id"), // For correlating related actions
  traceId: text("trace_id"), // For distributed tracing
});

// Two-factor authentication tokens
export const twoFactorToken = pgTable("two_factor_token", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes"), // JSON array of backup codes
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Alias export for backward compatibility
export const users = user;
