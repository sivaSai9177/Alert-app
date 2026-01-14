# 📁 Project Structure

## Overview

The project follows a feature-based architecture with clear separation between client and server code.

```
my-expo/
├── app/                          # Expo Router screens
├── components/                   # Reusable components
├── lib/                          # Core utilities
├── src/                          # Backend code
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript types
├── constants/                    # App constants
├── contexts/                     # React contexts
├── assets/                       # Static assets
├── docs/                         # Documentation
├── scripts/                      # Build scripts
└── __tests__/                    # Test files
```

## Directory Details

### `/app` - Screens & Routing

File-based routing with Expo Router:

```
app/
├── (auth)/                      # Public auth group
│   ├── _layout.tsx             # Auth stack layout
│   ├── login.tsx               # Login screen
│   ├── register.tsx            # Registration
│   ├── complete-profile.tsx    # Profile wizard
│   └── forgot-password.tsx     # Password reset
├── (home)/                      # Protected app group
│   ├── _layout.tsx             # Tab navigation
│   ├── index.tsx               # Home dashboard
│   ├── explore.tsx             # Explore tab
│   └── settings.tsx            # Settings tab
├── api/                         # API routes
│   ├── auth/[...auth]+api.ts  # Auth endpoints
│   └── trpc/[trpc]+api.ts     # tRPC handler
├── _layout.tsx                  # Root layout
├── index.tsx                    # Entry point
└── auth-callback.tsx            # OAuth callback
```

### `/components` - UI Components

Organized by type and feature:

```
components/
├── universal/                   # Design system components
│   ├── Box.tsx                 # Layout primitive
│   ├── Text.tsx                # Typography
│   ├── Button.tsx              # Buttons
│   ├── Input.tsx               # Form inputs
│   ├── Card.tsx                # Content cards
│   └── ...                     # Other components
├── ui/                          # UI utilities
│   ├── IconSymbol.tsx          # Icon system
│   └── ValidationIcon.tsx      # Form validation
└── [Feature]Component.tsx       # Feature-specific
```

### `/lib` - Core Libraries

Business logic and utilities:

```
lib/
├── auth/                        # Authentication
│   ├── auth.ts                 # Better Auth config
│   ├── auth-client.ts          # Client setup
│   └── auth-session-manager.ts # Session handling
├── core/                        # Core utilities
│   ├── logger.ts               # Logging system
│   ├── env.ts                  # Environment config
│   ├── alert.ts                # User alerts
│   └── secure-storage.ts       # Secure storage
├── stores/                      # State management
│   └── auth-store.ts           # Zustand store
├── validations/                 # Zod schemas
│   ├── auth.ts                 # Auth validation
│   └── common.ts               # Common schemas
├── theme/                       # Theming
│   └── theme-provider.tsx      # Theme context
└── trpc.tsx                     # tRPC client
```

### `/src` - Backend Code

Server-side implementation:

```
src/
├── db/                          # Database layer
│   ├── schema.ts               # Drizzle schema
│   ├── plugin-schema.ts        # Auth schema
│   └── index.ts                # DB client
└── server/                      # tRPC server
    ├── routers/                # API routers
    │   ├── auth.ts             # Auth endpoints
    │   └── index.ts            # Root router
    ├── services/               # Business logic
    │   ├── audit.ts            # Audit logging
    │   ├── session.ts          # Sessions
    │   └── access-control.ts   # Permissions
    ├── middleware/             # Middleware
    │   └── audit.ts            # Audit middleware
    └── trpc.ts                 # tRPC setup
```

### `/docs` - Documentation

Multi-agent system ready:

```
docs/
├── starter-kit/                 # Generic docs
│   ├── getting-started/        # Setup guides
│   ├── architecture/           # System design
│   ├── features/               # Feature docs
│   └── design-system/          # UI docs
├── projects/                    # Project-specific
│   ├── PRD_TEMPLATE.md         # PRD template
│   └── [project-name]/         # Project docs
├── MULTI_AGENT_WORKFLOW_SYSTEM.md
├── MASTER_TASK_MANAGER.md
├── AGENT_CONTEXT.md
└── INDEX.md                     # Doc index
```

## Key Files

### Configuration Files
- `app.json` - Expo configuration
- `eas.json` - EAS Build config
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind/NativeWind
- `metro.config.js` - Metro bundler
- `drizzle.config.ts` - Database config

### Entry Points
- `app/_layout.tsx` - Root component
- `app/index.tsx` - App entry
- `src/server/trpc.ts` - API entry

### Environment
- `.env.example` - Environment template
- `.env.local` - Local development
- `.env.production` - Production config

## Best Practices

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`
- Types: `PascalCase.ts`

### Code Organization
1. Group by feature, not file type
2. Keep related code together
3. Use barrel exports (index.ts)
4. Maintain clear boundaries

### Import Order
1. React/React Native
2. Third-party libraries
3. Absolute imports (@/)
4. Relative imports
5. Types

Example:
```typescript
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { api } from '@/lib/trpc';
import { Button } from '@/components/universal';

import { LocalComponent } from './LocalComponent';
import type { Props } from './types';
```