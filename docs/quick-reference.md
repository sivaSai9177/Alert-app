# 🚀 Quick Reference Guide

A rapid reference for common tasks when using Claude Code with the Expo Modern Starter Kit.

## 📱 Common Commands

### Development
```bash
bun start              # Expo Go mode (default)
bun start:tunnel       # Tunnel mode for remote access
bun local             # Local dev with Docker DB
bun dev               # Dev mode with Neon Cloud DB
bun ios               # iOS Simulator
bun android           # Android Emulator
bun web               # Web browser
```

### Database
```bash
bun db:push           # Push schema changes
bun db:studio         # Open Drizzle Studio
bun db:migrate        # Run migrations
bun db:local:up       # Start Docker PostgreSQL
bun db:local:down     # Stop Docker PostgreSQL
```

### Testing & Quality
```bash
bun test              # Run tests
bun test:watch        # Watch mode
bun lint              # Run ESLint
bun type-check        # TypeScript check
```

### Building
```bash
bun preview:ios       # iOS preview build
bun preview:android   # Android preview build
bun eas:setup         # Setup EAS Build
```

## 🎯 Quick Tasks

### Add a New Screen
```typescript
// app/(home)/new-screen.tsx
import { Container, VStack, Text } from '@/components/universal';

export default function NewScreen() {
  return (
    <Container scroll>
      <VStack p={4} spacing={4}>
        <Text variant="heading1">Title</Text>
      </VStack>
    </Container>
  );
}
```

### Create API Endpoint
```typescript
// src/server/routers/feature.ts
export const featureRouter = router({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      // Implementation
    }),
});
```

### Add to State
```typescript
// lib/stores/feature-store.ts
export const useFeatureStore = create<FeatureStore>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

### Universal Component
```typescript
// components/universal/MyComponent.tsx
export function MyComponent({ children, ...props }) {
  return (
    <View {...props}>
      {children}
    </View>
  );
}
```

## 🔑 Key Patterns

### Authentication Check
```typescript
const { user, isAuthenticated } = useAuthStore();
if (!isAuthenticated) return <Redirect href="/login" />;
```

### API Call with TanStack Query
```typescript
const { data, isLoading } = api.feature.getAll.useQuery();
const mutation = api.feature.create.useMutation();
```

### Form with Validation
```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '' },
});
```

### Theme Usage
```typescript
const theme = useTheme();
const isDark = useColorScheme() === 'dark';
```

## 📁 File Locations

| Type | Location | Example |
|------|----------|---------|
| Screens | `app/` | `app/(home)/dashboard.tsx` |
| Components | `components/` | `components/universal/Card.tsx` |
| API Routes | `src/server/routers/` | `src/server/routers/user.ts` |
| Stores | `lib/stores/` | `lib/stores/auth-store.ts` |
| Types | `types/` | `types/user.ts` |
| Schemas | `lib/validations/` | `lib/validations/auth.ts` |
| Database | `src/db/` | `src/db/schema.ts` |
| Utilities | `lib/` | `lib/utils.ts` |

## 🎨 Component Usage

### Layout Components
```tsx
<Container scroll safe>
  <VStack p={4} spacing={4}>
    <HStack justify="between">
      <Text>Left</Text>
      <Text>Right</Text>
    </HStack>
  </VStack>
</Container>
```

### Form Components
```tsx
<Form {...form}>
  <VStack spacing={4}>
    <FormField name="email" control={form.control}>
      <Input placeholder="Email" />
    </FormField>
    <Button onPress={form.handleSubmit(onSubmit)}>
      Submit
    </Button>
  </VStack>
</Form>
```

### Data Display
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Text>Content</Text>
  </CardContent>
</Card>
```

## 🛡️ Authorization Patterns

### Protected Route
```tsx
// In _layout.tsx
<Stack.Screen 
  name="admin" 
  options={{ title: "Admin" }}
  redirect={!hasRole('admin')}
/>
```

### API Authorization
```typescript
// Admin only
adminProcedure.mutation(async ({ ctx }) => {
  // ctx.user is admin
});

// Custom permission
createPermissionProcedure('manage_users')
  .query(async ({ ctx }) => {
    // Has permission
  });
```

## 🔧 Debugging Tips

1. **Check Logs**: Use enhanced debug panel
2. **API Issues**: Check network tab
3. **State Issues**: Use Zustand DevTools
4. **Type Errors**: Run `bun type-check`
5. **Platform Issues**: Test on specific platform

## 📝 Common Fixes

### Expo Go Issues
```bash
# Clear cache
expo start -c

# Reset Metro
rm -rf node_modules/.cache
```

### Database Issues
```bash
# Reset local DB
bun db:local:reset

# Push schema
bun db:push
```

### Build Issues
```bash
# Clear and reinstall
rm -rf node_modules
bun install
```

## 🎯 Performance Tips

1. Use React.memo for lists
2. Apply useDeferredValue for search
3. Use useTransition for updates
4. Lazy load heavy components
5. Monitor bundle size

---

*For detailed information, see the full [Agent User Guide](/AGENT_USER_GUIDE.md)*