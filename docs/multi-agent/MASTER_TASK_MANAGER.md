# 🎯 Master Task Manager - Multi-Agent Development System

*Last Updated: June 6, 2025*

## 📋 Overview

This document serves as the central task management system for multi-agent development. It provides task tracking, agent assignments, and progress monitoring for the entire project lifecycle.

## 🤖 Agent Roles & Responsibilities

### 1. Manager Agent 👔
**Primary Responsibilities:**
- Review and prioritize tasks from backlog
- Assign tasks to appropriate developers
- Update documentation after task completion
- Conduct code reviews
- Maintain project timeline
- Generate status reports

**Access Required:**
- Full codebase read access
- Documentation write access
- Task management system
- Git operations

### 2. Backend Developer Agent 🔧
**Primary Responsibilities:**
- Implement server-side features
- Create tRPC routers and procedures
- Design database schemas
- Implement security measures
- Write backend tests
- Optimize performance

**Technology Stack:**
- tRPC for type-safe APIs
- Drizzle ORM for database
- Better Auth for authentication
- PostgreSQL database
- Zod for validation

### 3. Frontend Developer Agent 🎨
**Primary Responsibilities:**
- Build UI components
- Implement user flows
- Ensure responsive design
- Handle state management
- Write component tests
- Optimize performance

**Technology Stack:**
- React Native + Expo
- Universal Design System
- Zustand for state
- TanStack Query
- NativeWind styling

### 4. Tester Agent 🧪
**Primary Responsibilities:**
- Create test plans
- Write unit tests
- Perform integration testing
- Document test results
- Report bugs
- Ensure code coverage

**Testing Tools:**
- Jest for unit tests
- React Native Testing Library
- E2E testing framework
- Coverage reporting

## 📊 Current Sprint Tasks

### 🔴 High Priority Tasks

#### TASK-001: Implement Email Verification
- **Status**: Not Started
- **Assigned To**: Backend Developer
- **Estimated Time**: 4 hours
- **Description**: Implement email verification flow using Better Auth
- **Acceptance Criteria**:
  - [ ] Create verification email template
  - [ ] Add verification endpoint
  - [ ] Update user schema for verification status
  - [ ] Create verification UI component
  - [ ] Add tests for verification flow

#### TASK-002: Complete Admin Dashboard
- **Status**: In Progress (30%)
- **Assigned To**: Frontend Developer
- **Estimated Time**: 8 hours
- **Description**: Build admin dashboard for user management
- **Acceptance Criteria**:
  - [ ] User list with pagination
  - [ ] User search and filtering
  - [ ] Role management UI
  - [ ] Audit log viewer
  - [ ] Dashboard analytics

#### TASK-003: Fix Test Suite
- **Status**: Not Started
- **Assigned To**: Tester
- **Estimated Time**: 3 hours
- **Description**: Fix failing tests and resolve Jest/Vitest conflicts
- **Acceptance Criteria**:
  - [ ] All tests passing
  - [ ] Remove Vitest dependencies
  - [ ] Configure Jest properly
  - [ ] Add missing test cases

### 🟡 Medium Priority Tasks

#### TASK-004: Two-Factor Authentication
- **Status**: Not Started
- **Assigned To**: Backend Developer
- **Estimated Time**: 6 hours
- **Description**: Implement 2FA using TOTP
- **Dependencies**: TASK-001 (Email Verification)

#### TASK-005: Organization Management UI
- **Status**: Not Started
- **Assigned To**: Frontend Developer
- **Estimated Time**: 10 hours
- **Description**: Build organization creation and management interface

#### TASK-006: Performance Optimization
- **Status**: Not Started
- **Assigned To**: Frontend Developer
- **Estimated Time**: 6 hours
- **Description**: Optimize bundle size and load times

### 🟢 Low Priority Tasks

#### TASK-007: Push Notifications
- **Status**: Not Started
- **Assigned To**: Backend Developer
- **Estimated Time**: 8 hours

#### TASK-008: Analytics Integration
- **Status**: Not Started
- **Assigned To**: Frontend Developer
- **Estimated Time**: 4 hours

#### TASK-009: Internationalization
- **Status**: Not Started
- **Assigned To**: Frontend Developer
- **Estimated Time**: 12 hours

## 📈 Progress Tracking

### Sprint 1 Progress (Current)
```
Total Tasks: 9
Completed: 0
In Progress: 1
Not Started: 8
Progress: 11%
```

### Completed Tasks Log
*(No completed tasks in current sprint)*

## 🔄 Agent Workflow

### Task Assignment Process
1. Manager reviews task backlog
2. Manager assigns task based on:
   - Agent expertise
   - Current workload
   - Task dependencies
   - Priority level

### Development Workflow
1. **Context Loading**
   ```
   Developer: "Load context for TASK-XXX"
   Manager: Provides task details, related files, patterns
   ```

2. **Implementation**
   ```
   Developer: Implements feature following patterns
   Developer: Updates relevant tests
   Developer: Self-reviews code
   ```

3. **Testing**
   ```
   Tester: Reviews implementation
   Tester: Runs test suite
   Tester: Documents results
   ```

4. **Documentation**
   ```
   Manager: Updates docs
   Manager: Updates task status
   Manager: Prepares next task
   ```

## 📝 Task Definition Template

```markdown
#### TASK-XXX: [Task Title]
- **Status**: Not Started | In Progress | Completed | Blocked
- **Assigned To**: [Agent Type]
- **Estimated Time**: X hours
- **Priority**: High | Medium | Low
- **Dependencies**: TASK-YYY (if any)
- **Description**: Clear description of what needs to be done
- **Acceptance Criteria**:
  - [ ] Specific measurable outcome 1
  - [ ] Specific measurable outcome 2
  - [ ] Tests written and passing
  - [ ] Documentation updated
- **Technical Notes**: Implementation hints, patterns to follow
- **Files to Modify**: List of files that will be affected
```

## 🚀 Quick Start for Agents

### For New Backend Tasks
1. Check `src/server/routers/` for existing patterns
2. Follow tRPC procedure patterns in `auth.ts`
3. Use Drizzle ORM for database operations
4. Add Zod validation schemas
5. Include audit logging

### For New Frontend Tasks
1. Use Universal Design System components
2. Follow existing screen patterns in `app/`
3. Implement responsive design
4. Add proper TypeScript types
5. Include loading and error states

### For Testing Tasks
1. Check `__tests__/` for test patterns
2. Aim for >80% code coverage
3. Test happy paths and edge cases
4. Include integration tests
5. Document test scenarios

## 🔍 Status Report Commands

### Manager Status Check
```
"Manager, provide current sprint status"
```

### Task Details
```
"Manager, show details for TASK-XXX"
```

### Agent Assignment
```
"Manager, assign TASK-XXX to Backend Developer"
```

### Progress Update
```
"Developer, update progress on TASK-XXX"
```

## 📊 Metrics & KPIs

- **Sprint Velocity**: Tasks completed per sprint
- **Code Coverage**: Maintain >80%
- **Bug Rate**: <2 bugs per feature
- **Documentation**: 100% of features documented
- **Type Safety**: 100% TypeScript coverage

## 🔗 Related Documents

- [Codebase Status Report](./CODEBASE_STATUS_REPORT.md)
- [Agent Context Guide](./AGENT_CONTEXT.md)
- [Project Structure](../README.md#project-structure)
- [Technology Stack](./guides/FRONTEND_ARCHITECTURE_PLAN.md)
- [Best Practices](./CLAUDE.md)

---

*This document is the source of truth for task management in the multi-agent development system. Update after each task completion.*