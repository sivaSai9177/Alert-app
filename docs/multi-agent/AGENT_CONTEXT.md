# 🤖 Agent Context Guide - Multi-Agent Development System

*Last Updated: January 7, 2025*

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

// OAuth/Social Login Flow
1. User clicks Google Sign In → Redirects to OAuth provider
2. OAuth Callback → /app/auth-callback.tsx handles response
3. Check Profile Status:
   - If needsProfileCompletion === true OR role === 'guest'
   - Redirect to /complete-profile
4. Profile Completion (3 steps):
   - Step 1: Personal info (name, phone, bio)
   - Step 2: Role Selection (Guest/User/Manager/Admin)
   - Step 3: Professional details (org, department, job title)
5. Complete Profile → api.auth.completeProfile.useMutation()
6. Update user with selected role → Navigate to /(home)

// Role Assignment Logic
- Guest: Browse-only access, must complete profile for full access
- User: Personal workspace (optional organization)
- Manager: Team management (requires organization creation)
- Admin: Full system access (requires organization creation)

// Key Fields
- needsProfileCompletion: boolean flag for new OAuth users
- role: 'guest' | 'user' | 'manager' | 'admin'
- organizationId: Required for manager/admin roles
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
// ✅ CORRECT - useTheme() returns ExtendedTheme directly
const theme = useTheme();
<Text style={{ color: theme.foreground }}>
<Box style={{ backgroundColor: theme.primary }}>

// ❌ WRONG - No colors property
<Text style={{ color: theme.colors.foreground }}> // WRONG!

// ✅ Safe access with fallbacks
const bgColor = theme[colorScheme] || theme.primary;
const textColor = theme[`${colorScheme}Foreground`] || theme.foreground;

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

## 🎨 Universal Components & Charts (NEW)

### Overview
The project now includes a comprehensive Universal Design System with 48+ components and a complete charts library. All components are cross-platform (iOS, Android, Web) with full theme integration.

### Universal Component Library
```typescript
// Component Categories (48+ components)
- Layout: Box, Stack, Container, Grid, Card
- Typography: Text, Heading1-4, Label
- Forms: Input, Button, Checkbox, Switch, Select, Slider, DatePicker
- Feedback: Alert, Badge, Progress, Skeleton, Toast
- Navigation: Tabs, Breadcrumb, Pagination, Stepper
- Data Display: Avatar, Table, EmptyState, Timeline, Rating, Stats
- Overlays: Dialog, DropdownMenu, Tooltip, Popover, Drawer
- Charts: Line, Bar, Pie, Area, Radar, Radial

// Import pattern
import { Box, Text, Button, LineChart } from '@/components/universal';
```

### Charts Library Features
```typescript
// Chart usage example
import { LineChart, ChartContainer } from '@/components/universal';

<ChartContainer title="Revenue Trend" description="Monthly data">
  <LineChart
    data={{
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        label: '2024',
        data: [30, 45, 60],
        color: theme.primary,
      }]
    }}
    bezier
    showGrid
    showLegend
  />
</ChartContainer>
```

### Key Component Patterns
```typescript
// All components use forwardRef
export const ComponentName = React.forwardRef<View, ComponentProps>(
  ({ prop1, prop2, ...props }, ref) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    
    return (
      <View ref={ref} {...props}>
        {/* Component implementation */}
      </View>
    );
  }
);

// Theme integration
const styles = {
  backgroundColor: theme.background,
  borderColor: theme.border,
  color: theme.foreground,
};

// Responsive spacing
padding: spacing[4], // 12px compact, 16px medium, 20px large
```

### Design System Features
- **5 Built-in Themes**: Default, Bubblegum, Ocean, Forest, Sunset
- **Dynamic Theme Switching**: Runtime theme changes with persistence
- **Shadow System**: 8 levels (shadow2xs to shadow2xl)
- **Responsive Spacing**: 3 density modes (compact, medium, large)
- **Dark Mode**: All themes support light/dark variants
- **Cross-Platform**: Consistent behavior across all platforms

### Component Status
- **Completed**: 48+ components (96% of planned components)
- **Charts**: 6 chart types with full theme integration
- **Documentation**: Comprehensive guides and examples
- **Bundle Size**: Optimized (removed lucide-react, saved 73MB)

### Key Files
- `components/universal/` - All universal components
- `components/universal/charts/` - Chart components
- `lib/theme/theme-registry.tsx` - Theme definitions
- `lib/design-system/` - Design tokens and spacing
- `docs/design-system/` - Complete documentation

---

*This context guide should be read by every agent before starting work on the codebase. It ensures consistency and quality across all development efforts.*
## 🐳 Docker Development Environment (NEW)

### Overview
The project now includes comprehensive Docker support for consistent development environments across all agents and developers.

### Quick Start with Docker
```bash
# Initial setup (one-time)
./scripts/docker-setup.sh

# Start development environment
docker-compose --profile development up

# Access services
# API: http://localhost:3000
# Expo: http://localhost:8081
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Available Services
```yaml
Core Services:
  postgres: PostgreSQL database (port 5432)
  redis: Caching and queues (port 6379)
  api: tRPC API server (port 3000)
  expo: React Native development (port 8081)

Optional Tools (--profile tools):
  pgadmin: Database management UI (port 5050)
  mailhog: Email testing (SMTP 1025, UI 8025)
  devtools: Development utilities container

Testing (separate compose file):
  test-postgres: Isolated test database
  test-runner: Automated test execution
  e2e-runner: End-to-end testing
```

### Common Docker Commands
```bash
# Database operations
docker-compose exec api bun run db:migrate
docker-compose exec api bun run db:studio

# Run tests
docker-compose -f docker-compose.test.yml run test-runner

# View logs
docker-compose logs -f api

# Shell access
docker-compose exec api sh

# Reset everything
docker-compose down -v
```

### Multi-Agent Docker Support
```bash
# Start agent system
docker-compose -f docker-compose.agents.yml --profile agents up

# Execute agent commands
docker-compose -f docker-compose.agents.yml exec manager-agent \
  bun run process-prd /workspace/docs/projects/my-app/PRD.md
```

### Benefits for Agents
- **Consistent Environment**: All agents work in identical setups
- **Isolated Testing**: No interference between projects
- **Easy Onboarding**: Single command setup
- **Resource Management**: Optimized container allocation
- **Debugging Support**: Integrated debugging tools

EOF < /dev/null