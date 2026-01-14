# 🗄️ Database & API Tasks - Backend Enhancement

## 📊 Module Status
- **Current Grade**: B (75% complete)
- **Target Grade**: A (100% complete)
- **Priority**: 🟠 High
- **Estimated Time**: 12 hours
- **Dependencies**: AUTHENTICATION_TASKS.md, SECURITY_COMPLIANCE_TASKS.md

## 🎯 Objective
Enhance the database schema and tRPC API implementation to support healthcare-grade features with proper audit trails, optimized queries, and Phase 2 alert system preparation.

## 🚨 Issues Identified
1. **Basic Database Schema**: Missing healthcare-specific fields and audit tables
2. **Incomplete tRPC Procedures**: Missing advanced auth and user management
3. **No Query Optimization**: Basic queries without indexing or performance optimization
4. **Missing Alert Schema**: Phase 2 preparation incomplete
5. **No Database Migration Strategy**: Schema changes not properly managed

## 📋 Task Breakdown

### **Task 1: Enhanced Database Schema**
**Priority**: 🟠 High | **Time**: 4h | **Status**: ❌ Not Started

**Description**: Enhance the database schema with healthcare-specific fields, audit tables, and Phase 2 alert system preparation.

**Current Issues**:
```sql
-- BASIC: Current user schema
users {
  id: text
  name: text  
  email: text
  role: text
}

-- MISSING: Healthcare-specific fields, audit tables, alert schema
```

**Target Implementation**:
```typescript
// Enhanced user schema
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('email_verified').default(false),
  name: text('name').notNull(),
  role: text('role', { 
    enum: ['operator', 'doctor', 'nurse', 'head_doctor', 'admin'] 
  }).notNull(),
  
  // Healthcare-specific fields
  department: text('department').notNull(),
  hospitalId: text('hospital_id').references(() => hospitals.id),
  licenseNumber: text('license_number'),
  specialization: text('specialization'),
  shiftSchedule: json('shift_schedule'), // Work hours
  
  // Security fields
  isActive: boolean('is_active').default(true),
  isLocked: boolean('is_locked').default(false),
  lockoutUntil: timestamp('lockout_until'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: text('last_login_ip'),
  
  // 2FA fields
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorBackupCodes: json('two_factor_backup_codes'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Hospital organization schema
export const hospitals = pgTable('hospitals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  licenseNumber: text('license_number'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Departments schema
export const departments = pgTable('departments', {
  id: text('id').primaryKey(),
  hospitalId: text('hospital_id').references(() => hospitals.id),
  name: text('name').notNull(), // 'Emergency', 'ICU', 'Cardiology'
  code: text('code').notNull(), // 'ER', 'ICU', 'CARD'
  isActive: boolean('is_active').default(true),
});

// Phase 2: Alert system schema
export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  hospitalId: text('hospital_id').references(() => hospitals.id),
  departmentId: text('department_id').references(() => departments.id),
  
  // Alert details
  title: text('title').notNull(), // 'Cardiac Arrest'
  description: text('description'),
  priority: text('priority', { 
    enum: ['low', 'medium', 'high', 'critical'] 
  }).notNull(),
  alertType: text('alert_type').notNull(), // 'medical', 'security', 'fire'
  roomNumber: text('room_number'),
  
  // Status tracking
  status: text('status', { 
    enum: ['active', 'acknowledged', 'resolved', 'cancelled'] 
  }).default('active'),
  escalationLevel: integer('escalation_level').default(0),
  
  // User tracking
  createdBy: text('created_by').references(() => users.id),
  acknowledgedBy: text('acknowledged_by').references(() => users.id),
  acknowledgedAt: timestamp('acknowledged_at'),
  resolvedBy: text('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // Auto-resolve time
});

// Alert escalation logs
export const alertEscalations = pgTable('alert_escalations', {
  id: text('id').primaryKey(),
  alertId: text('alert_id').references(() => alerts.id),
  fromLevel: integer('from_level'),
  toLevel: integer('to_level'),
  reason: text('reason'), // 'timeout', 'manual', 'no_response'
  escalatedAt: timestamp('escalated_at').defaultNow(),
});

// Audit logs (HIPAA compliance)
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  hospitalId: text('hospital_id').references(() => hospitals.id),
  
  // Audit details
  action: text('action').notNull(), // 'login', 'view_patient', 'create_alert'
  resource: text('resource'), // 'user', 'alert', 'patient'
  resourceId: text('resource_id'),
  outcome: text('outcome', { enum: ['success', 'failure'] }).notNull(),
  
  // Context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  sessionId: text('session_id'),
  metadata: json('metadata'), // Additional context
  
  // Compliance
  timestamp: timestamp('timestamp').defaultNow(),
  retentionUntil: timestamp('retention_until'), // 6 years for HIPAA
});
```

**Required Features**:
1. **Healthcare Fields**:
   - [ ] Department and hospital associations
   - [ ] License numbers and specializations  
   - [ ] Shift schedules and work hours
   - [ ] Healthcare role hierarchy

2. **Security Enhancement**:
   - [ ] Account lockout fields
   - [ ] Login attempt tracking
   - [ ] 2FA secret storage
   - [ ] Session security fields

3. **Alert System (Phase 2 Prep)**:
   - [ ] Complete alert schema
   - [ ] Escalation tracking
   - [ ] Status management
   - [ ] Priority and type classification

4. **Audit Trail (HIPAA)**:
   - [ ] Comprehensive audit logging
   - [ ] 6-year retention tracking
   - [ ] Action categorization
   - [ ] Context preservation

**Acceptance Criteria**:
- [ ] All tables created with proper relationships
- [ ] Indexes created for performance
- [ ] Foreign key constraints properly defined
- [ ] Migration scripts created
- [ ] Seed data for development
- [ ] Schema documentation updated

**Files to Create/Modify**:
- `src/db/schema.ts` - Enhanced schema
- `src/db/migrations/` - Migration scripts
- `src/db/seed.ts` - Development seed data
- `drizzle.config.ts` - Migration configuration

---

### **Task 2: Complete tRPC API Procedures**
**Priority**: 🟠 High | **Time**: 5h | **Status**: ❌ Not Started

**Description**: Implement complete tRPC API with all user management, audit, and Phase 2 preparation procedures.

**Current Issues**:
- Basic auth procedures only
- Missing user management
- No audit API
- No hospital/department management

**Target Implementation**:
```typescript
// Complete API structure
export const appRouter = router({
  auth: authRouter,           // ✅ Enhanced in AUTH_TASKS
  users: usersRouter,         // ❌ NEW
  hospitals: hospitalsRouter, // ❌ NEW  
  audit: auditRouter,         // ❌ NEW
  alerts: alertsRouter,       // ❌ NEW (Phase 2 prep)
});

// User management router with Zod validation
const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['operator', 'doctor', 'nurse', 'head_doctor', 'admin']).optional(),
});

const createUserSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  role: z.enum(['operator', 'doctor', 'nurse', 'head_doctor']),
  department: z.string().min(1).trim(),
  licenseNumber: z.string().optional(),
});

export const usersRouter = router({
  // User queries
  getAll: adminProcedure
    .input(paginationSchema)
    .output(z.object({
      users: z.array(hospitalUserSchema),
      total: z.number(),
      page: z.number(),
      totalPages: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      return await getUsersWithPagination(input, ctx.user.hospitalId);
    }),
    
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      await checkPermission(ctx.user, 'view_user', input.id);
      return await getUserById(input.id);
    }),
    
  // User mutations  
  create: adminProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await createUser(input, ctx.user.hospitalId);
      await logAuditEvent('user_created', ctx.user.id, { targetUserId: user.id });
      return user;
    }),
    
  update: adminProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.user, 'update_user', input.id);
      const user = await updateUser(input);
      await logAuditEvent('user_updated', ctx.user.id, { targetUserId: input.id });
      return user;
    }),
    
  deactivate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await deactivateUser(input.id);
      await logAuditEvent('user_deactivated', ctx.user.id, { targetUserId: input.id });
    }),
    
  // Role management
  updateRole: adminProcedure
    .input(updateRoleSchema)
    .mutation(async ({ input, ctx }) => {
      await updateUserRole(input.userId, input.role);
      await logAuditEvent('role_changed', ctx.user.id, input);
    }),
});

// Hospital management router
export const hospitalsRouter = router({
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      return await getHospitalById(ctx.user.hospitalId);
    }),
    
  getDepartments: protectedProcedure
    .query(async ({ ctx }) => {
      return await getDepartmentsByHospital(ctx.user.hospitalId);
    }),
    
  updateSettings: adminProcedure
    .input(hospitalSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      await updateHospitalSettings(ctx.user.hospitalId, input);
      await logAuditEvent('hospital_settings_updated', ctx.user.id, input);
    }),
});

// Audit router (HIPAA compliance)
export const auditRouter = router({
  getLogs: adminProcedure
    .input(auditQuerySchema)
    .query(async ({ input, ctx }) => {
      await checkPermission(ctx.user, 'view_audit_logs');
      return await getAuditLogs(input, ctx.user.hospitalId);
    }),
    
  exportLogs: adminProcedure
    .input(exportAuditSchema)
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.user, 'export_audit_logs');
      const exportJob = await createAuditExport(input, ctx.user.hospitalId);
      await logAuditEvent('audit_export_requested', ctx.user.id, input);
      return exportJob;
    }),
    
  getComplianceReport: adminProcedure
    .input(complianceReportSchema)
    .query(async ({ input, ctx }) => {
      return await generateComplianceReport(input, ctx.user.hospitalId);
    }),
});

// Alert router (Phase 2 preparation)
export const alertsRouter = router({
  // Basic alert operations (Phase 2 implementation)
  create: operatorProcedure
    .input(createAlertSchema)
    .mutation(async ({ input, ctx }) => {
      const alert = await createAlert(input, ctx.user);
      await logAuditEvent('alert_created', ctx.user.id, { alertId: alert.id });
      // TODO: Trigger real-time notifications
      return alert;
    }),
    
  getActive: protectedProcedure
    .query(async ({ ctx }) => {
      const roleFilter = getRoleBasedAlertFilter(ctx.user.role);
      return await getActiveAlerts(ctx.user.hospitalId, roleFilter);
    }),
    
  acknowledge: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.user, 'acknowledge_alert');
      await acknowledgeAlert(input.alertId, ctx.user.id);
      await logAuditEvent('alert_acknowledged', ctx.user.id, input);
    }),
});
```

**Required Features**:
1. **User Management**:
   - [ ] CRUD operations for users
   - [ ] Role management
   - [ ] Department assignments
   - [ ] User activation/deactivation

2. **Hospital Management**:
   - [ ] Hospital settings
   - [ ] Department management
   - [ ] Configuration options
   - [ ] Multi-tenant support

3. **Audit API**:
   - [ ] Audit log querying
   - [ ] Compliance reporting
   - [ ] Export functionality
   - [ ] Retention management

4. **Alert System API** (Phase 2 prep):
   - [ ] Alert CRUD operations
   - [ ] Status management
   - [ ] Escalation handling
   - [ ] Real-time integration points

**Acceptance Criteria**:
- [ ] All procedures properly typed and validated with Zod schemas
- [ ] Input/output validation with comprehensive error messages
- [ ] Runtime type safety with compile-time TypeScript support
- [ ] Permission checking integrated
- [ ] Audit logging for all operations
- [ ] Error handling with proper HTTP codes
- [ ] Integration tests for all procedures
- [ ] API documentation generated from Zod schemas

**Files to Create/Modify**:
- `lib/validations/users.ts` - User management Zod schemas
- `lib/validations/hospitals.ts` - Hospital/department schemas
- `lib/validations/alerts.ts` - Alert system schemas (Phase 2 prep)
- `src/server/routers/users.ts` - New with Zod validation
- `src/server/routers/hospitals.ts` - New with Zod validation
- `src/server/routers/audit.ts` - New with Zod validation
- `src/server/routers/alerts.ts` - New (Phase 2 prep)
- `src/server/routers/index.ts` - Update router composition

---

### **Task 3: Database Performance Optimization**
**Priority**: 🟡 Medium | **Time**: 2h | **Status**: ❌ Not Started

**Description**: Implement database indexing, query optimization, and connection pooling for production performance.

**Current Issues**:
- No database indexes
- Basic queries without optimization
- No connection pooling
- No query performance monitoring

**Target Implementation**:
```typescript
// Database indexes
export const userIndexes = {
  emailIndex: index('users_email_idx').on(users.email),
  hospitalIndex: index('users_hospital_idx').on(users.hospitalId),
  roleIndex: index('users_role_idx').on(users.role),
  activeIndex: index('users_active_idx').on(users.isActive),
};

export const auditIndexes = {
  userTimestampIndex: index('audit_user_timestamp_idx')
    .on(auditLogs.userId, auditLogs.timestamp),
  actionIndex: index('audit_action_idx').on(auditLogs.action),
  retentionIndex: index('audit_retention_idx').on(auditLogs.retentionUntil),
};

export const alertIndexes = {
  statusIndex: index('alerts_status_idx').on(alerts.status),
  hospitalDeptIndex: index('alerts_hospital_dept_idx')
    .on(alerts.hospitalId, alerts.departmentId),
  priorityIndex: index('alerts_priority_idx').on(alerts.priority),
  createdAtIndex: index('alerts_created_at_idx').on(alerts.createdAt),
};

// Optimized queries
export const optimizedQueries = {
  getUsersWithRoles: db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      department: departments.name,
    })
    .from(users)
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .where(eq(users.hospitalId, placeholder('hospitalId')))
    .prepare(),
    
  getActiveAlertsByRole: db
    .select()
    .from(alerts)
    .where(
      and(
        eq(alerts.hospitalId, placeholder('hospitalId')),
        eq(alerts.status, 'active'),
        inArray(alerts.departmentId, placeholder('departmentIds'))
      )
    )
    .orderBy(desc(alerts.priority), desc(alerts.createdAt))
    .limit(placeholder('limit'))
    .prepare(),
};

// Connection pooling configuration
export const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  min: 5,  // Minimum connections
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
};
```

**Required Features**:
1. **Database Indexes**:
   - [ ] Primary query path indexes
   - [ ] Composite indexes for common queries
   - [ ] Audit log performance indexes
   - [ ] Alert system indexes

2. **Query Optimization**:
   - [ ] Prepared statements for common queries
   - [ ] Efficient joins and subqueries
   - [ ] Pagination optimization
   - [ ] Bulk operations

3. **Connection Management**:
   - [ ] Connection pooling configuration
   - [ ] Connection monitoring
   - [ ] Timeout management
   - [ ] Health checks

4. **Performance Monitoring**:
   - [ ] Query performance logging
   - [ ] Slow query detection
   - [ ] Connection pool metrics
   - [ ] Database health monitoring

**Acceptance Criteria**:
- [ ] All indexes created and documented
- [ ] Query performance improved by >50%
- [ ] Connection pooling properly configured
- [ ] Performance monitoring in place
- [ ] Load testing validates improvements

**Files to Create/Modify**:
- `src/db/indexes.ts` - Database indexes
- `src/db/optimized-queries.ts` - Prepared statements
- `src/db/index.ts` - Connection pooling
- `src/server/middleware/performance.ts` - Performance monitoring

---

### **Task 4: Migration and Deployment Strategy**
**Priority**: 🟡 Medium | **Time**: 1h | **Status**: ❌ Not Started

**Description**: Implement proper database migration strategy with rollback capabilities and deployment procedures.

**Current Issues**:
- No migration strategy
- Manual schema changes
- No rollback procedures
- No environment-specific configurations

**Target Implementation**:
```typescript
// Migration system
export const migrations = {
  '001_initial_schema': {
    up: async (db) => {
      // Create initial tables
      await db.execute(sql`CREATE TABLE users (...)`);
      await db.execute(sql`CREATE TABLE hospitals (...)`);
    },
    down: async (db) => {
      await db.execute(sql`DROP TABLE users`);
      await db.execute(sql`DROP TABLE hospitals`);
    },
  },
  
  '002_add_audit_logs': {
    up: async (db) => {
      await db.execute(sql`CREATE TABLE audit_logs (...)`);
      await db.execute(sql`CREATE INDEX audit_user_timestamp_idx ...`);
    },
    down: async (db) => {
      await db.execute(sql`DROP TABLE audit_logs`);
    },
  },
  
  '003_add_alert_system': {
    up: async (db) => {
      await db.execute(sql`CREATE TABLE alerts (...)`);
      await db.execute(sql`CREATE TABLE alert_escalations (...)`);
    },
    down: async (db) => {
      await db.execute(sql`DROP TABLE alert_escalations`);
      await db.execute(sql`DROP TABLE alerts`);
    },
  },
};

// Environment configurations
export const environments = {
  development: {
    database: {
      host: 'localhost',
      port: 5432,
      ssl: false,
      pool: { min: 2, max: 10 },
    },
  },
  production: {
    database: {
      ssl: { rejectUnauthorized: false },
      pool: { min: 5, max: 25 },
      connectionTimeoutMillis: 30000,
    },
  },
};
```

**Required Features**:
1. **Migration System**:
   - [ ] Version-controlled migrations
   - [ ] Forward and backward migrations
   - [ ] Migration status tracking
   - [ ] Automated migration running

2. **Environment Management**:
   - [ ] Development configuration
   - [ ] Staging configuration  
   - [ ] Production configuration
   - [ ] Security-appropriate settings

3. **Deployment Procedures**:
   - [ ] Pre-deployment checks
   - [ ] Migration execution
   - [ ] Rollback procedures
   - [ ] Health verification

4. **Backup Strategy**:
   - [ ] Automated backups
   - [ ] Point-in-time recovery
   - [ ] Backup verification
   - [ ] Disaster recovery plan

**Acceptance Criteria**:
- [ ] Migration system working reliably
- [ ] Environment configurations tested
- [ ] Deployment procedures documented
- [ ] Rollback procedures tested
- [ ] Backup strategy implemented

**Files to Create**:
- `src/db/migrations/` - Migration files
- `src/db/migrate.ts` - Migration runner
- `scripts/deploy.sh` - Deployment script
- `scripts/rollback.sh` - Rollback script

---

## 🧪 Testing Requirements

### **Database Testing**
- [ ] Schema creation and migration tests
- [ ] Index performance verification
- [ ] Query optimization validation
- [ ] Connection pooling tests

### **API Testing**
- [ ] Complete procedure testing
- [ ] Permission verification
- [ ] Error handling validation
- [ ] Performance benchmarking

### **Integration Testing**
- [ ] End-to-end API flows
- [ ] Database transaction testing
- [ ] Audit logging verification
- [ ] Multi-user scenarios

## 🔍 Performance Targets

### **Database Performance**
- Query response time: <100ms for simple queries
- Complex queries: <500ms
- Concurrent users: 100+ without degradation
- Connection pool efficiency: >90%

### **API Performance**
- Procedure response time: <200ms
- Pagination queries: <300ms
- Bulk operations: <1s per 100 records
- Memory usage: <512MB baseline

## 🚀 Implementation Order

1. **Task 1**: Enhanced database schema (foundation)
2. **Task 3**: Performance optimization (before heavy usage)
3. **Task 2**: Complete API procedures (build on optimized base)
4. **Task 4**: Migration strategy (deployment readiness)

## 📝 Documentation Updates

### **API Documentation**:
- [ ] Complete procedure documentation
- [ ] Permission requirements
- [ ] Input/output schemas
- [ ] Error codes and handling

### **Database Documentation**:
- [ ] Schema relationship diagrams
- [ ] Index strategy explanation
- [ ] Migration procedures
- [ ] Performance tuning guide

## 🎯 Success Criteria

### **Technical Success**
- [ ] All procedures working and tested
- [ ] Database performance targets met
- [ ] Migration system reliable
- [ ] Audit trail compliant with HIPAA

### **Business Success**
- [ ] Support for 100+ concurrent users
- [ ] Ready for Phase 2 alert system
- [ ] Healthcare compliance achieved
- [ ] Scalable for multi-hospital deployment

## 📞 Support

**Questions/Issues**: Create issue with "database-api" label
**Performance Issues**: Include query execution plans
**Schema Changes**: Require migration scripts

---

**Next Steps**: Start with Task 1 (Enhanced database schema) as it provides the foundation for all other backend improvements.