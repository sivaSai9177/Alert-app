# 📁 Code Structure Documentation

## Overview

This document provides a comprehensive guide to the codebase structure of the Full-Stack Expo Starter template. The project follows modern React Native/Expo best practices with a clean, scalable architecture.

## 🏗️ Directory Structure

### 📱 `/app` - Expo Router (File-based routing)

The app directory uses Expo Router for file-based routing, providing a seamless navigation experience.

```
app/
├── (auth)/                # Authentication flow group
│   ├── _layout.tsx       # Auth layout wrapper (handles auth state)
│   ├── login.tsx         # Login screen
│   ├── signup.tsx        # Registration screen
│   ├── complete-profile.tsx # Profile completion for OAuth users
│   └── forgot-password.tsx  # Password recovery flow
├── (home)/                # Protected app routes group
│   ├── _layout.tsx       # Tab navigation layout
│   ├── index.tsx         # Dashboard/Home screen
│   └── explore.tsx       # Feature exploration screen
├── api/                   # API routes (server endpoints)
│   ├── auth/             # Better Auth endpoints
│   │   ├── [...auth]+api.ts # Catch-all auth routes
│   │   └── google-mobile-callback+api.ts # Mobile OAuth callback
│   └── trpc/             # tRPC endpoints
│       └── [trpc]+api.ts # tRPC router endpoint
├── _layout.tsx           # Root layout with providers
├── index.tsx             # Entry redirect logic
├── +not-found.tsx        # 404 error page
└── auth-callback.tsx     # OAuth callback handler
```

### 🧩 `/components` - Reusable UI Components

All reusable UI components organized by category.

```
components/
├── ui/                    # Core UI primitives
│   ├── IconSymbol.tsx    # Cross-platform icon component
│   ├── IconSymbol.ios.tsx # iOS-specific icons
│   ├── TabBarBackground.tsx # Tab bar styling
│   └── TabBarBackground.ios.tsx # iOS tab bar
├── shadcn/ui/            # shadcn/ui components (adapted for RN)
│   ├── button.tsx        # Button component
│   ├── card.tsx          # Card container
│   ├── form.tsx          # Form components
│   ├── input.tsx         # Input field
│   ├── select.tsx        # Select dropdown
│   └── toast.tsx         # Toast notifications
├── Avatar.tsx            # User avatar component
├── DebugPanel.tsx        # Development debug panel
├── ErrorBoundary.tsx     # Error boundary wrapper
├── GoogleSignInButton.tsx # OAuth sign-in button
├── HapticTab.tsx         # Tab with haptic feedback
├── ProfileCompletionFlow.tsx # Basic profile completion UI
├── ProfileCompletionFlowEnhanced.tsx # Enhanced 3-step profile wizard
├── ProtectedRoute.tsx    # Route protection wrapper
├── ThemedText.tsx        # Theme-aware text
└── ThemedView.tsx        # Theme-aware view
```

### 🪝 `/hooks` - Custom React Hooks

Reusable React hooks for common functionality.

```
hooks/
├── useAuth.tsx           # Authentication hook (re-exports from store)
├── useColorScheme.ts     # Color scheme detection
├── useColorScheme.web.ts # Web-specific color scheme
└── useThemeColor.ts      # Theme color resolution
```

### 📚 `/lib` - Core Libraries and Utilities

The heart of the application logic, organized by domain.

```
lib/
├── auth/                 # Authentication modules
│   ├── auth.ts          # Better Auth server configuration
│   ├── auth-client.ts   # Better Auth client setup
│   └── auth-session-manager.ts # Session persistence
├── core/                 # Core utilities
│   ├── alert.ts         # Cross-platform alerts
│   ├── config.ts        # App configuration & URLs
│   ├── crypto.ts        # Cryptography utilities
│   ├── debug.ts         # Logging & debugging system
│   ├── secure-storage.ts # Secure storage abstraction
│   └── utils.ts         # General utilities (cn, etc.)
├── stores/              # State management
│   └── auth-store.ts    # Zustand auth store
├── validations/         # Comprehensive validation schemas
│   ├── common.ts        # Shared validation utilities and schemas
│   ├── auth.ts          # Enhanced auth-related Zod schemas
│   └── index.ts         # Barrel exports for all validations
└── trpc.tsx             # tRPC client configuration
```

### 🗄️ `/src` - Backend Source Code

Server-side code for API and database operations with enterprise security features.

```
src/
├── db/                   # Database layer
│   ├── index.ts         # Database connection setup
│   └── schema.ts        # Enhanced Drizzle ORM schema with audit tables
└── server/              # Server logic
    ├── routers/         # tRPC routers
    │   ├── auth.ts      # Authentication procedures with audit logging
    │   └── index.ts     # Root router aggregation
    ├── services/        # Business logic services
    │   ├── audit.ts     # Comprehensive audit trail service
    │   ├── session.ts   # Advanced session management
    │   ├── encryption.ts # Data encryption service (AES-256-GCM)
    │   └── access-control.ts # RBAC and permissions system
    ├── middleware/      # Custom middleware
    │   └── audit.ts     # Automatic audit logging middleware
    └── trpc.ts          # tRPC setup with security middleware
```

### 🏷️ `/types` - TypeScript Type Definitions

Centralized type definitions for type safety.

```
types/
├── auth.ts              # Authentication types
├── api/                 # API-related types
│   ├── auth.ts         # Auth API response types
│   └── trpc.ts         # tRPC-specific types
├── components/          # Component prop types
└── index.ts            # Type exports barrel file
```

### 🧪 `/__tests__` - Test Suite

Comprehensive test coverage organized by type.

```
__tests__/
├── unit/                # Unit tests
│   ├── auth-core.test.ts
│   └── auth-client.test.ts
├── integration/         # Integration tests
│   ├── auth-flow-integration.test.tsx
│   ├── auth-integration.test.tsx
│   └── trpc-integration.test.tsx
└── components/          # Component tests
    ├── login.test.tsx
    ├── ProtectedRoute.test.tsx
    └── useAuth.test.tsx
```

### 🎨 `/constants` - Application Constants

Centralized constants and configuration values.

```
constants/
└── theme/               # Theme-related constants
    └── Colors.ts        # Color palette definitions
```

### 📦 `/assets` - Static Assets

Images, fonts, and other static resources.

```
assets/
├── fonts/               # Custom fonts
│   └── SpaceMono-Regular.ttf
└── images/              # App images
    ├── adaptive-icon.png
    ├── favicon.png
    ├── icon.png
    └── splash-icon.png
```

### 📚 `/docs` - Documentation

All project documentation organized by purpose.

```
docs/
├── guides/              # Setup and usage guides
│   ├── EXPO_TRPC_BEST_PRACTICES.md
│   └── GOOGLE_OAUTH_SETUP.md
├── examples/            # Implementation examples
│   └── HEALTHCARE_PROJECT.md
├── planning/            # Development planning
│   └── [various task files]
└── archive/             # Historical documentation
```

## 🔄 Import Patterns

### Path Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
// Instead of: import { something } from '../../../lib/auth/auth-client'
import { authClient } from '@/lib/auth/auth-client'
```

### Barrel Files

Key directories have `index.ts` barrel files for cleaner imports:

```typescript
// lib/index.ts exports all submodules
import { authClient, useAuth, cn } from '@/lib'

// types/index.ts exports all types
import type { AppUser, AuthResponse } from '@/types'
```

## 🏛️ Architecture Patterns

### Authentication Flow

1. **Client**: `lib/auth/auth-client.ts` - Better Auth client
2. **State**: `lib/stores/auth-store.ts` - Zustand store
3. **Hooks**: `hooks/useAuth.tsx` - React hooks
4. **Server**: `lib/auth/auth.ts` - Better Auth server
5. **API**: `app/api/auth/[...auth]+api.ts` - Auth endpoints

### State Management

- **Zustand** for client state (auth, user preferences)
- **TanStack Query** (via tRPC) for server state
- **AsyncStorage** for persistence (mobile)
- **localStorage** for persistence (web)

### Type Safety

- **Zod** for runtime validation
- **TypeScript** for compile-time safety
- **tRPC** for end-to-end type safety

## 🚀 Key Features

### Cross-Platform Support

- Unified codebase for iOS, Android, and Web
- Platform-specific implementations where needed
- Responsive design patterns

### Enterprise Security

- **Audit Trail**: Complete business-compliant audit logging with tamper detection
- **Session Security**: Advanced session management with device tracking and anomaly detection
- **Data Encryption**: AES-256-GCM encryption for sensitive data at rest and in transit
- **Access Control**: Comprehensive RBAC system with granular permissions
- **Security Monitoring**: Real-time threat detection and automated responses
- **Compliance**: Built for business compliance with configurable retention policies
- **Secure Storage**: Enhanced token storage with encryption (Expo SecureStore/localStorage)
- **Input Validation**: Comprehensive Zod v4 schemas with runtime type checking

### Developer Experience

- Hot reload/Fast refresh
- TypeScript autocompletion
- Organized file structure
- Comprehensive error handling

## 📋 Best Practices

### File Naming

- Components: PascalCase (e.g., `Button.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- Constants: UPPER_SNAKE_CASE in files
- Types: PascalCase for interfaces/types

### Code Organization

- One component per file
- Co-locate related code
- Separate concerns (UI, logic, types)
- Use barrel exports for public APIs

### Testing

- Unit tests for utilities and hooks
- Integration tests for flows
- Component tests for UI logic
- E2E tests for critical paths

## 🔧 Configuration Files

- `app.json` - Expo app configuration
- `tsconfig.json` - TypeScript configuration
- `babel.config.js` - Babel transpiler config
- `metro.config.js` - Metro bundler config
- `tailwind.config.ts` - Tailwind/NativeWind config
- `drizzle.config.ts` - Database ORM config
- `jest.config.js` - Test runner config

## 📈 Scalability

The structure is designed to scale:

- **Features**: Add new route groups in `/app`
- **Components**: Add domain folders in `/components`
- **API**: Add new routers in `/src/server/routers`
- **State**: Add new stores in `/lib/stores`
- **Types**: Add domain folders in `/types`

## 🎯 Quick Reference

### Adding a New Feature

1. Create route in `/app/(home)/feature.tsx`
2. Add types in `/types/feature.ts`
3. Create API router in `/src/server/routers/feature.ts`
4. Add validation in `/lib/validations/feature.ts`
5. Create components in `/components/feature/`
6. Add tests in `/__tests__/`

### Common Tasks

- **Add API endpoint**: `/src/server/routers/`
- **Add new screen**: `/app/(group)/screen.tsx`
- **Add component**: `/components/ComponentName.tsx`
- **Add validation**: `/lib/validations/`
- **Add types**: `/types/`
- **Add tests**: `/__tests__/`

---

This structure provides a solid foundation for building scalable, maintainable React Native applications with Expo.