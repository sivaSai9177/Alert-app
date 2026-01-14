# Breadcrumb Usage Guide

This guide shows how to use breadcrumbs in our universal design system.

## Basic Usage

```tsx
import { SimpleBreadcrumb } from '@/components/universal';

// Simple breadcrumb
<SimpleBreadcrumb
  items={[
    { label: 'Settings', current: true }
  ]}
  showHome={true}
  homeLabel="Dashboard"
  homeHref="/(home)"
/>
```

## Page Header Pattern

The standard pattern for page headers with sidebar toggle and breadcrumbs:

```tsx
import { 
  ScrollContainer,
  Box,
  VStack,
  HStack,
  SimpleBreadcrumb,
  Separator,
  Sidebar07Trigger,
  SpacingScale
} from '@/components/universal';

export default function MyPage() {
  return (
    <ScrollContainer safe>
      <VStack p={0} spacing={0}>
        {/* Header with Toggle and Breadcrumbs */}
        <Box 
          px={4 as SpacingScale} 
          py={3 as SpacingScale} 
          borderBottomWidth={1} 
          borderTheme="border"
        >
          <HStack alignItems="center" spacing={2} mb={2 as SpacingScale}>
            <Sidebar07Trigger />
            <Separator orientation="vertical" style={{ height: 24 }} />
            <SimpleBreadcrumb
              items={[
                { label: 'Current Page', current: true }
              ]}
              showHome={true}
              homeLabel="Dashboard"
              homeHref="/(home)"
            />
          </HStack>
        </Box>

        {/* Page Content */}
        <VStack p={4 as SpacingScale} spacing={4}>
          {/* Your page content here */}
        </VStack>
      </VStack>
    </ScrollContainer>
  );
}
```

## Multi-Level Breadcrumbs

For pages with multiple levels:

```tsx
<SimpleBreadcrumb
  items={[
    { label: 'Settings', href: '/(home)/settings' },
    { label: 'Account', href: '/(home)/settings/account' },
    { label: 'Security', current: true }
  ]}
  showHome={true}
  homeLabel="Dashboard"
  homeHref="/(home)"
/>
```

## Dynamic Breadcrumbs

For dynamic content like admin panels:

```tsx
const [activeView, setActiveView] = useState('overview');

<SimpleBreadcrumb
  items={[
    { label: 'Admin', href: '/(home)/admin' },
    { label: activeView.charAt(0).toUpperCase() + activeView.slice(1), current: true }
  ]}
  showHome={true}
  homeLabel="Dashboard"
  homeHref="/(home)"
/>
```

## With Max Items

For long breadcrumb trails:

```tsx
<SimpleBreadcrumb
  items={breadcrumbItems}
  maxItems={4} // Shows first, ellipsis, and last 2 items
  showHome={true}
/>
```

## Custom Separators

```tsx
import { Breadcrumb, BreadcrumbItem } from '@/components/universal';
import { Ionicons } from '@expo/vector-icons';

<Breadcrumb separator={<Text colorTheme="mutedForeground">/</Text>}>
  <BreadcrumbItem href="/(home)">Home</BreadcrumbItem>
  <BreadcrumbItem href="/(home)/settings">Settings</BreadcrumbItem>
  <BreadcrumbItem current>Profile</BreadcrumbItem>
</Breadcrumb>
```

## Integration with Sidebar

The breadcrumbs work seamlessly with our sidebar system:

1. **Desktop**: Shows full breadcrumb trail with sidebar toggle
2. **Mobile**: Shows compact breadcrumbs with drawer toggle
3. **Collapsed Sidebar**: Breadcrumbs provide navigation context

## Best Practices

1. **Always include home**: Use `showHome={true}` for better navigation
2. **Mark current page**: Use `current: true` on the last item
3. **Consistent labeling**: Match breadcrumb labels with page titles
4. **Responsive design**: Breadcrumbs scroll horizontally on mobile
5. **With sidebar toggle**: Always pair with `Sidebar07Trigger` in headers

## Styling

The breadcrumb component automatically:
- Uses theme colors for links and current page
- Adapts to dark mode
- Provides hover states on web
- Handles touch feedback on mobile
- Respects spacing density settings