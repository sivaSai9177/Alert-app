# CLAUDE.md - Agent Memory and Context

This document serves as the central memory for AI agents working on this codebase. It contains key implementation details, patterns, and context needed for effective collaboration.

## 🏗️ Project Overview

**Project**: Full-Stack Expo Starter Kit
**Stack**: Expo (React Native), TypeScript, tRPC, Better Auth, Drizzle ORM, TanStack Query
**Purpose**: Enterprise-ready mobile/web application with authentication, authorization, and organization management

## 🔐 Authentication & Authorization System

### Core Implementation
- **Auth Library**: Better Auth (not NextAuth)
- **Authorization**: tRPC middleware with role-based and permission-based access control
- **State Management**: Pure Zustand store (no Context API)
- **Session Storage**: AsyncStorage for mobile, localStorage for web
- **OAuth Providers**: Google (configured for web and mobile)

### Key Files
- `src/server/trpc.ts` - **NEW** Authorization middleware implementation
- `src/server/routers/auth.ts` - All auth endpoints with role-based procedures
- `lib/auth/auth.ts` - Better Auth configuration
- `lib/stores/auth-store.ts` - Zustand auth store
- `app/api/auth/[...auth]+api.ts` - Auth API handler

### Auth Flow
1. **Email/Password**: Direct signup → Login → Home
2. **OAuth**: Google → Callback → Profile Completion (if needed) → Home
3. **Session**: Persistent with 7-day expiry, auto-refresh on activity

### Authorization System (NEW)
- **Role-Based Access**: Admin, Manager, User, Guest procedures
- **Permission-Based Access**: Granular permission checking
- **Context Enhancement**: Type-safe helper functions in tRPC context
- **Audit Logging**: Complete authorization event tracking
- **Cross-Platform**: Consistent across iOS, Android, Web

### Security Features
- Rate limiting on auth endpoints
- Input sanitization
- Password complexity requirements
- Audit logging for all auth events
- Session invalidation on logout
- **NEW**: Authorization middleware with enterprise security

## 🎨 Universal Design System (NEW)

### Overview
The project now includes a comprehensive universal design system that provides consistent, cross-platform components for iOS, Android, and Web.

### Core Components
- **Box**: Flexible container with spacing, layout, and visual props
- **Text**: Typography component with theme integration and variants
- **Stack (VStack/HStack)**: Layout components for consistent spacing
- **Button**: Accessible button with variants and states
- **Container**: Page wrapper with safe area and scroll support
- **Input**: Form input with validation and theming
- **Card**: Content container with header, content, and footer sections
- **Checkbox**: Accessible checkbox with theme support
- **Switch**: Toggle switch with platform-specific styling

### Design Tokens
- **Spacing**: 4px-based scale (0-96) with responsive density support
- **Typography**: Consistent font sizes, weights, and line heights
- **Colors**: Full theme integration with dark mode support
- **Shadows**: Platform-optimized shadow styles
- **Border Radius**: Consistent corner radius scale

### Responsive Spacing Theme (NEW)
The app now supports three spacing densities that adapt all components:
- **Compact** (75% of base): For small screens or maximum content
- **Medium** (100% of base): Default for standard devices
- **Large** (125% of base): Enhanced readability and touch targets

Users can change density in Settings, and it automatically adjusts:
- All padding, margins, and gaps
- Font sizes and line heights
- Component heights and widths
- Touch target sizes

### Usage Example
```tsx
import { Container, VStack, Heading1, Text, Button } from '@/components/universal';

<Container scroll>
  <VStack p={4} spacing={4}>
    {/* p={4} = 12px in compact, 16px in medium, 20px in large */}
    <Heading1>Welcome</Heading1>
    <Text colorTheme="mutedForeground">Get started with our app</Text>
    <Button onPress={handleStart}>Begin</Button>
  </VStack>
</Container>
```

### Key Files
- `lib/design-system/index.ts` - Design tokens and constants
- `lib/design-system/spacing-theme.ts` - Responsive spacing system
- `contexts/SpacingContext.tsx` - Spacing density provider
- `components/universal/` - Universal component library
- `components/SpacingDensitySelector.tsx` - Density settings UI
- `DESIGN_SYSTEM.md` - Complete documentation
- `SPACING_THEME_SYSTEM.md` - Spacing theme documentation
- `docs/guides/MIGRATING_TO_DESIGN_SYSTEM.md` - Migration guide

## 🎯 Current Implementation Status

### ✅ Completed
1. **Authentication & Authorization**
   - Email/password login and signup
   - Google OAuth (web and mobile)
   - Profile completion flow
   - tRPC authorization middleware following official best practices
   - Role-based procedures (admin, manager, user procedures)
   - Permission-based procedures (granular access control)
   - Context enhancement with helper functions
   - Session management with multi-session support
   - Logout functionality

2. **Frontend**
   - Auth screens (login, signup, complete-profile)
   - Complete social login flow (OAuth → Profile Completion → Home)
   - Protected routes with role checking
   - Home dashboard with role-based content
   - Error handling and loading states
   - Form validation with react-hook-form and Zod
   - **Platform-specific tab navigation** - Custom WebTabBar for web to prevent reloads

3. **Backend**
   - tRPC router with type-safe procedures
   - Database schema with audit logging
   - Organization structure (placeholder implementation)
   - Security middleware

4. **State Management**
   - Zustand store with persistence
   - Proper hydration handling
   - Permission checking utilities

5. **Navigation**
   - **Fixed tab reload issue on web** - Platform-specific implementation
   - Static route structure to prevent re-renders
   - Proper navigation patterns (Redirect for guards, router methods for actions)

### 🚧 In Progress / TODO
1. **Email Verification** - Backend ready, needs frontend
2. **Password Reset** - UI exists, needs implementation
3. **Two-Factor Auth** - Backend ready, needs frontend
4. **Organization Management** - Schema exists, needs UI
5. **Admin Dashboard** - User management, audit logs
6. **Session Management UI** - View/revoke active sessions

## 📁 Project Structure

```
my-expo/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (auth)/                  # Public auth screens
│   │   ├── login.tsx           # Email/password login
│   │   ├── register.tsx        # User registration
│   │   ├── complete-profile.tsx # Profile completion flow
│   │   └── forgot-password.tsx # Password reset
│   ├── (home)/                 # Protected app screens
│   │   ├── index.tsx          # Home dashboard
│   │   ├── admin.tsx          # Admin panel
│   │   └── manager.tsx        # Manager dashboard
│   ├── api/                    # API routes
│   │   ├── auth/              # Better Auth endpoints
│   │   ├── debug/             # Debug utilities
│   │   └── trpc/              # tRPC handler
│   ├── _layout.tsx            # Root layout with providers
│   ├── index.tsx              # Entry point with auth routing
│   └── auth-callback.tsx      # OAuth callback handler
├── components/                  # Reusable UI components
│   ├── shadcn/ui/             # shadcn/ui components (adapted for RN)
│   ├── GoogleSignInButton.tsx # OAuth button component
│   ├── ProtectedRoute.tsx     # Route protection wrapper
│   ├── ProfileCompletionFlowEnhanced.tsx # 3-step profile wizard
│   └── ErrorBoundary.tsx      # Error handling component
├── lib/                        # Core utilities & configuration
│   ├── auth/                  # Authentication system
│   │   ├── auth.ts           # Better Auth configuration
│   │   ├── auth-client.ts    # Cross-platform auth client
│   │   └── auth-client-dynamic.ts # Dynamic client loading
│   ├── core/                 # Core utilities (NEW)
│   │   ├── logger.ts         # Enterprise logging system
│   │   ├── trpc-logger.ts    # tRPC logging middleware
│   │   ├── env.ts            # Dynamic environment config
│   │   ├── env-utils.ts      # Environment utilities
│   │   ├── config.ts         # App configuration
│   │   ├── crypto.ts         # Cryptographic utilities
│   │   ├── debug.ts          # Debug utilities
│   │   ├── alert.ts          # User alerts
│   │   ├── secure-storage.ts # Cross-platform storage
│   │   └── utils.ts          # Common utilities
│   ├── stores/               # Zustand state management
│   │   ├── auth-store.ts     # Authentication state
│   │   └── index.ts          # Store exports
│   ├── validations/          # Zod schemas
│   │   ├── auth.ts           # Auth validation schemas
│   │   ├── common.ts         # Common validations
│   │   └── index.ts          # Validation exports
│   ├── trpc.tsx              # tRPC client configuration
│   └── trpc-dynamic.tsx      # Dynamic tRPC loading
├── src/                        # Backend source code
│   ├── db/                    # Database layer
│   │   ├── schema.ts         # Main database schema
│   │   ├── plugin-schema.ts  # Better Auth schema extensions
│   │   └── index.ts          # Database client
│   └── server/               # tRPC backend
│       ├── routers/          # API route handlers
│       │   ├── auth.ts       # Authentication endpoints
│       │   └── index.ts      # Router exports
│       ├── services/         # Business logic services
│       │   ├── audit.ts      # Audit logging service
│       │   ├── encryption.ts # Encryption utilities
│       │   ├── session.ts    # Session management
│       │   └── access-control.ts # Permission checking
│       ├── middleware/       # tRPC middleware
│       │   └── audit.ts      # Audit logging middleware
│       └── trpc.ts          # tRPC server configuration
├── hooks/                      # Custom React hooks
│   ├── useAuth.tsx           # Authentication hook
│   ├── useEnvironment.ts     # Environment detection
│   └── useColorScheme.ts     # Theme detection
├── types/                      # TypeScript definitions
│   ├── auth.ts               # Auth-related types
│   ├── api/                  # API type definitions
│   └── components/           # Component type definitions
├── constants/                  # App constants
│   ├── index.ts              # General constants
│   └── theme/                # Theme constants
├── docs/                       # Comprehensive documentation
│   ├── INDEX.md              # Documentation index
│   ├── guides/               # Setup and configuration guides
│   ├── planning/             # Task management and roadmaps
│   ├── archive/              # Historical documentation
│   └── examples/             # Implementation examples
├── __tests__/                  # Test suite
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── e2e/                  # End-to-end tests
│   └── manual/               # Manual test procedures
├── scripts/                    # Build and utility scripts
│   ├── build-development.sh  # Development builds
│   ├── check-environment.ts  # Environment validation
│   └── test-*.ts            # Various test utilities
├── assets/                     # Static assets
│   ├── fonts/                # Custom fonts
│   └── images/               # App icons and images
└── Configuration Files
    ├── package.json           # Dependencies and scripts
    ├── tsconfig.json          # TypeScript configuration
    ├── tailwind.config.ts     # TailwindCSS/NativeWind config
    ├── metro.config.js        # Metro bundler config
    ├── jest.config.js         # Jest testing config
    ├── drizzle.config.ts      # Database ORM config
    ├── eas.json               # Expo Application Services config
    └── app.json               # Expo app configuration
```

## 🔧 Key Patterns and Conventions

### State Management
```typescript
// Always use Zustand store, never Context API
import { useAuthStore } from '@/lib/stores/auth-store';

// Get auth state
const { user, isAuthenticated } = useAuthStore();
```

### tRPC Usage
```typescript
// Always use tRPC for API calls
import { api } from '@/lib/trpc';

// Mutation
const mutation = api.auth.signIn.useMutation();

// Query
const { data } = api.auth.getSession.useQuery();
```

### tRPC Authorization (NEW)
```typescript
// Use role-based procedures for endpoints
import { 
  adminProcedure, 
  managerProcedure, 
  protectedProcedure,
  createPermissionProcedure 
} from '@/src/server/trpc';

// Admin-only endpoint
export const adminRouter = router({
  updateUserRole: adminProcedure
    .input(z.object({ userId: z.string(), newRole: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Authorization handled by adminProcedure middleware
      // ctx.user is guaranteed to be admin
      // ctx.hasRole() and ctx.hasPermission() available
    }),
});

// Permission-based endpoint
const manageUsersProcedure = createPermissionProcedure('manage_users');
export const userRouter = router({
  listUsers: manageUsersProcedure
    .query(async ({ ctx }) => {
      // Only users with 'manage_users' permission can access
    }),
});
```

### Permission Checking
```typescript
// Use context helpers in procedures
.query(async ({ ctx }) => {
  if (ctx.hasRole('admin')) {
    // Admin-specific logic
  } else if (ctx.hasPermission('view_analytics')) {
    // Permission-specific logic
  }
});

// Available roles: 'admin', 'manager', 'user', 'guest'
// Available permissions: '*', 'manage_users', 'view_analytics', 'manage_content', 'view_content', 'edit_profile'
```

## 🚀 Enterprise Logging System

### Overview
The project implements a production-ready, structured logging system that replaces all `console.log` usage with enterprise-grade logging infrastructure.

### Core Logger (`lib/core/logger.ts`)
```typescript
// Use structured logging, NEVER console.log in production
import { log } from '@/lib/core/logger';

// Basic logging with context
log.info('User action completed', 'USER_SERVICE', { userId: '123' });
log.error('Operation failed', 'COMPONENT_NAME', error);
log.debug('Debug info', 'DEBUG_CONTEXT', { data: 'value' });
log.warn('Warning message', 'WARNING_CONTEXT', { issue: 'details' });

// Domain-specific helpers
log.auth.login('User signed in', { userId: user.id, provider: 'google' });
log.auth.signup('User registered', { email: user.email, role: user.role });
log.auth.logout('User signed out', { userId: user.id, reason: 'manual' });
log.auth.oauth('OAuth callback', { provider: 'google', success: true });
log.auth.error('Auth failure', error);
log.auth.debug('Auth debug info', { context: 'data' });

log.api.request('API call started', { endpoint: '/users', method: 'GET' });
log.api.response('API call completed', { endpoint: '/users', status: 200 });
log.api.error('API call failed', error);

log.store.update('Auth state changed', { isAuthenticated: true });
log.store.debug('Store operation', { action: 'updateUser' });
```

### Features
- **Security**: Automatic PII redaction (passwords, tokens, secrets)
- **Performance**: Configurable size limits and environment-based filtering
- **Structure**: JSON format with timestamps, log levels, and context
- **Production-Ready**: Environment variables control logging behavior

### tRPC Logging Middleware (`lib/core/trpc-logger.ts`)
- **Request Tracking**: Unique request IDs and performance metrics
- **Slow Query Detection**: Automatic alerts for requests >1s
- **Error Categorization**: Structured error logging with context
- **Security Events**: Auth failures and permission violations

### Environment Configuration (`lib/core/env.ts`)
- **Dynamic URL Detection**: Automatic IP detection for mobile development
- **Platform-Aware**: Different configurations for iOS, Android, Web
- **Network Monitoring**: Automatic cache clearing on network changes
- **Caching**: Intelligent caching with expiration for performance

### Configuration
```bash
# Environment variables for logging
EXPO_PUBLIC_DEBUG_MODE=true          # Enable debug logs
EXPO_PUBLIC_LOG_LEVEL=debug          # Set log level (debug, info, warn, error)
```

### Error Handling
```typescript
// Use showErrorAlert for user-facing errors
import { showErrorAlert } from '@/lib/core/alert';
showErrorAlert('Title', 'Message');

// Log errors properly
import { log } from '@/lib/core/logger';
log.error('Error occurred', 'COMPONENT', error);
```

### Navigation
```typescript
// Use Expo Router for navigation
import { useRouter } from 'expo-router';
router.replace('/(home)'); // For auth redirects
router.push('/screen');    // For regular navigation
```

## 🐛 Known Issues and Workarounds

1. **OAuth in Expo Go**: Doesn't work, requires development build
2. **Text Node Errors**: Avoid bare text in Views, wrap in Text components
3. **FormMessage Component**: Don't use with Input components that handle their own errors

## 🔗 Related Documentation

### Authentication
- [Auth Flow Implementation](docs/AUTH_FLOW_IMPROVEMENTS_SUMMARY.md)
- [Google OAuth Setup](docs/guides/GOOGLE_OAUTH_SETUP.md)
- [Social Login Complete Flow](docs/guides/SOCIAL_LOGIN_COMPLETE_FLOW.md) - **NEW**
- [Profile Completion Flow](docs/OAUTH_PROFILE_COMPLETION_FLOW.md)

### Development
- [Mobile Development Setup](docs/guides/MOBILE_DEVELOPMENT_SETUP.md)
- [Environment Configuration](docs/guides/ENVIRONMENT_CONFIGURATION.md)
- [Build Instructions](BUILD_INSTRUCTIONS.md)

### Tasks and Planning
- [Master Task Plan](docs/planning/MASTER_TASK_PLAN.md)
- [Authentication Tasks](docs/planning/AUTHENTICATION_TASKS.md)
- [Security Compliance Tasks](docs/planning/SECURITY_COMPLIANCE_TASKS.md)

## 🐳 Docker Development Environment (NEW)

### Overview
The project now includes a complete Docker setup for consistent development environments, isolated testing, and multi-agent coordination.

### Quick Start
```bash
# Initial setup (one-time)
./scripts/docker-setup.sh

# Start development
docker-compose --profile development up

# Access services
# API: http://localhost:3000
# Expo: http://localhost:8081
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Docker Services
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Caching and queues (port 6379)
- **api**: tRPC API server (port 3000)
- **expo**: React Native development (port 8081)
- **pgadmin**: Database management UI (port 5050)
- **mailhog**: Email testing (SMTP 1025, UI 8025)

### Common Docker Commands
```bash
# Database operations
docker-compose exec api bun run db:migrate
docker-compose exec api bun run db:studio

# Run tests
docker-compose -f docker-compose.test.yml run test-runner

# Multi-agent system
docker-compose -f docker-compose.agents.yml --profile agents up

# View logs
docker-compose logs -f [service-name]

# Reset everything
docker-compose down -v
```

## 🚀 Quick Start

### With Docker (Recommended)
```bash
# 1. Clone and setup
git clone <repo>
cd my-expo
./scripts/docker-setup.sh

# 2. Start development
docker-compose --profile development up

# 3. In another terminal, run Expo
docker-compose exec expo bun run start
```

### Without Docker
```bash
# 1. Install dependencies
bun install
cp .env.example .env.local

# 2. Setup database
bun run db:generate
bun run db:migrate

# 3. Run development
bun run dev     # Web development
bun run ios     # iOS simulator
bun run android # Android emulator
```

### Common Commands
```bash
# Docker-based
docker-compose exec api bun run lint
docker-compose exec api bun run build
docker-compose exec api bun test

# Direct
bun run lint    # Check code quality
bun run build   # Production build
bun run test    # Run tests
```

## 📝 Important Notes

- Always check `hasHydrated` before using auth state
- Use `toAppUser()` helper when converting Better Auth users
- Rate limiting is enforced on auth endpoints
- Organization features are partially implemented (placeholder IDs)
- Audit logging is automatic for auth events
- Mobile OAuth requires proper scheme configuration

## 🔄 Last Updated

**Date**: June 6, 2025
**Last Change**: Prepared codebase for multi-agent development system
**Changes**:
- ✅ Modernized authentication UI (login, register, complete-profile, forgot-password)
- ✅ Fixed all TypeScript errors in auth modules
- ✅ Created comprehensive documentation for multi-agent system
- ✅ Added Master Task Manager for agent workflow
- ✅ Created Agent Context Guide with patterns and conventions
- ✅ Updated project structure documentation
- ✅ Fixed icon mappings for universal components
**Completed**: 
- ✅ **Google OAuth Flow Working**: Complete web OAuth integration with Better Auth
- ✅ **Validation Schema Fix**: Fixed nullable field handling in UserResponseSchema
- ✅ **Database Integration**: Neon PostgreSQL with proper PKCE OAuth security
- ✅ **tRPC Authorization**: Complete middleware with role-based and permission-based access
- ✅ **Session Management**: Better Auth + tRPC + TanStack Query integration
- ✅ **Environment Management**: Dynamic URL detection for mobile/web
- ✅ **Role-Based Navigation**: Dynamic tab visibility based on user permissions
- ✅ **Performance Optimization**: Reduced re-renders and efficient state management
- ✅ **Route Guards**: Proper authentication and authorization for protected routes
- ✅ **Enterprise Logging**: Structured logging system replacing console.log
- ✅ **Error Handling**: Comprehensive OAuth and validation error handling
- ✅ **Test Coverage**: Extensive unit and integration tests
- ✅ **Documentation**: Complete implementation documentation and guides
- ✅ **Authentication Flow Analysis**: Complete backend auth stack documentation

**Current Status**: 
- **Google OAuth**: ✅ Working on localhost:8081
- **Database**: ✅ Connected (Neon PostgreSQL, 50-70ms response times)
- **Authentication**: ✅ Production-ready with audit logging
- **Authorization**: ✅ Complete role/permission system
- **Validation**: ✅ Fixed nullable field handling
- **Navigation**: ✅ Stable routing without infinite loops
- **Tab Navigation Issue**: ✅ FIXED - Platform-specific implementation (WebTabBar for web)

**Architecture**: Pure Zustand + TanStack Query + tRPC + Better Auth + Enhanced Validation
**Test Results**: Production-ready with comprehensive OAuth flow validation
**Next Priority**: Implement proper TanStack Query integration patterns, enhance performance monitoring

## 📝 Key Insights from Latest Analysis

### Authentication Stack Deep Dive
1. **Better Auth** handles all core authentication with plugins for expo, OAuth proxy, multi-session
2. **tRPC** provides type-safe API layer with comprehensive middleware chain
3. **Zustand** manages client state only - no direct auth API calls
4. **Database** stores custom fields (role, organizationId, needsProfileCompletion)

### Middleware Chain Order
```
Request → Performance → Logging → Audit → Auth → Business Logic
```

### Tab Navigation Issue Root Cause ✅ FIXED
- **Issue**: Initial attempt at `Stack.Protected` in root caused re-renders
- **Issue**: AuthSync had navigation logic that caused conflicts
- **Issue**: When switching tabs, entire app was reinitializing ("Running application 'main'")
- **Solution**: 
  1. Use Stack navigator in root _layout.tsx with route definitions only
  2. Handle authentication routing in app/index.tsx entry point
  3. Implement guards at layout level using conditional <Redirect />
  4. AuthSync now only syncs state, no side effects
- **Result**: Tab switches are now instant without app reinitialization

### Navigation Architecture ✅ IMPLEMENTED (Expo Router v5)
```
app/
├── _layout.tsx          # Root Stack navigator with Stack.Protected guards
├── index.tsx            # Simple redirect to home (guards handle auth)
├── (auth)/              # Public routes group
│   ├── _layout.tsx      # Auth layout wrapper
│   ├── login.tsx        # Login screen
│   ├── register.tsx     # Registration screen
│   └── complete-profile.tsx # Profile completion
├── (home)/              # Protected routes group (Stack.Protected)
│   ├── _layout.tsx      # Tab navigator (protected by parent)
│   ├── index.tsx        # Home dashboard
│   ├── explore.tsx      # Explore tab
│   └── settings.tsx     # Settings tab
└── auth-callback.tsx    # OAuth callback handler
```

**Key Principles (Expo Router v5)**:
1. Root layout uses `Stack.Protected` with boolean guards
2. Guards automatically handle navigation when auth state changes
3. Simple index.tsx - just redirects to home
4. No manual auth checks in protected routes
5. Authentication state updates trigger automatic re-routing

---

*This document should be updated whenever significant changes are made to the authentication system, state management, or overall architecture.*