# 🏛️ Architect Master Index - Hospital Alert System

## 🎯 Quick Navigation

### Core Documentation
- [Module Architecture](./ARCHITECT_MODULE_INDEX.md) - Detailed module structure
- [Workflow Documentation](./MODULE_WORKFLOW_DOCUMENTATION.md) - Implementation workflows
- [Codebase Review](./CODEBASE_REVIEW_AND_REORGANIZATION.md) - Current state analysis
- [Agent Context](./AGENT_CONTEXT_AND_INDEXING.md) - AI agent navigation

### Project Specifications
- [PRD](./HOSPITAL_ALERT_PRD.md) - Product requirements
- [Task Plan](./HOSPITAL_MVP_TASK_PLAN.md) - Sprint planning
- [Architecture](./HOSPITAL_ALERT_ARCHITECTURE.md) - System design

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
├──────────────────┬──────────────────┬───────────────────┤
│   Auth Module    │  Alert Module    │ Dashboard Module  │
├──────────────────┴──────────────────┴───────────────────┤
│                    API Gateway (tRPC)                    │
├──────────────────┬──────────────────┬───────────────────┤
│ Escalation Engine│Notification Svc  │  Audit Service    │
├──────────────────┴──────────────────┴───────────────────┤
│              Infrastructure Layer                        │
│         PostgreSQL | Redis | WebSocket                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Codebase Structure Map

### Frontend Organization
```yaml
/app/                          # Expo Router (file-based routing)
  ├── (auth)/                 # Public auth routes
  │   ├── login.tsx          # Sign in screen
  │   ├── register.tsx       # Sign up screen
  │   └── complete-profile.tsx # Profile completion
  │
  ├── (home)/                 # Protected app routes
  │   ├── index.tsx          # Home dashboard
  │   ├── healthcare-dashboard.tsx # Main medical dashboard
  │   ├── operator-dashboard.tsx   # Operator specific
  │   └── settings.tsx       # User settings
  │
  └── api/                    # API routes
      ├── auth/[...auth]+api.ts # Auth endpoints
      └── trpc/[trpc]+api.ts    # tRPC handler

/components/                   # Reusable components
  ├── universal/              # Cross-platform components (48+)
  ├── healthcare/             # Healthcare-specific
  │   ├── AlertCreationForm.tsx
  │   ├── AlertDashboard.tsx
  │   └── EscalationTimer.tsx
  └── ui/                     # Custom UI components

/lib/                         # Core libraries
  ├── auth/                   # Authentication logic
  ├── stores/                 # Zustand state management
  ├── trpc.tsx               # tRPC client config
  └── validations/           # Zod schemas
```

### Backend Organization
```yaml
/src/
  ├── db/                     # Database layer
  │   ├── schema.ts          # Base schema
  │   ├── healthcare-schema.ts # Healthcare tables
  │   └── index.ts           # DB client
  │
  └── server/                 # Backend logic
      ├── routers/           # tRPC routers
      │   ├── auth.ts       # Auth procedures
      │   ├── healthcare.ts # Alert procedures
      │   └── index.ts     # Router exports
      │
      ├── services/          # Business logic
      │   ├── alert-subscriptions.ts
      │   ├── escalation-timer.ts
      │   └── healthcare-access-control.ts
      │
      └── middleware/        # Express/tRPC middleware
          └── audit.ts      # Audit logging
```

---

## 🔑 Key Architecture Patterns

### 1. Module Pattern
```typescript
// Each module follows this structure
interface Module {
  frontend: {
    screens: React.Component[]
    components: React.Component[]
    hooks: CustomHook[]
    store: ZustandStore
  }
  backend: {
    router: tRPCRouter
    service: BusinessLogic
    schema: ZodSchema
  }
  shared: {
    types: TypeDefinitions
    constants: Constants
  }
}
```

### 2. Service Layer Pattern
```typescript
// Services encapsulate business logic
class AlertService {
  constructor(
    private db: Database,
    private notificationService: NotificationService,
    private escalationService: EscalationService
  ) {}
  
  async createAlert(data: CreateAlertDto): Promise<Alert> {
    // 1. Validate business rules
    // 2. Save to database
    // 3. Trigger side effects
    // 4. Return result
  }
}
```

### 3. Event-Driven Architecture
```typescript
// Modules communicate via events
EventBus.emit('alert:created', alert)
EventBus.on('alert:created', (alert) => {
  NotificationService.distribute(alert)
  EscalationService.startTimer(alert)
  AuditService.log('alert_created', alert)
})
```

---

## 🚀 Quick Start Guides

### For New Developers
1. Read [AGENT_CONTEXT_AND_INDEXING.md](./AGENT_CONTEXT_AND_INDEXING.md)
2. Review [HOSPITAL_ALERT_PRD.md](./HOSPITAL_ALERT_PRD.md)
3. Check current sprint in [HOSPITAL_MVP_TASK_PLAN.md](./HOSPITAL_MVP_TASK_PLAN.md)
4. Understand architecture in [ARCHITECT_MODULE_INDEX.md](./ARCHITECT_MODULE_INDEX.md)

### For Adding Features
1. Identify target module
2. Follow module structure in [ARCHITECT_MODULE_INDEX.md](./ARCHITECT_MODULE_INDEX.md)
3. Implement workflow from [MODULE_WORKFLOW_DOCUMENTATION.md](./MODULE_WORKFLOW_DOCUMENTATION.md)
4. Update relevant documentation

### For Debugging
1. Check module dependencies
2. Trace workflow execution
3. Review audit logs
4. Check WebSocket events

---

## 📊 Module Quick Reference

| Module | Purpose | Key Files | Status |
|--------|---------|-----------|--------|
| **Auth** | User authentication & sessions | `/lib/auth/*`, `/app/(auth)/*` | ✅ Complete |
| **Alert** | Alert creation & management | `/components/healthcare/*`, `/src/server/routers/healthcare.ts` | 🔄 In Progress |
| **Escalation** | Timer-based escalation | `/src/server/services/escalation-timer.ts` | ⏳ Planned |
| **Notification** | Push & real-time alerts | `/src/server/services/notification.service.ts` | ⏳ Planned |
| **Dashboard** | Role-based dashboards | `/app/(home)/*-dashboard.tsx` | 🔄 In Progress |

---

## 🔄 Data Flow Patterns

### Alert Creation Flow
```
User Input → Validation → API Call → Service Layer → Database
    ↓                                      ↓              ↓
Display UI ← WebSocket ← Event Bus ← Side Effects ← Response
```

### Real-time Update Flow
```
Database Change → Trigger → Event Bus → WebSocket Server
                                ↓
                        Connected Clients → UI Update
```

### Authentication Flow
```
Login Request → tRPC → Better Auth → Database
       ↓                    ↓           ↓
Token Storage ← Session ← Response ← Validation
```

---

## 🛠️ Development Commands

### Module-Specific Commands
```bash
# Auth Module
bun test:auth          # Test auth flows
bun dev:auth           # Dev with auth focus

# Alert Module  
bun test:alerts        # Test alert system
bun seed:alerts        # Create test alerts

# Dashboard Module
bun dev:dashboard      # Run with mock data
bun build:dashboard    # Optimize dashboard

# Full System
bun dev                # Start everything
bun test              # Run all tests
bun build             # Production build
```

### Database Commands
```bash
bun db:push           # Update schema
bun db:migrate        # Run migrations
bun db:seed          # Seed test data
bun db:studio        # Visual editor
```

---

## 📋 Architecture Decision Records (ADRs)

### ADR-001: Module-Based Architecture
- **Decision**: Organize code by feature modules
- **Reason**: Better scalability and team collaboration
- **Trade-offs**: Some code duplication vs clear boundaries

### ADR-002: Event-Driven Communication
- **Decision**: Use event bus for module communication
- **Reason**: Loose coupling, easier testing
- **Trade-offs**: Debugging complexity vs flexibility

### ADR-003: Real-time First
- **Decision**: WebSocket for all live updates
- **Reason**: Critical nature of medical alerts
- **Trade-offs**: Infrastructure complexity vs UX

### ADR-004: Optimistic UI Updates
- **Decision**: Update UI before server confirms
- **Reason**: Better perceived performance
- **Trade-offs**: Rollback complexity vs speed

---

## 🔍 Troubleshooting Guide

### Common Issues

#### Module Not Loading
1. Check module exports in index file
2. Verify import paths
3. Check for circular dependencies
4. Review module initialization order

#### WebSocket Connection Failed
1. Check server running on correct port
2. Verify CORS configuration
3. Check authentication token
4. Review firewall settings

#### Push Notifications Not Arriving
1. Verify push token registration
2. Check notification permissions
3. Review server logs for errors
4. Test with Expo push tool

#### Database Connection Issues
1. Check connection string
2. Verify PostgreSQL running
3. Review migration status
4. Check connection pool settings

---

## 📈 Performance Optimization Points

### Frontend
- React.memo on list items
- Virtual scrolling for long lists
- Lazy load heavy components
- Optimize re-renders with useCallback

### Backend
- Database query optimization
- Redis caching strategy
- Connection pooling
- Batch operations

### Real-time
- Debounce WebSocket events
- Implement backpressure
- Use binary protocols
- Connection state management

---

## 🚦 Health Checks

### System Health Endpoints
- `/api/health` - Basic health check
- `/api/health/db` - Database connectivity
- `/api/health/redis` - Redis connectivity
- `/api/health/ws` - WebSocket status

### Monitoring Points
- Alert creation time < 200ms
- Push delivery time < 5s
- WebSocket latency < 100ms
- Dashboard load time < 2s

---

## 📝 Next Steps

### Immediate Priorities
1. Complete database schema implementation
2. Implement alert creation workflow
3. Set up push notifications
4. Create role-based dashboards

### Future Enhancements
1. SMS notification channel
2. Voice alert integration
3. AI-powered alert routing
4. Advanced analytics dashboard

---

*Master Index Version: 1.0*  
*Last Updated: January 8, 2025*  
*Maintained by: Architecture Team*

---

## 🔗 Quick Links

- [GitHub Repository](#)
- [API Documentation](/docs/api)
- [Deployment Guide](/docs/deployment)
- [Security Guidelines](/docs/security)
- [Contributing Guide](/CONTRIBUTING.md)