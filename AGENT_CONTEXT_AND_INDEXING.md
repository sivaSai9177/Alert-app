# 🤖 Agent Context & Intelligent Indexing System

## 📌 Quick Context for AI Agents

**Project**: Hospital Alert System MVP  
**Stack**: React Native (Expo) + tRPC + PostgreSQL + Better Auth  
**Current Phase**: Week 1-2 (Foundation) of 8-week MVP  
**Architecture**: Monorepo with separated frontend/backend  

### 🎯 Current Focus
Building real-time hospital alert system with:
- Role-based access (Operator, Doctor, Nurse, Head Doctor)
- Push notifications with escalation
- Real-time WebSocket updates
- HIPAA-compliant audit trails

---

## 🗂️ Intelligent File Index

### 🔴 Critical Files (Always Read First)

```yaml
Configuration:
  - /package.json                    # Project identity & dependencies
  - /app.json                       # Expo configuration
  - /.env.example                   # Environment variables template
  - /CLAUDE.md                      # AI agent memory & context

Entry Points:
  - /app/_layout.tsx                # Root layout with providers
  - /app/index.tsx                  # App entry point
  - /src/server/trpc.ts            # API configuration

Current Focus:
  - /HOSPITAL_ALERT_PRD.md         # Product requirements
  - /HOSPITAL_MVP_TASK_PLAN.md     # Current sprint tasks
  - /src/db/healthcare-schema.ts   # Healthcare database schema
```

### 🟡 Context Files (Read When Working on Features)

```yaml
Authentication:
  - /lib/auth/auth.ts              # Better Auth configuration
  - /lib/stores/auth-store.ts      # Auth state management
  - /app/(auth)/*.tsx              # Auth screens

Healthcare Features:
  - /components/healthcare/*.tsx    # Healthcare UI components
  - /src/server/routers/healthcare.ts # Healthcare API
  - /hooks/useAlert*.tsx           # Alert-related hooks

Database:
  - /src/db/schema.ts              # Base database schema
  - /src/db/combined-schema.ts     # Combined schemas
  - /drizzle.config.ts             # ORM configuration

API Layer:
  - /src/server/routers/index.ts   # Router exports
  - /lib/trpc.tsx                  # tRPC client
  - /app/api/trpc/[trpc]+api.ts   # API handler
```

### 🟢 Reference Files (Read As Needed)

```yaml
UI Components:
  - /components/universal/         # Cross-platform components
  - /components/ui/               # Custom UI components
  - /lib/design-system/           # Design tokens

Testing:
  - /__tests__/unit/              # Unit tests
  - /__tests__/integration/       # Integration tests
  - /jest.config.js              # Test configuration

Documentation:
  - /docs/guides/                # How-to guides
  - /docs/architecture/          # System design
  - /docs/api/                   # API documentation

Scripts:
  - /scripts/setup/              # Setup scripts
  - /scripts/dev/                # Development scripts
  - /scripts/build/              # Build scripts
```

---

## 🧠 Smart Context Loading Strategy

### For Different Tasks:

#### 1. **Starting New Feature**
```typescript
// Load in this order:
1. CLAUDE.md                     // AI memory
2. HOSPITAL_MVP_TASK_PLAN.md    // Current tasks
3. Related feature files         // Existing patterns
4. Database schema              // Data structure
5. API routers                  // Endpoints
```

#### 2. **Fixing Bugs**
```typescript
// Load in this order:
1. Error location file          // Where error occurs
2. Related test files          // Expected behavior
3. Import dependencies         // Connected files
4. Similar working features    // Reference implementation
```

#### 3. **Adding Healthcare Features**
```typescript
// Load in this order:
1. healthcare-schema.ts        // Data models
2. healthcare.ts (router)      // API patterns
3. Healthcare components       // UI patterns
4. Alert hooks                // State patterns
```

#### 4. **UI Development**
```typescript
// Load in this order:
1. Universal components        // Reusable components
2. Design system              // Tokens & themes
3. Similar screens            // Layout patterns
4. Navigation structure       // Routing context
```

---

## 📊 Project Status Dashboard

### Current Sprint Progress
```yaml
Phase 1 (Week 1-2): Foundation
  ✅ Authentication system
  ✅ Basic project structure
  ✅ Project documentation
  🔄 Database schema implementation (30%)
  ⏳ Role system enhancement
  ⏳ Healthcare UI components
```

### Key Metrics
```yaml
Overall Progress: 15% ███░░░░░░░░░░░░░░░░░
Code Coverage: 98%
Bundle Size: Optimized (removed 73MB)
Components: 48+ universal components
Performance: React 19 optimized
```

### Active Work Areas
```yaml
Priority 1:
  - Healthcare database schema
  - Role-based permissions
  - Alert creation form

Priority 2:
  - Push notification setup
  - WebSocket configuration
  - Escalation timer system

Priority 3:
  - Audit logging enhancement
  - Performance monitoring
  - Documentation updates
```

---

## 🔍 Code Navigation Patterns

### Finding Features
```bash
# Healthcare features
grep -r "healthcare" --include="*.tsx" --include="*.ts"

# Alert-related code
grep -r "alert" --include="*.tsx" --include="*.ts" | grep -i "create\|escalat\|acknowledg"

# Role-based code
grep -r "role.*doctor\|nurse\|operator" --include="*.tsx" --include="*.ts"
```

### Understanding Data Flow
```
User Action → Component → Hook → API Call → tRPC Router → Service → Database
     ↑                                                                    ↓
     └──────────────────── State Update ←── Response ←──────────────────┘
```

### Component Hierarchy
```
App Layout
├── Auth Layout
│   ├── Login Screen
│   ├── Register Screen
│   └── Profile Completion
└── Protected Layout
    ├── Role-Based Dashboard
    │   ├── Operator Dashboard
    │   ├── Doctor Dashboard
    │   └── Nurse Dashboard
    └── Common Features
        ├── Settings
        └── Profile
```

---

## 🎯 Task-Specific Contexts

### For Hospital Alert MVP:

#### Alert Creation (Operator)
```yaml
Primary Files:
  - /components/healthcare/AlertCreationForm.tsx
  - /src/server/routers/healthcare.ts # createAlert procedure
  - /src/db/healthcare-schema.ts # alerts table
  - /lib/validations/healthcare.ts # Alert validation

Context Needed:
  - Alert types and urgency levels
  - Room number validation
  - Push notification trigger
  - Audit logging
```

#### Alert Acknowledgment (Medical Staff)
```yaml
Primary Files:
  - /components/healthcare/AlertDashboard.tsx
  - /hooks/useAlertSubscription.tsx
  - /src/server/services/alert-subscriptions.ts
  - /src/server/routers/healthcare.ts # acknowledgeAlert

Context Needed:
  - Real-time updates via WebSocket
  - Acknowledgment state management
  - Response time tracking
  - Escalation prevention
```

#### Escalation System
```yaml
Primary Files:
  - /src/server/services/escalation-timer.ts
  - /components/healthcare/EscalationTimer.tsx
  - /src/db/healthcare-schema.ts # alertEscalations
  - /lib/core/background-jobs.ts

Context Needed:
  - Timer configuration (2min, 3min, 2min)
  - Role hierarchy (Nurse → Doctor → Head Doctor)
  - Notification retry logic
  - Escalation history tracking
```

---

## 🚀 Quick Command Reference

### Development Commands
```bash
# Start development
bun run dev              # Web dev server
bun run ios             # iOS simulator
bun run android         # Android emulator

# Database
bun db:push             # Push schema changes
bun db:studio           # Visual database editor
bun db:migrate          # Run migrations

# Testing
bun test                # Run all tests
bun test:unit          # Unit tests only
bun test:e2e           # E2E tests

# Healthcare specific
bun run setup:healthcare # Setup healthcare demo data
bun run test:alerts     # Test alert system
```

### Common Fixes
```bash
# Clear caches
bun run clean           # Clean all caches
bun run reset:ios      # Reset iOS build
bun run reset:android  # Reset Android build

# Fix common issues
bun run fix:types      # Regenerate TypeScript types
bun run fix:deps       # Fix dependency issues
bun run fix:metro      # Fix Metro bundler
```

---

## 📝 Agent Instructions

### When Working on This Codebase:

1. **Always Check CLAUDE.md First** - Contains critical project context and patterns
2. **Follow Existing Patterns** - Look for similar implementations before creating new ones
3. **Use Universal Components** - Prefer `/components/universal/` over custom implementations
4. **Maintain Type Safety** - Always define proper TypeScript types
5. **Update Task Plan** - Mark tasks complete in HOSPITAL_MVP_TASK_PLAN.md
6. **Test Changes** - Run relevant tests before committing
7. **Document Decisions** - Add notes to this file for future agents

### Context Loading Optimization:

```typescript
// Efficient context loading pattern
const loadContext = async (task: TaskType) => {
  // 1. Load core context
  await loadFile('CLAUDE.md');
  await loadFile('HOSPITAL_MVP_TASK_PLAN.md');
  
  // 2. Load task-specific context
  const files = getTaskFiles(task);
  await Promise.all(files.map(loadFile));
  
  // 3. Load dependencies only if needed
  if (hasImports(files)) {
    await loadImportedFiles(files);
  }
};
```

---

## 🔄 Living Document

This document should be updated when:
- Major architectural changes occur
- New patterns are established
- Sprint phases change
- Common issues are discovered
- Performance optimizations are made

**Last Updated**: January 8, 2025  
**Current Sprint**: Week 1-2 (Foundation)  
**Next Review**: Week 3 Sprint Planning

---

*This indexing system is optimized for AI agents to quickly understand and navigate the Hospital Alert System MVP codebase.*