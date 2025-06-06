# 🤖 Agent Context Guide - Multi-Agent Development System

*Last Updated: June 6, 2025*

## 📋 Overview

This document provides essential context for AI agents working on this codebase. It contains architectural decisions, coding patterns, and best practices that every agent must follow.

## 🏗️ Codebase Architecture

### Technology Stack Overview

#### Frontend
```typescript
// Core Technologies
- React Native 0.79.2
- Expo SDK 53
- TypeScript (strict mode)
- Expo Router v5 (file-based routing)

// State Management
- Zustand (client state)
- TanStack Query (server state)
- No Context API (use Zustand instead)

// Styling
- NativeWind 4.1.6
- Universal Design System
- Responsive spacing system
```

#### Backend
```typescript
// Core Technologies
- tRPC 11.1.4 (type-safe APIs)
- Better Auth 1.2.8 (authentication)
- PostgreSQL + Drizzle ORM
- Zod (validation)

// Architecture
- Procedure-based API design
- Middleware for auth/permissions
- Audit logging for all mutations
- Role-based access control
```

## 📐 Design Patterns & Conventions

### 1. File Organization

```
Feature-based structure:
- app/(group)/page.tsx     → Screens
- components/Feature/      → Feature components
- lib/feature/            → Business logic
- src/server/routers/     → API endpoints
- types/feature.ts        → Type definitions
```

### 2. Component Patterns

#### Universal Components Only
```typescript
// ✅ GOOD - Use universal components
import { Box, Text, Button } from '@/components/universal';

// ❌ BAD - Don't use React Native directly
import { View, Text } from 'react-native';
```

#### Component Structure
```typescript
// Standard component template
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  const theme = useTheme();
  const { spacing } = useSpacing();
  
  // Hooks
  const [state, setState] = useState();
  
  // Derived state
  const computedValue = useMemo(() => {}, []);
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  const handleAction = useCallback(() => {}, []);
  
  // Render
  return (
    <Box>
      <Text>Content</Text>
    </Box>
  );
}
```

### 3. State Management Patterns

#### Zustand Store Pattern
```typescript
// ✅ CORRECT - Zustand store
import { useAuthStore } from '@/lib/stores/auth-store';

const MyComponent = () => {
  const { user, isAuthenticated } = useAuthStore();
  // Use store data
};

// ❌ WRONG - Context API
const AuthContext = createContext(); // Don't do this
```

#### tRPC Query Pattern
```typescript
// ✅ CORRECT - tRPC with TanStack Query
const { data, isLoading } = api.auth.getSession.useQuery();
const mutation = api.auth.signIn.useMutation({
  onSuccess: (data) => {
    // Handle success
  },
});

// ❌ WRONG - Direct API calls
const data = await fetch('/api/...'); // Don't do this
```

### 4. Authentication Patterns

#### Route Protection
```typescript
// ✅ CORRECT - Use ProtectedRoute component
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ProtectedScreen() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}

// ❌ WRONG - Manual auth checks
if (!isAuthenticated) redirect('/login'); // Don't do this
```

#### Auth Flow
```typescript
// Standard auth flow
1. User attempts login → api.auth.signIn.useMutation()
2. Success → Update Zustand store
3. Store update → Triggers navigation
4. Protected routes → Check store.hasHydrated && store.isAuthenticated
```

### 5. API Development Patterns

#### tRPC Router Pattern
```typescript
// Standard tRPC router structure
export const featureRouter = router({
  // Public procedure
  getPublicData: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await getDataById(input.id);
    }),
    
  // Protected procedure
  updateData: protectedProcedure
    .input(updateSchema)
    .mutation(async ({ input, ctx }) => {
      // ctx.user is guaranteed
      return await updateUserData(ctx.user.id, input);
    }),
    
  // Admin procedure
  deleteData: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Only admins can access
      await deleteData(input.id);
    }),
});
```

### 6. Database Patterns

#### Drizzle ORM Usage
```typescript
// ✅ CORRECT - Use Drizzle ORM
import { db } from '@/src/db';
import { user } from '@/src/db/schema';

const users = await db.select().from(user).where(eq(user.id, userId));

// ❌ WRONG - Raw SQL
const users = await db.execute('SELECT * FROM users'); // Avoid
```

### 7. Error Handling Patterns

#### UI Error Handling
```typescript
// Use the error alert utility
import { showErrorAlert } from '@/lib/core/alert';

try {
  await riskyOperation();
} catch (error) {
  showErrorAlert('Operation Failed', error.message);
}
```

#### API Error Handling
```typescript
// tRPC procedures automatically handle errors
.mutation(async ({ input }) => {
  if (!isValid(input)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid input',
    });
  }
  // Proceed
});
```

## 🎨 UI/UX Guidelines

### 1. Responsive Design
```typescript
// Use responsive breakpoints
const isMobile = screenWidth < 768;
const isTablet = screenWidth >= 768 && screenWidth < 1024;
const isDesktop = screenWidth >= 1024;

// Apply conditional styles
<Box p={isMobile ? 4 : 8}>
```

### 2. Theme Usage
```typescript
// Always use theme colors
const theme = useTheme();
<Text style={{ color: theme.foreground }}>

// Never hardcode colors
<Text style={{ color: '#000000' }}> // ❌ Wrong
```

### 3. Accessibility
- All interactive elements must have proper labels
- Use semantic component names
- Ensure proper contrast ratios
- Support screen readers

## 🧪 Testing Guidelines

### 1. Test Structure
```typescript
describe('Feature', () => {
  describe('Scenario', () => {
    it('should behave correctly', () => {
      // Arrange
      const input = setupTest();
      
      // Act
      const result = performAction(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### 2. What to Test
- Business logic (high priority)
- API endpoints (critical)
- Component behavior (important)
- UI rendering (lower priority)

## 🔒 Security Best Practices

1. **Never expose secrets** in code or logs
2. **Always validate input** with Zod schemas
3. **Use prepared statements** (Drizzle handles this)
4. **Implement rate limiting** on sensitive endpoints
5. **Audit log** all important operations
6. **Sanitize user content** before display

## 📝 Documentation Standards

### Code Comments
```typescript
// Use JSDoc for functions
/**
 * Validates user input and creates a new account
 * @param input - User registration data
 * @returns Created user object
 * @throws {ValidationError} If input is invalid
 */
async function createUser(input: CreateUserInput) {
  // Implementation
}
```

### File Headers
```typescript
/**
 * Authentication Router
 * 
 * Handles all authentication-related API endpoints including:
 * - User registration and login
 * - Password reset flows
 * - Session management
 * - OAuth callbacks
 */
```

## 🚀 Quick Reference

### Common Imports
```typescript
// UI Components
import { Box, Text, Button, Input } from '@/components/universal';

// Hooks
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/lib/theme/theme-provider';

// API
import { api } from '@/lib/trpc';

// Utils
import { log } from '@/lib/core/logger';
import { showErrorAlert } from '@/lib/core/alert';
```

### File Paths
```
Screens: app/(group)/screen.tsx
Components: components/ComponentName.tsx
API Routes: src/server/routers/feature.ts
Database: src/db/schema.ts
Types: types/feature.ts
Tests: __tests__/unit/feature.test.ts
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
EXPO_PUBLIC_API_URL=http://localhost:8081

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## 🎯 Agent-Specific Guidelines

### Backend Developer
- Follow tRPC patterns in `src/server/routers/auth.ts`
- Use transactions for multi-table operations
- Include audit logging for all mutations
- Write integration tests for new endpoints

### Frontend Developer
- Use Universal Design System exclusively
- Implement loading and error states
- Ensure responsive design
- Test on iOS, Android, and Web

### Tester
- Focus on business logic tests
- Ensure >80% code coverage
- Test error scenarios
- Document test cases

### Manager
- Keep documentation updated
- Track technical debt
- Monitor code quality metrics
- Facilitate agent communication

---

*This context guide should be read by every agent before starting work on the codebase. It ensures consistency and quality across all development efforts.*