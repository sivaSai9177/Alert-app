# 🤖 Claude Code Agent User Guide - Hospital Alert System

A comprehensive guide for developers using Claude Code to work with the Hospital Alert System MVP.

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Project Context](#project-context)
3. [Getting Started](#getting-started)
4. [Understanding the Architecture](#understanding-the-architecture)
5. [Module Development](#module-development)
6. [Common Development Tasks](#common-development-tasks)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Usage](#advanced-usage)

## 🎯 Introduction

The Hospital Alert System is a critical real-time notification platform for emergency medical situations. Built on the Expo Modern Starter Kit, it provides:
- **Real-time Alerts**: Instant push notifications for medical emergencies
- **Role-Based Access**: Operator, Doctor, Nurse, Head Doctor roles
- **Automatic Escalation**: Timer-based alert escalation system
- **HIPAA Compliance**: Audit trails and security features
- **Cross-Platform**: iOS, Android, and Web support

## 📊 Project Context

### Current Status
- **Phase**: Week 1-2 of 8-week MVP
- **Progress**: 15% complete
- **Focus**: Foundation & database schema implementation

### Key Documents
- `ARCHITECT_MASTER_INDEX.md` - Complete architecture overview
- `HOSPITAL_ALERT_PRD.md` - Product requirements
- `HOSPITAL_MVP_TASK_PLAN.md` - Sprint planning
- `MODULE_WORKFLOW_DOCUMENTATION.md` - Implementation workflows

This guide helps you leverage Claude Code effectively for Hospital Alert System development.

## 🚀 Getting Started

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd my-expo  # Hospital Alert System project
   ```

2. **Install Dependencies**
   ```bash
   bun install  # or npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development**
   ```bash
   # Expo Go mode (default)
   bun start
   
   # Local database (Docker)
   bun local
   
   # Cloud database (Neon)
   bun dev
   ```

### Key Commands Reference

| Command | Description | Database |
|---------|-------------|----------|
| `bun start` | Start in Expo Go mode | Default |
| `bun local` | Local development | Docker PostgreSQL |
| `bun dev` | Development mode | Neon Cloud |
| `bun test` | Run tests | - |
| `bun test:alerts` | Test alert system | - |
| `bun db:studio` | Open Drizzle Studio | - |
| `bun db:push` | Push schema changes | - |
| `bun setup:healthcare` | Setup healthcare demo | - |

## 🏗️ Understanding the Architecture

### Module-Based Structure
```
my-expo/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Public auth screens
│   ├── (home)/            # Protected app screens
│   │   ├── healthcare-dashboard.tsx  # Main medical dashboard
│   │   ├── operator-dashboard.tsx    # Operator specific
│   │   └── index.tsx                 # Role-based routing
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── universal/         # Cross-platform components
│   ├── healthcare/        # Healthcare-specific
│   │   ├── AlertCreationForm.tsx
│   │   ├── AlertDashboard.tsx
│   │   └── EscalationTimer.tsx
│   └── shadcn/           # UI components
├── lib/                   # Core utilities
│   ├── auth/             # Authentication
│   ├── stores/           # State management
│   └── validations/      # Zod schemas
├── src/                   # Backend code
│   ├── db/               
│   │   ├── schema.ts     # Base schema
│   │   └── healthcare-schema.ts  # Healthcare tables
│   └── server/           
│       ├── routers/      
│       │   ├── healthcare.ts  # Alert procedures
│       │   └── auth.ts        # Auth procedures
│       └── services/     
│           ├── alert-subscriptions.ts
│           ├── escalation-timer.ts
│           └── notification.service.ts
└── docs/                  # Documentation
```

### 5 Core Modules
1. **Authentication Module** - User auth & roles
2. **Alert Management Module** - Alert CRUD operations
3. **Escalation Engine Module** - Timer-based escalation
4. **Notification Module** - Push & real-time alerts
5. **Dashboard Module** - Role-specific views

### Key Technologies
- **Frontend**: Expo, React Native, React Native Web
- **Navigation**: Expo Router (file-based)
- **Styling**: NativeWind (TailwindCSS)
- **State**: Zustand
- **API**: tRPC
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth

### Important Files
- `ARCHITECT_MASTER_INDEX.md` - Complete architecture guide
- `HOSPITAL_ALERT_PRD.md` - Product requirements
- `MODULE_WORKFLOW_DOCUMENTATION.md` - Implementation workflows
- `src/db/healthcare-schema.ts` - Healthcare database schema
- `src/server/routers/healthcare.ts` - Alert API endpoints
- `components/healthcare/` - Healthcare UI components

## 🏥 Module Development

### Working with Modules

Each module follows a consistent structure:
```typescript
module/
├── frontend/
│   ├── screens/      # UI screens
│   ├── components/   # Module components
│   ├── hooks/        # Custom hooks
│   └── store/        # State management
├── backend/
│   ├── router.ts     # tRPC procedures
│   ├── service.ts    # Business logic
│   └── schema.ts     # Validation
└── shared/
    ├── types.ts      # Shared types
    └── constants.ts  # Constants
```

### Module Communication
Modules communicate via events:
```typescript
// Alert created → Notification service
EventBus.emit('alert:created', alert)

// Alert acknowledged → Stop escalation
EventBus.emit('alert:acknowledged', alertId)
```

## 💻 Common Development Tasks

### 1. Implementing Alert Creation (Operator Feature)

```typescript
// Ask Claude Code:
"Implement alert creation form for operators with:
- Room number input with validation
- Alert type selector (5 types)
- Urgency level picker (1-5)
- Quick action presets
- Confirmation before sending"
```

Example implementation:
```typescript
// components/healthcare/AlertCreationForm.tsx
import { Form, Input, Select, Button } from '@/components/universal';
import { api } from '@/lib/trpc';

export function AlertCreationForm() {
  const createAlert = api.alerts.create.useMutation();
  
  return (
    <Form onSubmit={handleSubmit}>
      <Input name="roomNumber" label="Room Number" required />
      <Select name="alertType" options={ALERT_TYPES} />
      <Select name="urgencyLevel" options={URGENCY_LEVELS} />
      <Button type="submit" size="large" variant="danger">
        Send Alert
      </Button>
    </Form>
  );
}
```

### 2. Adding Alert Acknowledgment Flow

```typescript
// Ask Claude Code:
"Add alert acknowledgment for medical staff with:
- One-tap acknowledgment button
- Response time tracking
- Stop escalation on acknowledgment
- Real-time UI updates
- Audit trail logging"
```

### 3. Implementing Escalation Logic

```typescript
// Ask Claude Code:
"Implement escalation timer that:
- Starts 2-minute timer for nurses
- Escalates to doctors after timeout
- Then to head doctor (3 min)
- Finally broadcasts to all staff
- Tracks escalation history"
```

### 4. Creating Healthcare Components

```typescript
// Ask Claude Code:
"Create a universal component for [component] that:
- Works on iOS, Android, and Web
- Follows the existing pattern in components/universal/
- Includes TypeScript types
- Has theme integration"
```

### 5. Adding Healthcare API Endpoints

```typescript
// Ask Claude Code:
"Add alert management endpoints with:
- Role-based access (operator for create)
- Alert validation (room, type, urgency)
- Notification triggering
- Escalation scheduling
- Audit logging"
```

Example:
```typescript
// src/server/routers/healthcare.ts
export const healthcareRouter = router({
  createAlert: operatorProcedure
    .input(createAlertSchema)
    .mutation(async ({ input, ctx }) => {
      // 1. Create alert
      const alert = await db.insert(alerts).values(input);
      
      // 2. Trigger notifications
      await notificationService.distribute(alert);
      
      // 3. Start escalation timer
      await escalationService.schedule(alert);
      
      // 4. Log audit trail
      await auditService.log('alert_created', alert);
      
      return alert;
    }),
    
  acknowledgeAlert: medicalStaffProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),
});
```

### 6. Implementing Healthcare Roles

```typescript
// Ask Claude Code:
"Implement [auth feature] such as:
- Two-factor authentication
- Password reset flow
- Session management
- OAuth provider integration"
```

### 7. Real-time Features with WebSocket

```typescript
// Ask Claude Code:
"Implement real-time alert updates using:
- WebSocket connection management
- Role-based room subscriptions
- Alert status broadcasts
- Reconnection handling
- Offline queue"
```

### 8. Push Notifications Setup

```typescript
// Ask Claude Code:
"Setup push notifications for:
- iOS critical alerts (bypass DND)
- Android high-priority channels
- Expo notification handling
- Delivery tracking
- Action buttons (Acknowledge)"
```

### 9. Optimizing Performance

```typescript
// Ask Claude Code:
"Optimize [component/screen] using:
- React 19 hooks (useDeferredValue, useTransition)
- Memoization strategies
- Lazy loading
- Bundle size optimization"
```

## 🎨 Best Practices for Hospital Alert System

### Healthcare-Specific Guidelines

1. **Safety-Critical UI**
   - Large touch targets (min 44px) for emergency use
   - High contrast colors for visibility
   - Clear urgency indicators
   - Confirmation for critical actions

2. **Real-time Requirements**
   - Notification delivery < 5 seconds
   - WebSocket latency < 100ms
   - Alert creation < 200ms
   - Dashboard updates immediate

3. **Compliance & Security**
   - Audit every action
   - HIPAA-compliant data handling
   - Role-based access enforcement
   - Secure session management

4. **Reliability**
   - Offline queue for alerts
   - Retry logic for notifications
   - Fallback delivery channels
   - Error recovery mechanisms

## 🎨 General Best Practices

### 1. Component Development
- Use universal components from `/components/universal`
- Follow existing patterns for consistency
- Test on all platforms (iOS, Android, Web)
- Include proper TypeScript types

### 2. State Management
- Use Zustand stores for global state
- Keep component state local when possible
- Use TanStack Query for server state
- Implement optimistic updates

### 3. Authentication
- Always use Better Auth patterns
- Check permissions with tRPC procedures
- Handle loading and error states
- Test auth flows thoroughly

### 4. Performance
- Apply React 19 optimizations
- Monitor bundle size
- Use proper memoization
- Test on low-end devices

### 5. Documentation
- Update docs with significant changes
- Include usage examples
- Document design decisions
- Keep CLAUDE.md current

## 🔧 Troubleshooting

### Healthcare-Specific Issues

1. **Push Notifications Not Arriving**
   - Check Expo push token registration
   - Verify notification permissions
   - Test with Expo push tool
   - Check urgency level settings

2. **Escalation Timer Issues**
   - Verify Redis is running
   - Check timer configuration
   - Review escalation logs
   - Test with shorter intervals

3. **Role-Based Access Problems**
   - Verify user role in database
   - Check procedure middleware
   - Review permission mappings
   - Test with different roles

4. **Real-time Updates Failing**
   - Check WebSocket connection
   - Verify room subscriptions
   - Test event broadcasting
   - Review CORS settings

### Common Issues

1. **Expo Go vs Development Build**
   - Default commands use Expo Go
   - Use `:dev` suffix for development builds
   - OAuth requires development builds

2. **Database Connection**
   - Local: Ensure Docker is running
   - Cloud: Check Neon credentials
   - Run migrations: `bun db:push`

3. **Type Errors**
   - Run `bun type-check`
   - Check for missing imports
   - Ensure proper generic types

4. **Platform-Specific Issues**
   - Test on target platform
   - Check Platform.OS conditions
   - Review universal component usage

## 🚀 Advanced Hospital Alert Features

### 1. Critical Alert Configuration
```typescript
// Ask Claude Code:
"Configure iOS critical alerts that:
- Bypass Do Not Disturb
- Play urgent sound
- Require special entitlement
- Show fullscreen on Android"
```

### 2. Advanced Escalation Rules
```typescript
// Ask Claude Code:
"Implement custom escalation rules:
- Different timers by urgency
- Skip tiers for critical
- Department-based routing
- On-call staff integration"
```

### 3. Analytics Dashboard
```typescript
// Ask Claude Code:
"Create analytics dashboard showing:
- Average response times
- Escalation frequency
- Alert volume by type
- Department performance"
```

## 🚀 General Advanced Usage

### 1. Custom Themes
```typescript
// Ask Claude Code:
"Add a custom theme called [name] with:
- Color palette
- Dark mode variant
- Integration with theme system"
```

### 2. Complex State Management
```typescript
// Ask Claude Code:
"Implement complex state for [feature] with:
- Zustand store
- Persistence
- Middleware
- DevTools integration"
```

### 3. Advanced Authentication
```typescript
// Ask Claude Code:
"Implement [advanced auth] such as:
- Biometric authentication
- Magic links
- Passkeys
- Multi-tenant support"
```

### 4. Performance Monitoring
```typescript
// Ask Claude Code:
"Set up performance monitoring with:
- Custom metrics
- Error tracking
- User analytics
- Performance budgets"
```

## 📋 Hospital Alert Task Templates

### Alert Feature Template
```markdown
Implement [alert feature] with:
1. Database schema for alert data
2. tRPC endpoints with role checks
3. Notification distribution logic
4. Escalation timer setup
5. Real-time WebSocket events
6. Mobile UI with large touch targets
7. Push notification configuration
8. Audit trail logging
```

### Healthcare Module Template
```markdown
Create [healthcare module] including:
1. Role-based access control
2. HIPAA-compliant data handling
3. Real-time updates
4. Offline support
5. Performance optimization
6. Comprehensive testing
```

## 📋 General Task Templates

### Feature Development Template
```markdown
Create [feature name] with:
1. Database schema updates
2. tRPC endpoints with authorization
3. Zustand store if needed
4. Universal UI components
5. Screen implementation
6. Tests and documentation
```

### Bug Fix Template
```markdown
Fix [issue description]:
1. Reproduce the issue
2. Identify root cause
3. Implement fix
4. Add tests to prevent regression
5. Update documentation
```

### Performance Optimization Template
```markdown
Optimize [component/feature]:
1. Measure current performance
2. Identify bottlenecks
3. Apply optimizations
4. Verify improvements
5. Document changes
```

## 🤝 Working with Claude Code on Hospital Alerts

### Healthcare-Specific Prompts

1. **Alert System Features**
   ```
   "Implement alert distribution that sends to all nurses 
   in the department, with push notifications and WebSocket 
   updates, tracking delivery status"
   ```

2. **Escalation Logic**
   ```
   "Create escalation timer that waits 2 minutes for nurse 
   acknowledgment, then escalates to doctors with urgent 
   notification sound"
   ```

3. **Dashboard Features**
   ```
   "Build operator dashboard showing active alerts, 
   response times, and quick create button with 
   recent rooms dropdown"
   ```

4. **Compliance Features**
   ```
   "Add HIPAA-compliant audit logging that tracks 
   user, action, timestamp, and alert details with 
   7-year retention"
   ```

## 🤝 General Claude Code Tips

### Effective Prompts

1. **Be Specific**
   ```
   "Create a user profile screen with avatar upload, 
   form validation, and optimistic updates"
   ```

2. **Reference Existing Patterns**
   ```
   "Following the pattern in login.tsx, create a 
   registration screen with similar validation"
   ```

3. **Include Requirements**
   ```
   "Add real-time notifications using WebSockets,
   with offline queue and retry logic"
   ```

4. **Ask for Best Practices**
   ```
   "What's the best way to implement infinite 
   scroll with TanStack Query in this codebase?"
   ```

### Getting Help

1. **Check Documentation**
   - Start with `/docs/INDEX.md`
   - Review `CLAUDE.md` for patterns
   - Check component examples

2. **Understand the Context**
   - Current tech stack
   - Existing patterns
   - Project conventions

3. **Provide Clear Context**
   - Share relevant code
   - Describe the goal
   - Mention constraints

## 📚 Resources

### Hospital Alert Documentation
- `ARCHITECT_MASTER_INDEX.md` - Complete system architecture
- `HOSPITAL_ALERT_PRD.md` - Product requirements
- `HOSPITAL_MVP_TASK_PLAN.md` - Current sprint tasks
- `MODULE_WORKFLOW_DOCUMENTATION.md` - Detailed workflows
- `ARCHITECT_MODULE_INDEX.md` - Module specifications

### Technical Documentation
- `/docs/INDEX.md` - Documentation index
- `/CLAUDE.md` - Development context
- `src/db/healthcare-schema.ts` - Database schema
- `components/healthcare/` - UI components

### External Resources
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/for-professionals/security/index.html)

---

*Remember: When working on the Hospital Alert System, always consider the critical nature of medical alerts. Prioritize reliability, speed, and clarity in all implementations!*