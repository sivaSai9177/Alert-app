# 🗄️ Database Schema Documentation

This document provides a comprehensive overview of the database schema used in the Full-Stack Expo Starter Kit.

## Overview

The application uses **PostgreSQL** as the database with **Drizzle ORM** for type-safe database operations. The schema is designed for scalability, security, and compliance with modern business requirements.

## Core Tables

### Users Table (`user`)

The central user table with comprehensive profile information.

```sql
CREATE TABLE "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  "image" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  -- Custom fields for business logic
  "role" TEXT DEFAULT 'user',
  "organizationId" TEXT,
  "organizationName" TEXT,
  "department" TEXT,
  "jobTitle" TEXT,
  "bio" TEXT,
  "needsProfileCompletion" BOOLEAN DEFAULT true,
  
  -- Compliance and audit fields
  "lastLoginAt" TIMESTAMP,
  "loginCount" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "deletedAt" TIMESTAMP
);
```

#### User Roles
- `admin`: Full system access
- `manager`: Team and content management
- `user`: Standard user access
- `guest`: Limited access (temporary)

#### Profile Completion Flow
- New users start with `needsProfileCompletion = true`
- After completing profile wizard: `needsProfileCompletion = false`
- Required fields: `role`, `organizationId` or `organizationName`

### Sessions Table (`session`)

Manages user authentication sessions with security features.

```sql
CREATE TABLE "session" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "token" TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  -- Security fields
  "lastActivityAt" TIMESTAMP DEFAULT NOW(),
  "deviceFingerprint" TEXT,
  "isActive" BOOLEAN DEFAULT true
);
```

#### Session Features
- **Multi-session support**: Users can have up to 5 active sessions
- **Device tracking**: IP address and user agent logging
- **Automatic expiry**: 7-day expiration with 1-day refresh window
- **Security monitoring**: Device fingerprinting and activity tracking

### Organizations Table (`organization`)

Manages organizational structures and team hierarchies.

```sql
CREATE TABLE "organization" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "logo" TEXT,
  "website" TEXT,
  "industry" TEXT,
  "size" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  -- Subscription and billing
  "plan" TEXT DEFAULT 'free',
  "maxUsers" INTEGER DEFAULT 5,
  "billingEmail" TEXT,
  
  -- Status
  "isActive" BOOLEAN DEFAULT true,
  "deletedAt" TIMESTAMP
);
```

#### Organization Plans
- `free`: Up to 5 users
- `pro`: Up to 50 users
- `enterprise`: Unlimited users

### Accounts Table (`account`)

Manages OAuth and external authentication providers.

```sql
CREATE TABLE "account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(provider, providerAccountId)
);
```

#### Supported Providers
- `google`: Google OAuth 2.0
- `apple`: Apple Sign-In (iOS)
- `microsoft`: Microsoft Azure AD (Enterprise)

### Verification Tokens Table (`verificationToken`)

Handles email verification and password reset tokens.

```sql
CREATE TABLE "verificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  "type" TEXT DEFAULT 'email_verification',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY(identifier, token)
);
```

## Audit and Compliance Tables

### Audit Logs Table (`audit_logs`)

Comprehensive audit trail for security and compliance.

```sql
CREATE TABLE "audit_logs" (
  "id" TEXT PRIMARY KEY,
  "timestamp" TIMESTAMP DEFAULT NOW(),
  "action" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "severity" TEXT DEFAULT 'medium',
  
  -- User context
  "userId" TEXT REFERENCES "user"("id"),
  "userEmail" TEXT,
  "userRole" TEXT,
  
  -- Request context
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "requestId" TEXT,
  "sessionId" TEXT,
  
  -- Details
  "resourceType" TEXT,
  "resourceId" TEXT,
  "details" JSONB,
  "metadata" JSONB,
  
  -- Compliance
  "retentionUntil" TIMESTAMP,
  "isArchived" BOOLEAN DEFAULT false
);
```

#### Audit Event Types
- **Authentication**: `LOGIN`, `LOGOUT`, `FAILED_LOGIN`, `PASSWORD_RESET`
- **Authorization**: `ACCESS_GRANTED`, `ACCESS_DENIED`, `PRIVILEGE_ESCALATION`
- **Data**: `CREATE`, `READ`, `UPDATE`, `DELETE`
- **Security**: `SUSPICIOUS_ACTIVITY`, `SECURITY_VIOLATION`, `BREACH_DETECTED`

### User Activity Table (`user_activity`)

Tracks user behavior for analytics and security.

```sql
CREATE TABLE "user_activity" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id"),
  "sessionId" TEXT REFERENCES "session"("id"),
  "action" TEXT NOT NULL,
  "path" TEXT,
  "timestamp" TIMESTAMP DEFAULT NOW(),
  
  -- Context
  "duration" INTEGER, -- milliseconds
  "details" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT
);
```

## Database Relationships

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ ACCOUNT : has
    USER }o--|| ORGANIZATION : belongs_to
    USER ||--o{ AUDIT_LOGS : generates
    USER ||--o{ USER_ACTIVITY : performs
    
    USER {
        text id PK
        text email UK
        text role
        text organizationId FK
        boolean needsProfileCompletion
        timestamp createdAt
    }
    
    SESSION {
        text id PK
        text userId FK
        text token UK
        timestamp expiresAt
        text ipAddress
    }
    
    ORGANIZATION {
        text id PK
        text name UK
        text slug UK
        text plan
        integer maxUsers
    }
    
    ACCOUNT {
        text id PK
        text userId FK
        text provider
        text providerAccountId
    }
    
    AUDIT_LOGS {
        text id PK
        text userId FK
        text action
        text outcome
        jsonb details
    }
```

## Database Indexes

### Performance Indexes
```sql
-- User lookups
CREATE INDEX idx_user_email ON "user"("email");
CREATE INDEX idx_user_organization ON "user"("organizationId");
CREATE INDEX idx_user_role ON "user"("role");

-- Session management
CREATE INDEX idx_session_user ON "session"("userId");
CREATE INDEX idx_session_token ON "session"("token");
CREATE INDEX idx_session_expires ON "session"("expiresAt");

-- Audit and compliance
CREATE INDEX idx_audit_user ON "audit_logs"("userId");
CREATE INDEX idx_audit_timestamp ON "audit_logs"("timestamp");
CREATE INDEX idx_audit_action ON "audit_logs"("action");

-- OAuth accounts
CREATE INDEX idx_account_user ON "account"("userId");
CREATE INDEX idx_account_provider ON "account"("provider", "providerAccountId");
```

### Security Indexes
```sql
-- Failed login tracking
CREATE INDEX idx_audit_failed_logins ON "audit_logs"("ipAddress", "timestamp") 
WHERE action = 'FAILED_LOGIN';

-- Session security
CREATE INDEX idx_session_ip_activity ON "session"("ipAddress", "lastActivityAt");
```

## Data Types and Constraints

### UUID Generation
```typescript
// All IDs use crypto.randomUUID() for security
id: uuid('id').primaryKey().defaultRandom()
```

### Timestamps
```typescript
// Consistent timestamp handling
createdAt: timestamp('createdAt').defaultNow()
updatedAt: timestamp('updatedAt').defaultNow()
```

### JSONB Fields
```typescript
// Flexible data storage for complex objects
details: jsonb('details')
metadata: jsonb('metadata')
```

## Migration Strategy

### Schema Versioning
- Each migration is numbered sequentially
- Migrations are idempotent and can be run multiple times
- Rollback procedures are documented for each migration

### Data Migration
```bash
# Apply pending migrations
bun run db:push

# View migration status
bun run db:studio

# Generate new migration
bun run db:generate
```

## Security Considerations

### Data Protection
- **PII Encryption**: Sensitive fields are encrypted at rest
- **Access Control**: Row-level security for multi-tenant data
- **Audit Trail**: All data changes are logged
- **Backup Security**: Encrypted backups with rotation

### Compliance Features
- **GDPR**: User data export and deletion capabilities
- **SOC 2**: Comprehensive audit logging
- **HIPAA**: Data encryption and access controls (if applicable)
- **Retention Policies**: Automated data archival and deletion

## Performance Optimization

### Query Optimization
- Proper indexing on frequently queried columns
- Query analysis and optimization
- Connection pooling for scalability
- Read replicas for high-traffic applications

### Monitoring
- Slow query detection and alerting
- Connection pool monitoring
- Database performance metrics
- Automated backup verification

## Environment-Specific Configurations

### Development
```typescript
// Local PostgreSQL with relaxed constraints
connectionString: "postgresql://user:pass@localhost:5432/dev_db"
```

### Production
```typescript
// Neon or managed PostgreSQL with SSL
connectionString: "postgresql://user:pass@host:5432/prod_db?sslmode=require"
```

## Backup and Recovery

### Backup Strategy
- **Frequency**: Daily automated backups
- **Retention**: 30 days for production, 7 days for staging
- **Encryption**: AES-256 encrypted backups
- **Testing**: Monthly backup restoration tests

### Recovery Procedures
1. **Point-in-time recovery**: Up to 30 days
2. **Cross-region replication**: For disaster recovery
3. **Automated failover**: For high availability
4. **Data validation**: Post-recovery integrity checks

---

## Quick Reference

### Common Queries

#### User Management
```sql
-- Get user with organization
SELECT u.*, o.name as org_name 
FROM "user" u 
LEFT JOIN "organization" o ON u."organizationId" = o.id 
WHERE u.email = $1;

-- Active sessions for user
SELECT * FROM "session" 
WHERE "userId" = $1 AND "expiresAt" > NOW() AND "isActive" = true;
```

#### Audit Queries
```sql
-- Recent failed logins by IP
SELECT "ipAddress", COUNT(*) as attempts 
FROM "audit_logs" 
WHERE action = 'FAILED_LOGIN' AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY "ipAddress" 
ORDER BY attempts DESC;

-- User activity summary
SELECT u.email, COUNT(al.*) as total_actions
FROM "user" u
LEFT JOIN "audit_logs" al ON u.id = al."userId"
WHERE al.timestamp > NOW() - INTERVAL '24 hours'
GROUP BY u.id, u.email
ORDER BY total_actions DESC;
```

### Schema Updates
When adding new fields, always:
1. Add migration with default values
2. Update TypeScript types
3. Update Zod validation schemas
4. Test with existing data
5. Document in this file

---

For implementation details, see:
- [Database Setup Guide](../guides/DATABASE_SETUP.md)
- [Migration Procedures](../guides/MIGRATION_GUIDE.md)
- [Performance Tuning](../guides/DATABASE_PERFORMANCE.md)