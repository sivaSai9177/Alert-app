# Frontend Architecture Documentation

## Overview

This document outlines the frontend architecture of the Expo Starter Kit, a production-ready mobile and web application built with React Native, Expo, and TypeScript. The architecture emphasizes scalability, maintainability, and consistent user experience across platforms.

## Architecture Principles

1. **Component-First Design**: Universal components that work across iOS, Android, and Web
2. **Type Safety**: Full TypeScript coverage with strict mode
3. **State Management**: Clear separation between server and client state
4. **Performance**: Optimized bundle size and lazy loading
5. **Accessibility**: WCAG compliance and platform-specific optimizations
6. **Themeable**: Multi-theme support with dynamic switching
7. **Testable**: Comprehensive testing strategy

## Technology Stack

### Core Technologies
- **React Native 0.76.6**: Cross-platform mobile framework
- **Expo SDK 53**: Enhanced React Native development platform
- **TypeScript 5.3.3**: Type-safe JavaScript
- **Expo Router v4**: File-based routing

### State Management
- **TanStack Query v5**: Server state management
- **Zustand**: Client state management
- **React Hook Form**: Form state management

### API Layer
- **tRPC v11**: Type-safe API client
- **Better Auth**: Authentication system
- **Drizzle ORM**: Database queries

### UI/UX
- **Universal Component Library**: Custom design system
- **NativeWind v4**: Tailwind CSS for React Native
- **Expo Vector Icons**: Icon library
- **React Native Reanimated**: Animations

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│        (Screens, Components, Universal Library)          │
├─────────────────────────────────────────────────────────┤
│                    Navigation Layer                      │
│              (Expo Router, Protected Routes)             │
├─────────────────────────────────────────────────────────┤
│                  State Management Layer                  │
│        (TanStack Query, Zustand, React Hook Form)       │
├─────────────────────────────────────────────────────────┤
│                      API Layer                          │
│           (tRPC Client, Type-safe Procedures)           │
├─────────────────────────────────────────────────────────┤
│                    Service Layer                        │
│        (Auth, Storage, Notifications, Analytics)        │
├─────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                   │
│            (Logging, Error Handling, Config)            │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
app/                      # Screens and routing
├── (auth)/              # Public auth screens
├── (home)/              # Protected app screens  
├── api/                 # API routes
└── _layout.tsx          # Root layout

components/              # UI components
├── universal/           # Design system components
├── shadcn/             # Adapted shadcn components
└── [feature]/          # Feature-specific components

lib/                     # Core utilities
├── auth/               # Authentication logic
├── core/               # Core utilities
├── design-system/      # Design tokens
├── stores/             # State stores
├── theme/              # Theme system
└── validations/        # Zod schemas

hooks/                   # Custom React hooks
contexts/               # React contexts
types/                  # TypeScript definitions
```

## Component Architecture

### Universal Component System

Components follow a consistent structure:

```tsx
// Component Interface
export interface ComponentProps {
  // Props definition
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  // ... other props
}

// Component Implementation
export const Component = React.forwardRef<View, ComponentProps>(({
  variant = 'primary',
  size = 'md',
  ...props
}, ref) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  
  // Component logic
  
  return (
    <View ref={ref} {...props}>
      {/* Component JSX */}
    </View>
  );
});

Component.displayName = 'Component';
```

### Component Categories

1. **Layout Components**
   - Container, Box, Stack (VStack/HStack)
   - Consistent spacing and responsive behavior

2. **Form Components**
   - Input, Select, Checkbox, Switch
   - Integrated validation and error handling

3. **Feedback Components**
   - Alert, Toast, Progress, Skeleton
   - Loading and error states

4. **Data Display**
   - Card, Avatar, Badge, Table
   - Consistent data presentation

5. **Navigation**
   - Link, Tabs, Breadcrumb
   - Platform-aware navigation

## State Management Strategy

### Server State (TanStack Query)

```tsx
// API calls via tRPC
const { data, isLoading } = api.user.getProfile.useQuery();

// Mutations with optimistic updates
const mutation = api.user.update.useMutation({
  onMutate: async (newData) => {
    // Optimistic update
    await utils.user.cancel();
    const previous = utils.user.getData();
    utils.user.setData(newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    utils.user.setData(context.previous);
  }
});
```

### Client State (Zustand)

```tsx
// Store definition
interface UIStore {
  theme: string;
  sidebarOpen: boolean;
  setTheme: (theme: string) => void;
  toggleSidebar: () => void;
}

// Store usage
const { theme, setTheme } = useUIStore();
```

### Form State (React Hook Form)

```tsx
// Form with validation
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '' }
});

// Form component
<Form form={form} onSubmit={handleSubmit}>
  <FormInput name="email" label="Email" />
</Form>
```

## Navigation Architecture

### File-Based Routing

```
app/
├── index.tsx           # /
├── (auth)/
│   ├── login.tsx      # /login
│   └── register.tsx   # /register
├── (home)/
│   ├── _layout.tsx    # Tab layout
│   ├── index.tsx      # /home
│   └── profile.tsx    # /profile
```

### Protected Routes

```tsx
// Route protection with layout groups
export default function HomeLayout() {
  return (
    <Stack.Protected 
      requireAuth 
      requireProfileCompletion
      fallback="/(auth)/login"
    >
      <Tabs />
    </Stack.Protected>
  );
}
```

### Navigation Patterns

```tsx
// Programmatic navigation
const router = useRouter();

// Replace for auth flows
router.replace('/(home)');

// Push for regular navigation
router.push('/profile');

// With params
router.push({
  pathname: '/user/[id]',
  params: { id: userId }
});
```

## Theme Architecture

### Multi-Theme Support

```tsx
// Theme structure
interface Theme {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  // ... other colors
}

// Available themes
- Default (shadcn)
- Bubblegum
- Ocean
- Forest
- Sunset
```

### Theme Usage

```tsx
// Component theming
<Box bgTheme="card" borderTheme="border">
  <Text colorTheme="primary">Themed text</Text>
</Box>

// Direct theme access
const theme = useTheme();
style={{ backgroundColor: theme.card }}
```

### Responsive Spacing

```tsx
// Spacing density modes
const { density } = useSpacing();
// 'compact' | 'medium' | 'large'

// Automatic scaling
<Box p={4}> // 12px, 16px, or 20px based on density
```

## Performance Optimization

### Bundle Size Optimization

1. **Icon Library**: Replaced lucide-react (73MB) with @expo/vector-icons
2. **Tree Shaking**: Proper imports for smaller bundles
3. **Code Splitting**: Lazy loading for routes
4. **Asset Optimization**: Compressed images and fonts

### Runtime Performance

1. **React.memo**: Prevent unnecessary re-renders
2. **useMemo/useCallback**: Optimize expensive operations
3. **Virtual Lists**: For long scrollable content
4. **Image Caching**: Expo Image with caching
5. **Debouncing**: For search and input fields

### Query Optimization

```tsx
// Parallel queries
const [users, posts] = api.useQueries((t) => [
  t.user.list(),
  t.post.list()
]);

// Prefetching
await utils.user.profile.prefetch({ id });

// Query invalidation
utils.user.invalidate();
```

## Error Handling

### Global Error Boundary

```tsx
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

### API Error Handling

```tsx
// tRPC error handling
const mutation = api.user.create.useMutation({
  onError: (error) => {
    if (error.code === 'CONFLICT') {
      showToast({ title: 'User already exists' });
    }
  }
});
```

### Form Error Display

```tsx
<FormInput
  name="email"
  error={form.formState.errors.email?.message}
/>
```

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing with @testing-library/react-hooks
- Utility function tests with Jest

### Integration Tests
- API integration tests
- Navigation flow tests
- State management tests

### E2E Tests
- Critical user flows
- Cross-platform testing
- Visual regression tests

## Security Considerations

1. **Input Validation**: Zod schemas on client and server
2. **XSS Prevention**: Sanitized user input
3. **Secure Storage**: Expo SecureStore for sensitive data
4. **API Security**: tRPC with authentication middleware
5. **Environment Variables**: Proper secret management

## Accessibility

1. **Screen Reader Support**: Proper labels and hints
2. **Keyboard Navigation**: Full keyboard support on web
3. **Touch Targets**: Minimum 44x44 size
4. **Color Contrast**: WCAG AA compliance
5. **Focus Management**: Visible focus indicators

## Development Workflow

### Component Development

1. Create component in `components/universal/`
2. Add TypeScript interface
3. Implement with theme support
4. Add to exports in `index.ts`
5. Document usage
6. Write tests

### Feature Development

1. Define data models and API
2. Create tRPC procedures
3. Build UI components
4. Implement business logic
5. Add error handling
6. Write tests
7. Update documentation

### Code Quality

- ESLint for code linting
- Prettier for formatting
- TypeScript strict mode
- Pre-commit hooks
- Code reviews

## Deployment Considerations

### Web Deployment
- Static export with Expo
- CDN for assets
- Environment-specific builds

### Mobile Deployment
- EAS Build for native apps
- Over-the-air updates
- Platform-specific optimizations

### Environment Management
- Development, staging, production
- Feature flags
- A/B testing support

## Best Practices

1. **Component Composition**: Build complex UIs from simple components
2. **Type Safety**: Leverage TypeScript for all code
3. **Consistent Styling**: Use design system tokens
4. **Error Handling**: Handle all error states gracefully
5. **Performance**: Profile and optimize regularly
6. **Documentation**: Keep docs up to date
7. **Testing**: Maintain high test coverage

## Future Considerations

1. **Micro-Frontends**: Module federation for large teams
2. **GraphQL Migration**: Consider for complex data needs
3. **Real-time Features**: WebSocket integration
4. **Offline Support**: Enhanced offline capabilities
5. **Analytics**: Comprehensive user analytics
6. **Internationalization**: Multi-language support

## Resources

- [Universal Component Library](../design-system/UNIVERSAL_COMPONENT_LIBRARY.md)
- [Design System](../design-system/DESIGN_SYSTEM.md)
- [Navigation Architecture](../guides/NAVIGATION_ARCHITECTURE.md)
- [State Management Guide](../guides/TANSTACK_TRPC_INTEGRATION.md)
- [Testing Guide](../__tests__/README.md)