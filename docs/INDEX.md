# 📚 Expo Modern Starter Kit Documentation

Welcome to the comprehensive documentation for the Expo Modern Starter Kit. This guide will help you navigate through all available documentation.

## 📊 Current Status

- **Version**: 2.6.0
- **Last Updated**: January 15, 2025
- **Production Readiness**: 85%
- **TypeScript Compliance**: 100% ✅
- **Design System Migration**: 75% 🔄
- **Block Components Migrated**: 27/36 (75%)
- **Test Coverage**: 98%
- **Performance Score**: 95/100
- **Bundle Size**: 2.1MB (target: <2MB)

## 🚀 Quick Links

- [CLAUDE.md](/CLAUDE.md) - Claude Code Development Context
- [Agent User Guide](agent-user-guide.md) - How to Use Claude Code
- [README.md](/README.md) - Project Overview
- [Quick Reference](quick-reference.md) - Common Commands & Patterns
- [PROJECT STATUS](/PROJECT_STATUS_JAN_12_2025.md) - **Current Status: Type Fixes Complete (Jan 12, 2025)**
- [SPRINT PLAN](/docs/SPRINT_PLAN_JAN_12_2025.md) - Current Sprint Details
- [MASTER TASK MANAGER](multi-agent/MASTER_TASK_MANAGER.md) - Task Tracking System

### 🆕 Latest Updates (January 15, 2025)
- [Auth Module Complete](modules/AUTH_MODULE.md) 🆕 - **Production-ready authentication with Better Auth**
- [OAuth Flow Fixed](OAUTH_SIGNOUT_FIX.md) 🆕 - **Google OAuth sign-out workaround implemented**
- [Rate Limiting Added](modules/BACKEND_ARCHITECTURE.md#middleware) 🆕 - **tRPC middleware with rate limiting**
- [Security Enhanced](BETTER_AUTH_SECURITY_GUIDE.md) 🆕 - **Enterprise-grade security features**
- [Migration Tracker](/MIGRATION_TRACKER.md) - **Theme & Animation Migration Progress**
- [Codebase Reorganization Summary](CODEBASE_REORGANIZATION_SUMMARY.md) - **Component structure cleanup**

### 📊 Migration Status
- **Dashboard Blocks**: 3/3 (100%) ✅
- **Organization Blocks**: 6/6 (100%) ✅
- **Auth Blocks**: 8/9 (88.9%) 🔄
- **Form Blocks**: 2/2 (100%) ✅
- **Healthcare Blocks**: 7/9 (77.8%) 🔄
- **Navigation Blocks**: 6/7 (85.7%) 🔄
- **Debug Panel**: Consolidated ✅

## 📖 Documentation Structure

### 🎯 Getting Started
Essential guides for setting up and running the project.

- [Installation Guide](starter-kit/getting-started/installation.md)
- [Quick Start](starter-kit/getting-started/quick-start.md)
- [Environment Setup Guide](getting-started/environment-setup-guide.md)
- [Docker Environment Setup](getting-started/docker-environment-setup.md)
- [Environment Strategy](getting-started/environment-strategy.md)
- [Docker Integration Guide](getting-started/docker-integration-guide.md)
- [Dynamic API URL Guide](getting-started/dynamic-api-url-guide.md)
- [Running Your App Guide](getting-started/running-your-app-guide.md)
- [Mobile Environment Solution](getting-started/mobile-environment-solution.md)
- [iOS Simulator Network Fix](getting-started/ios-simulator-network-fix.md)

### 🏗️ Architecture & Reference
Core architecture documentation and reference materials.

- [Frontend Architecture](architecture/frontend-architecture.md)
- [Project Structure](reference/project-structure.md)
- [Code Structure](code-structure.md)
- [Database Schema](api/database-schema.md)
- **Core Systems**
  - [Animation System](reference/animation-system.md)
  - [Responsive Design System](reference/responsive-design-system.md)
- **Navigation & Routing**
  - [Navigation Architecture Root](guides/architecture/navigation-architecture-root.md)
  - [Organization UUID Strategy](guides/architecture/organization-uuid-strategy.md)

### 🔐 Authentication & Security
Everything related to authentication, authorization, and security.

- **Auth Blocks** 🆕
  - [GoogleSignIn Block](/components/blocks/auth/GoogleSignIn/) - OAuth login button
  - [ProfileCompletion Block](/components/blocks/auth/ProfileCompletion/) - Profile setup flow
  - [ProtectedRoute Block](/components/blocks/auth/ProtectedRoute.tsx) - Route protection
- **Guides**
  - [Auth Session Management](guides/authentication/auth-session-management.md)
  - [Google OAuth Setup](guides/authentication/google-oauth-setup.md)
  - [Google OAuth Mobile Setup](guides/authentication/google-oauth-mobile-setup.md)
  - [Google OAuth Profile Completion](guides/authentication/google-oauth-profile-completion.md)
  - [Google OAuth EAS Build Guide](guides/authentication/google-oauth-eas-build-guide.md)
  - [Mobile Auth Complete Guide](guides/authentication/mobile-auth-complete-guide.md)
  - [Mobile OAuth Development Build](guides/authentication/mobile-oauth-development-build.md)
  - [Mobile OAuth Setup Guide](guides/authentication/mobile-oauth-setup-guide.md)

### 🎨 Design System
Universal component library and design system documentation.

- [Design System Overview](design-system/design-system.md)
- [Universal Component Library](design-system/universal-component-library.md)
- [Universal Design System Implementation](design-system/universal-design-system-implementation.md)
- **Common Issues & Solutions**:
  - **Import Errors**: Use proper paths like `@/hooks/responsive/index` for hooks
  - **className on Native Components**: Use style prop instead (React Native limitation)
  - **Shadow System**: Use `useShadow` hook with density awareness
- **Theming & Styling**
  - [Dark Mode Implementation](design-system/dark-mode-implementation.md)
  - [Dark Mode Style Guide](design-system/dark-mode-style-guide.md)
  - [Spacing Theme System](design-system/spacing-theme-system.md)
  - [Theming and Spacing Complete](design-system/theming-and-spacing-complete.md)
- **Animation & Motion**
  - [Animation Implementation Progress](design-system/animation-implementation-progress.md)
  - [Cross-Platform Animation Guide](design-system/cross-platform-animation-guide.md)
  - [Universal Components Animation Plan](design-system/universal-components-animation-plan.md)
- **Responsive Design**
  - [Responsive Design Implementation](design-system/responsive-design-implementation.md)
  - **New Responsive Guides** 🆕
    - [Responsive Design System Guide](RESPONSIVE_DESIGN_SYSTEM_GUIDE.md) - Complete responsive hooks and density system
    - [Block Spacing Patterns](BLOCK_SPACING_PATTERNS.md) - Density-aware block implementation
- **Components**
  - [Universal Components Audit 2025](design-system/universal-components-audit-2025.md)
  - [Charts Implementation](design-system/charts-implementation.md)
  - [Sidebar 07 Implementation](design-system/sidebar-07-implementation-complete.md)
  - [Enhanced Login Page](design-system/enhanced-login-page.md)
  - [Organization Switcher](design-system/organization-switcher-implementation.md)
  - [Scroll Header Implementation](design-system/scroll-header-implementation.md)
  - **Organization UI** ✅
    - [Organization Dashboard](../app/(home)/organization-dashboard.tsx) - Golden ratio blocks for organization management
    - [Member Management Block](../components/organization/blocks/MemberManagementBlock.tsx) - Team member administration
    - [Organization Metrics Block](../components/organization/blocks/OrganizationMetricsBlock.tsx) - Real-time analytics
    - [Quick Actions Block](../components/organization/blocks/QuickActionsBlock.tsx) - Fast access to common tasks
    - [Organization Settings](../app/(home)/organization-settings.tsx) - Comprehensive settings management
    - [Organization Backend API](../src/server/routers/organization.ts) - Complete tRPC implementation
- **Performance**
  - [React 19 Optimization Audit](design-system/performance/react-19-optimization-audit.md)
  - [React 19 Implementation Tracker](design-system/performance/react-19-implementation-tracker.md)
  - [React 19 Optimization Summary](design-system/performance/react-19-optimization-summary.md)

### 🛠️ Development
Development guides, debugging, and best practices.

- [Enhanced Debug Panel](development/enhanced-debug-panel.md)
- [Enhanced Debug Panel Update](development/enhanced-debug-panel-update.md)
- [Mobile Debugging Guide](development/mobile-debugging-guide.md)
- [TanStack Debug Integration](development/tanstack-debug-integration.md)
- **Best Practices**
  - [Expo tRPC Best Practices](guides/expo-trpc-best-practices.md)
  - [TanStack tRPC Integration](guides/tanstack-trpc-integration.md)
  - [Frontend Architecture Plan](guides/architecture/frontend-architecture-plan.md)
  - [Migrating to Design System](guides/architecture/migrating-to-design-system.md)

### 📦 Deployment & Builds
Everything related to building and deploying your app.

- [Build Instructions](deployment/build-instructions.md)
- [Quick Build Guide](deployment/quick-build-guide.md)
- [Preview Build Guide](deployment/preview-build-guide.md)
- [Preview Build Quickstart](deployment/preview-build-quickstart.md)
- **Platform-Specific**
  - [Android Build Instructions](deployment/android-build-instructions.md)
  - [Android Build Command](deployment/android-build-command.md)
  - [Android Device Testing](deployment/android-device-testing.md)
  - [iOS Credentials Commands](deployment/ios-credentials-commands.md)
- **EAS & Expo**
  - [Expo Official Build Steps](deployment/expo-official-build-steps.md)
  - [Expo Orbit Build Guide](deployment/expo-orbit-build-guide.md)
  - [OAuth EAS Build Report](deployment/oauth-eas-build-report.md)
- **Credentials & Setup**
  - [Credential Sync Setup](deployment/credential-sync-setup.md)
  - [Local Credentials Setup](deployment/local-credentials-setup.md)
  - [Manual Commands to Run](deployment/manual-commands-to-run.md)

### 🧪 Testing
Testing guides and test documentation.

- [OAuth Android Preview Guide](testing/oauth-android-preview-guide.md)
- [OAuth Test Instructions](testing/oauth-test-instructions.md)
- [Auth Flow Test Checklist](testing/auth-flow-test-checklist.md)
- [Google Auth Manual Test Scenarios](testing/google-auth-manual-test-scenarios.md)
- [Google OAuth Test Checklist](testing/google-oauth-test-checklist.md)

### 💡 Examples & Templates
Practical examples and templates.

- [Breadcrumb Usage](examples/breadcrumb-usage.md)
- [Dialog Dropdown Usage](examples/dialog-dropdown-usage.md)
- [Healthcare Project Example](examples/healthcare-project.md)
- [PRD Template](projects/prd-template.md)

### 🏥 Hospital Alert System
Documentation for the Hospital Alert System MVP implementation.

- **Core Documentation**
  - [Hospital Alert PRD](/HOSPITAL_ALERT_PRD.md) - Product requirements document
  - [Hospital Alert Architecture](/HOSPITAL_ALERT_ARCHITECTURE.md) - System architecture
  - [MVP Task Plan](/HOSPITAL_MVP_TASK_PLAN.md) - Sprint planning and tasks
  - [Startup Guide](/HOSPITAL_ALERT_STARTUP_GUIDE.md) - Quick start guide
  - [MVP Status](/HOSPITAL_MVP_STATUS.md) - Current implementation status
  - [MVP Complete](/HOSPITAL_MVP_COMPLETE.md) - Completion checklist
- **Module Documentation**
  - [Module Architecture](/ARCHITECT_MODULE_INDEX.md) - Detailed module structure
  - [Module Workflow](/MODULE_WORKFLOW_DOCUMENTATION.md) - Implementation workflows
  - [Sprint Planning](/MODULE_SPRINT_PLANNING.md) - Current sprint details
- **Implementation Progress**
  - Healthcare blocks implemented with golden ratio design ✅
  - Backend API in progress 🔄
  - Real-time WebSocket integration planned ⏳
  - Push notification system planned ⏳
- **Key Features**
  - Alert creation and distribution
  - Escalation timer with automatic notifications
  - Role-based access (Operator, Healthcare Professional, Manager, Admin)
  - Real-time updates via WebSocket
  - Push notifications for critical alerts
  - Audit logging and compliance

### 🤖 Claude Code Development
Documentation for single-agent development with Claude Code.

- [Claude Code Workflow](planning/claude-code-workflow.md)
- [Project Status 2025](status/project-status-2025.md)
- [Master Task Plan](planning/master-task-plan.md)
- **Task Categories**
  - [Authentication Tasks](planning/authentication-tasks.md)
  - [Database API Tasks](planning/database-api-tasks.md)
  - [Security Compliance Tasks](planning/security-compliance-tasks.md)
  - [State Management Tasks](planning/state-management-tasks.md)
  - [Project Structure Tasks](planning/project-structure-tasks.md)
  - [Zod Validation Tasks](planning/zod-validation-tasks.md)

### 📊 Status & Reports
Current project status and health reports.

- **[PROJECT FINAL STATUS (Jan 11, 2025)](/PROJECT_FINAL_STATUS_JAN_2025.md)** - 🎯 **LATEST COMPREHENSIVE STATUS**
- [Project Status 2025](status/project-status-2025.md) - Previous detailed status
- [Project Status Update (Jan 10)](/PROJECT_STATUS_UPDATE_JAN_2025.md) - Yesterday's update
- [Hospital MVP Complete](/HOSPITAL_MVP_COMPLETE.md) - Healthcare system status
- **Recent Fixes & Updates**
  - [WebSocket Integration](/CHANGELOG.md#220---2025-01-10) - Fixed connection errors
  - [Organization System Complete](/ORGANIZATION_IMPLEMENTATION_SUMMARY.md) - 100% done
  - [Animation System Complete](/TASK_113_ANIMATION_STATUS.md) - 48/48 components

### 🗂️ Archive
Historical documentation and past implementations.

- [Archive Index](archive/) - Past fixes, implementations, and historical docs
- [Multi-Agent System Archive](archive/multi-agent-system/) - Previous multi-agent approach

### 📚 Additional Resources
- [Docker Integration Summary](docker-integration-summary.md)
- [Next Agent Testing Fixes](guides/next-agent-testing-fixes.md)
- [Starter Kit README](starter-kit/readme.md)

---

## 🔍 Finding Documentation

1. **By Topic**: Use the categories above to find docs by subject area
2. **By Task**: Check the Planning section for task-specific docs
3. **By Component**: Look in Design System for UI component docs
4. **By Platform**: Check Deployment for platform-specific build guides

## 📝 Documentation Standards

- Use kebab-case for file names (e.g., `my-document.md`)
- Include clear titles and descriptions
- Provide practical examples
- Keep documentation up-to-date
- Archive outdated docs rather than deleting

## 🤝 Contributing

When adding new documentation:
1. Place it in the appropriate category folder
2. Use kebab-case naming convention
3. Update this index.md file
4. Include a clear title and purpose
5. Follow existing patterns

## 🔧 Developer Context

### Context Injection Files
For development tools and AI assistants, import these index files for complete API access:

- **Master Context**: [`/CONTEXT_INDEX.ts`](../CONTEXT_INDEX.ts) - Complete API surface
- **Components**: [`/components/index.ts`](../components/index.ts) - All UI components
- **Hooks**: [`/hooks/index.ts`](../hooks/index.ts) - All React hooks
- **Library**: [`/lib/index.ts`](../lib/index.ts) - Core utilities
- **Types**: [`/types/index.ts`](../types/index.ts) - TypeScript definitions
- **Contexts**: [`/contexts/index.ts`](../contexts/index.ts) - React contexts

### Quick Development Reference
- **Project Completion**: 99% Production Ready ✅
- **Animation Status**: 48/48 components animated (100% complete) ✅
- **Responsive System**: Full breakpoint system with hooks ✅
- **Theme System**: 5 themes with dark mode support ✅
- **Component Library**: 48+ universal components (100% complete) ✅
- **Organization System**: Complete UI + Backend + Database (100% complete) ✅
- **Healthcare Demo**: Full MVP with escalation system ✅
- **WebSocket Support**: Configurable with graceful fallback ✅

### Latest Updates (January 13, 2025)
- **Authentication & Bundling Fixes**:
  - ✅ Fixed _interopRequireDefault runtime errors
  - ✅ Centralized navigation logic in NavigationGuard
  - ✅ Resolved auth redirect loops
  - ✅ Updated AppUser type with emailVerified field
  - ✅ Fixed startup script database migration issues
- **Component Fixes**:
  - ✅ Fixed Button.tsx import errors (haptics, responsive hooks, shadow)
  - ✅ Removed className usage from React Native components
  - ✅ Implemented proper shadow prop in Button component
- **Design System Audit**:
  - 🔄 150+ files still using old theme system
  - 🔄 Shadow system underutilized (only 3 components)
  - 🔄 Mixed Tailwind/theme usage causing TypeScript errors
  - 📋 Created comprehensive migration plan
- **Code Quality Analysis**:
  - 📊 100+ TODO comments found
  - 📊 108+ files with console.log statements
  - 📊 181+ files using TypeScript 'any'
  - 📊 122 npm scripts (needs consolidation)
- **Responsive System Documented**:
  - ✅ 6 responsive hooks fully documented
  - ✅ 3-tier density system explained
  - ✅ Block spacing patterns defined
  - ✅ Migration path from golden ratio to density-based

---

*Last Updated: January 13, 2025*
*Project is 85% production ready - design system migration needed for next sprint*