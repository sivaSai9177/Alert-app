# Agent Development Guide - Healthcare Alert System

## 🤖 Agent-Optimized Workflow

### Overview
This guide provides structured workflows for AI agents to efficiently implement the healthcare alert system using our established patterns and technologies.

## 📋 Pre-Implementation Checklist

Before starting any implementation:
1. **Read** `/docs/PROJECT_TASK_INDEX.md` for current status
2. **Review** `/CLAUDE.md` for established patterns
3. **Check** existing components in `/components/universal/`
4. **Understand** golden ratio design in `/docs/ux/blocks/GOLDEN_RATIO_DESIGN_SYSTEM.md`
5. **Follow** implementation examples in `/docs/ux/blocks/IMPLEMENTATION_EXAMPLES.md`

## 🏗️ Implementation Workflow

### Phase 1: Understanding Context
```markdown
1. Analyze existing universal components
   - Location: /components/universal/
   - Count: 48+ components
   - Key: Box, Card, Button, Input, etc.

2. Review design specifications
   - Golden ratio: 1.618
   - Spacing: 2, 3, 5, 8, 13, 21, 34, 55, 89
   - Heights: Follow Fibonacci sequence

3. Check implemented procedures
   - Location: /src/server/routers/
   - Implemented: 37 procedures
   - Missing: 38 procedures (see checklist)
```

### Phase 2: Block to Screen Conversion

#### Step 1: Create Screen File Structure
```typescript
// app/(home)/[screen-name].tsx
import { Container, VStack } from '@/components/universal';
import { [BlockName] } from '@/components/healthcare/blocks/[BlockName]';
import { useAuth } from '@/hooks/useAuth';

export default function [ScreenName]() {
  const { user } = useAuth();
  
  // Role-based access
  if (!user || user.role !== '[required-role]') {
    return <AccessDenied />;
  }
  
  return (
    <Container>
      <[BlockName] />
    </Container>
  );
}
```

#### Step 2: Create Block Component
```typescript
// components/healthcare/blocks/[BlockName].tsx
import { Card, VStack, HStack } from '@/components/universal';
import { goldenSpacing, goldenShadows } from '@/lib/design-system';
import { api } from '@/lib/trpc';
import { z } from 'zod';

// 1. Define Zod schema
const [blockName]Schema = z.object({
  // Define validation
});

// 2. Create Zustand store if needed
const use[BlockName]Store = create()(
  devtools(
    persist(
      (set) => ({
        // State and actions
      })
    )
  )
);

// 3. Main component
export const [BlockName] = () => {
  // Use React 19 features
  const [isPending, startTransition] = useTransition();
  const deferredValue = useDeferredValue(searchValue);
  
  // tRPC queries/mutations
  const { data } = api.[router].[procedure].useQuery();
  const mutation = api.[router].[procedure].useMutation();
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.lg}
      shadow={goldenShadows.md}
    >
      {/* Implement UI following golden ratio */}
    </Card>
  );
};
```

### Phase 3: tRPC Integration Pattern

#### Backend Procedure Template
```typescript
// src/server/routers/[router].ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const [router]Router = router({
  [procedureName]: protectedProcedure
    .input(z.object({
      // Input validation
    }))
    .query/mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!ctx.hasPermission('[permission]')) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      // Implement logic
      const result = await ctx.db
        .select()
        .from(tables.[table])
        .where(/* conditions */);
      
      // Audit log
      await ctx.audit.log({
        action: '[action]',
        resourceType: '[resource]',
        resourceId: result.id,
      });
      
      return result;
    }),
});
```

#### Frontend Usage Pattern
```typescript
// With optimistic updates
const mutation = api.[router].[procedure].useMutation({
  onMutate: async (input) => {
    // Cancel queries
    await queryClient.cancelQueries({ queryKey: ['[router].[query]'] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['[router].[query]']);
    
    // Optimistically update
    queryClient.setQueryData(['[router].[query]'], (old) => {
      // Update logic
    });
    
    return { previous };
  },
  onError: (err, input, context) => {
    // Rollback
    if (context?.previous) {
      queryClient.setQueryData(['[router].[query]'], context.previous);
    }
  },
  onSettled: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['[router].[query]'] });
  },
});
```

## 🎨 Component Implementation Patterns

### 1. Golden Ratio Card Pattern
```typescript
<Card
  style={{
    width: 377,  // Fibonacci
    height: 233, // Width ÷ 1.618
    padding: goldenSpacing.xl, // 21px
    gap: goldenSpacing.lg,     // 13px
  }}
>
  <Box height={89}>  {/* Header section */}
  <Box height={89}>  {/* Content section */}
  <Box height={55}>  {/* Actions section */}
</Card>
```

### 2. Loading State Pattern
```typescript
if (isLoading) {
  return (
    <VStack gap={goldenSpacing.lg}>
      <Skeleton height={89} />
      <Skeleton height={144} />
      <Skeleton height={55} />
    </VStack>
  );
}
```

### 3. Error State Pattern
```typescript
if (error) {
  return (
    <EmptyState
      icon="⚠️"
      title="Error loading data"
      description={error.message}
      action={{
        label: 'Retry',
        onPress: () => refetch(),
      }}
    />
  );
}
```

### 4. Real-time Subscription Pattern
```typescript
// Subscribe to updates
api.[router].subscribe[Resource].useSubscription(
  { resourceId },
  {
    onData: (update) => {
      // Update cache without refetch
      queryClient.setQueryData(
        ['[router].[query]', { resourceId }],
        (old) => ({ ...old, ...update })
      );
    },
  }
);
```

## 📱 Screen Implementation Checklist

### Operator Dashboard
- [ ] Create `app/(home)/operator-dashboard.tsx`
- [ ] Import `AlertCreationBlock`
- [ ] Import `ActiveAlertsListBlock`
- [ ] Add role check for 'operator'
- [ ] Connect to `api.healthcare.createAlert`

### Healthcare Dashboard
- [ ] Create `app/(home)/healthcare-dashboard.tsx`
- [ ] Import `AlertListBlock`
- [ ] Import `MetricsOverviewBlock`
- [ ] Add role check for 'nurse' | 'doctor'
- [ ] Connect to `api.healthcare.getActiveAlerts`

### Patient Details
- [ ] Create `app/(home)/patient/[id].tsx`
- [ ] Import `PatientCardBlock`
- [ ] Import `VitalSignsTrendBlock`
- [ ] Import `MedicationManagementBlock`
- [ ] Connect to `api.patient.getDetails`

### Admin Panel
- [ ] Create `app/(home)/admin.tsx`
- [ ] Import `StaffStatusBlock`
- [ ] Import `SystemMetricsBlock`
- [ ] Add role check for 'admin'
- [ ] Connect to `api.admin.getAnalytics`

## 🧪 Testing Patterns

### Component Test Template
```typescript
// __tests__/components/[BlockName].test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { [BlockName] } from '@/components/healthcare/blocks/[BlockName]';

describe('[BlockName]', () => {
  it('renders with golden ratio dimensions', () => {
    const { getByTestId } = render(<[BlockName] />);
    const container = getByTestId('[block-name]-container');
    
    expect(container).toHaveStyle({
      height: 233, // Or appropriate Fibonacci number
    });
  });
  
  it('handles user interactions', async () => {
    const onPress = jest.fn();
    render(<[BlockName] onPress={onPress} />);
    
    fireEvent.press(screen.getByText('Action'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Integration Test Template
```typescript
// __tests__/integration/[feature].test.tsx
import { renderWithProviders } from '@/test-utils';
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('[Feature] Integration', () => {
  it('completes full user flow', async () => {
    // Mock API responses
    server.use(
      rest.post('/api/trpc/[procedure]', (req, res, ctx) => {
        return res(ctx.json({ result: { /* mock data */ } }));
      })
    );
    
    // Render screen
    const { user } = renderWithProviders(<[Screen] />);
    
    // Perform actions
    await user.type(screen.getByLabelText('Input'), 'value');
    await user.press(screen.getByText('Submit'));
    
    // Assert results
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
});
```

## 🚀 Performance Optimization Checklist

### 1. Use React 19 Features
- [ ] `useDeferredValue` for search inputs
- [ ] `useTransition` for non-urgent updates
- [ ] `useOptimistic` for immediate feedback
- [ ] Suspense boundaries for lazy loading

### 2. Virtualize Long Lists
- [ ] Use `@tanstack/react-virtual` for lists >50 items
- [ ] Implement proper `getItemKey` function
- [ ] Set appropriate `overscan` value

### 3. Optimize Re-renders
- [ ] Wrap components in `React.memo`
- [ ] Use `useCallback` for event handlers
- [ ] Use `useMemo` for expensive calculations
- [ ] Split large components

### 4. Bundle Optimization
- [ ] Lazy load heavy components
- [ ] Code split by route
- [ ] Optimize images
- [ ] Tree shake unused code

## 📝 Code Generation Commands

### Generate New Block
```bash
# Template for new block
cat > components/healthcare/blocks/[NewBlock].tsx << 'EOF'
import { Card, VStack, HStack, Text, Button } from '@/components/universal';
import { goldenSpacing, goldenShadows } from '@/lib/design-system';
import { api } from '@/lib/trpc';
import { z } from 'zod';
import { create } from 'zustand';
import { useTransition, useDeferredValue } from 'react';

// Zod schema
const schema = z.object({
  // Add fields
});

// Zustand store
const useStore = create()((set) => ({
  // Add state
}));

// Component
export const [NewBlock] = () => {
  const [isPending, startTransition] = useTransition();
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.lg}
      shadow={goldenShadows.md}
      style={{ minHeight: 233 }}
    >
      {/* Implementation */}
    </Card>
  );
};
EOF
```

### Generate New Screen
```bash
# Template for new screen
cat > app/(home)/[new-screen].tsx << 'EOF'
import { Container } from '@/components/universal';
import { [Block1], [Block2] } from '@/components/healthcare/blocks';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function [NewScreen]() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingView />;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== '[required-role]') return <AccessDenied />;
  
  return (
    <Container>
      <[Block1] />
      <[Block2] />
    </Container>
  );
}
EOF
```

## 🎯 Quality Checklist

Before marking a task complete:

### Code Quality
- [ ] TypeScript - No `any` types
- [ ] Zod validation on all inputs
- [ ] Error boundaries implemented
- [ ] Loading states handled
- [ ] Empty states designed

### Performance
- [ ] Lighthouse score >90
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Lazy loading implemented

### Accessibility
- [ ] Screen reader tested
- [ ] Keyboard navigation works
- [ ] Touch targets ≥44px
- [ ] Color contrast AAA

### Testing
- [ ] Unit tests written
- [ ] Integration tests pass
- [ ] Manual testing complete
- [ ] Cross-platform verified

---

*This guide enables AI agents to implement the healthcare system consistently and efficiently.*