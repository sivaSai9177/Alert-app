# Universal Component Library Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Key Features](#2-key-features)
3. [Installation](#3-installation)
4. [Core Concepts](#4-core-concepts)
5. [Component Library](#5-component-library)
6. [Theme Customization](#6-theme-customization)
7. [Best Practices](#7-best-practices)
8. [Migration Guide](#8-migration-guide)
9. [Performance Tips](#9-performance-tips)
10. [Accessibility](#10-accessibility)
11. [Platform Differences](#11-platform-differences)
12. [Troubleshooting](#12-troubleshooting)
13. [Examples](#13-examples)
14. [Contributing](#14-contributing)
15. [Resources](#15-resources)

## 1. Overview

The Universal Component Library is a comprehensive design system built for React Native (iOS/Android) and React Native Web. It provides consistent, theme-aware, and responsive components that work seamlessly across all platforms.

## 2. Key Features

- 🎨 **Multi-Theme Support**: 5 built-in themes with dynamic switching
- 📱 **Cross-Platform**: Consistent behavior on iOS, Android, and Web
- 🎯 **Type-Safe**: Full TypeScript support with excellent IntelliSense
- 📐 **Responsive Spacing**: 3 density modes (Compact, Medium, Large)
- 🚀 **Performance**: Optimized bundle size (no heavy dependencies)
- ♿ **Accessible**: WCAG compliant with proper labels and touch targets
- 🌗 **Dark Mode**: All themes support light/dark color schemes
- 🎭 **Shadow System**: Theme-aware shadows with 8 levels (NEW)

## 3. Installation

The component library is already integrated into the project. To use components:

```tsx
import { 
  Button, 
  Card, 
  Text, 
  Container 
} from '@/components/universal';
```

## 4. Core Concepts

### 4.1 Theme System

The library uses a sophisticated theme system with multiple built-in themes:

- **Default**: Clean and modern (shadcn inspired)
- **Bubblegum**: Playful pink and purple (Updated with custom shadows)
- **Ocean**: Cool blues and teals
- **Forest**: Natural greens and earth tones
- **Sunset**: Warm oranges and purples

```tsx
import { useThemeContext } from '@/lib/theme/enhanced-theme-provider';

const { themeId, setThemeId } = useThemeContext();
setThemeId('ocean'); // Switch theme
```

### 4.2 Spacing System

All components respect the responsive spacing system:

```tsx
import { useSpacing } from '@/contexts/SpacingContext';

const { density, setDensity } = useSpacing();
// density: 'compact' | 'medium' | 'large'
```

Spacing values scale automatically:
- **Compact**: 75% of base values
- **Medium**: 100% (default)
- **Large**: 125% of base values

### 4.3 Design Tokens

The system uses consistent design tokens:

```tsx
// Spacing: 0-96 (4px base)
<Box p={4} m={2} /> // padding: 16px, margin: 8px

// Border Radius
<Card rounded="md" /> // sm, md, lg, xl, full

// Typography
<Text size="lg" weight="semibold" />
```

## 5. Component Library

### Layout Components

#### Container
Main page wrapper with safe area and scroll support.

```tsx
<Container scroll safe>
  <Text>Content</Text>
</Container>
```

#### Box
Flexible container component (replaces View).

```tsx
<Box 
  p={4} 
  m={2} 
  bgTheme="card" 
  rounded="md"
  borderWidth={1}
  borderTheme="border"
>
  <Text>Box content</Text>
</Box>
```

#### Stack (VStack/HStack)
Layout components for consistent spacing.

```tsx
<VStack spacing={4}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</VStack>

<HStack spacing={2} alignItems="center">
  <Icon />
  <Text>With icon</Text>
</HStack>
```

### Typography

#### Text
Base text component with variants.

```tsx
<Text 
  size="lg" 
  weight="semibold" 
  colorTheme="primary"
>
  Hello World
</Text>

// Pre-styled variants
<Heading1>Page Title</Heading1>
<Paragraph>Body text</Paragraph>
<Caption>Small caption</Caption>
```

#### Label
Form labels with validation states.

```tsx
<Label required error={hasError}>
  Email Address
</Label>
```

### Form Components

#### Input
Text input with validation support.

```tsx
<Input
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  leftIcon={<Ionicons name="mail" />}
/>
```

#### Button
Accessible button with variants.

```tsx
<Button 
  variant="solid" 
  colorScheme="primary"
  size="lg"
  onPress={handlePress}
  isLoading={loading}
  leftIcon={<Ionicons name="save" />}
>
  Save Changes
</Button>
```

#### Select
Dropdown with search and modal display.

```tsx
<Select
  value={selected}
  onValueChange={setSelected}
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' }
  ]}
  placeholder="Select country"
  searchable
/>
```

#### Form
Complete form system with react-hook-form.

```tsx
const form = useForm({
  resolver: zodResolver(schema)
});

<Form form={form} onSubmit={handleSubmit}>
  <FormInput
    name="email"
    label="Email"
    placeholder="you@example.com"
    rules={{ required: 'Email is required' }}
  />
  
  <FormSelect
    name="role"
    label="Role"
    options={roleOptions}
  />
  
  <FormSubmit>Submit</FormSubmit>
</Form>
```

### Feedback Components

#### Alert
Informational alerts with variants.

```tsx
<Alert 
  variant="info"
  title="Note"
  description="Your changes have been saved"
  showIcon
  onClose={handleClose}
/>
```

#### Toast
Toast notifications with positioning.

```tsx
const { show } = useToast();

show({
  title: 'Success!',
  description: 'Operation completed',
  variant: 'success',
  position: 'bottom'
});
```

#### Badge
Status indicators.

```tsx
<Badge variant="success" size="sm">
  Active
</Badge>
```

#### Progress
Progress indicators.

```tsx
<Progress value={75} variant="primary" showValue />

<CircularProgress value={50} size={60} />
```

### Data Display

#### Avatar
Profile images with fallbacks.

```tsx
<Avatar
  source={{ uri: user.avatar }}
  name={user.name}
  size="lg"
  bgColorTheme="primary"
/>

<AvatarGroup max={3}>
  {users.map(user => (
    <Avatar key={user.id} {...user} />
  ))}
</AvatarGroup>
```

#### Card
Content container.

```tsx
<Card p={4} spacing={3}>
  <Heading3>Card Title</Heading3>
  <Text>Card content</Text>
  <Button size="sm">Action</Button>
</Card>
```

#### Skeleton
Loading placeholders.

```tsx
<Skeleton variant="text" lines={3} />
<Skeleton variant="circular" width={40} height={40} />

<SkeletonContainer isLoading={loading}>
  <ActualContent />
</SkeletonContainer>
```

### Interactive Components

#### Toggle
Toggle buttons with groups.

```tsx
<Toggle
  pressed={isActive}
  onPressedChange={setIsActive}
  icon="star"
>
  Favorite
</Toggle>

<ToggleGroup value={selected} onValueChange={setSelected}>
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
  <ToggleGroupItem value="right">Right</ToggleGroupItem>
</ToggleGroup>
```

#### Switch
Toggle switch.

```tsx
<Switch
  value={enabled}
  onValueChange={setEnabled}
  size="md"
/>
```

#### Checkbox
Checkbox with theme support.

```tsx
<Checkbox
  checked={agreed}
  onCheckedChange={setAgreed}
  size="md"
/>
```

## 6. Theme Customization

### Using the Theme

```tsx
import { useTheme } from '@/lib/theme/theme-provider';

const Component = () => {
  const theme = useTheme();
  
  return (
    <View style={{
      backgroundColor: theme.background,
      borderColor: theme.border
    }}>
      <Text style={{ color: theme.foreground }}>
        Themed text
      </Text>
    </View>
  );
};
```

### Theme Colors

Each theme provides these color tokens:

- `background` - Main background
- `foreground` - Main text color
- `card` - Card backgrounds
- `primary` - Primary brand color
- `secondary` - Secondary brand color
- `accent` - Accent color
- `muted` - Muted backgrounds
- `destructive` - Error/danger color
- `success` - Success color
- `border` - Border color
- `input` - Input border color
- `ring` - Focus ring color

### Creating Custom Themes

```tsx
// lib/theme/theme-registry.tsx
export const customTheme: ThemeDefinition = {
  id: 'custom',
  name: 'Custom Theme',
  description: 'My custom theme',
  colors: {
    light: {
      background: '#ffffff',
      foreground: '#000000',
      // ... other colors
    },
    dark: {
      background: '#000000',
      foreground: '#ffffff',
      // ... other colors
    }
  }
};
```

## 7. Best Practices

### 1. Use Theme Colors

```tsx
// ❌ Bad
<Text style={{ color: '#000000' }}>Text</Text>

// ✅ Good
<Text colorTheme="foreground">Text</Text>
```

### 2. Use Spacing Scale

```tsx
// ❌ Bad
<Box style={{ padding: 16 }}>Content</Box>

// ✅ Good
<Box p={4}>Content</Box> // 4 * 4px = 16px
```

### 3. Prefer Universal Components

```tsx
// ❌ Bad
import { View, Text } from 'react-native';

// ✅ Good
import { Box, Text } from '@/components/universal';
```

### 4. Handle Loading States

```tsx
<SkeletonContainer isLoading={loading} skeleton={<Skeleton />}>
  <ActualContent />
</SkeletonContainer>
```

### 5. Use Form Components

```tsx
// ❌ Bad - Manual form handling
<Input value={value} onChangeText={setValue} />
{error && <Text>{error}</Text>}

// ✅ Good - Integrated form system
<FormInput 
  name="field"
  label="Field Label"
  rules={{ required: 'Required' }}
/>
```

## 8. Migration Guide

### From React Native Components

```tsx
// Before
<View style={{ padding: 16, margin: 8 }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
    Title
  </Text>
</View>

// After
<Box p={4} m={2}>
  <Heading3>Title</Heading3>
</Box>
```

### From shadcn Components

```tsx
// Before
import { Button } from '@/components/shadcn/ui/button';
<Button variant="outline">Click</Button>

// After
import { Button } from '@/components/universal';
<Button variant="outline">Click</Button>
```

## 9. Performance Tips

1. **Import only what you need**: Components are tree-shakeable
2. **Use React.memo**: For components with expensive renders
3. **Lazy load themes**: Import themes only when needed
4. **Optimize images**: Use proper image sizing with Avatar
5. **Batch updates**: Use single state updates when possible

## 10. Accessibility

All components follow accessibility best practices:

- Proper labels and hints
- Touch target sizes (minimum 44x44)
- Screen reader support
- Keyboard navigation (web)
- High contrast support
- Focus indicators

## 11. Platform Differences

While components work across platforms, some have platform-specific optimizations:

- **Select**: Uses modal on mobile, dropdown on web
- **Toast**: Different positioning on mobile vs web
- **Tabs**: Platform-specific navigation patterns
- **Input**: Native keyboard handling per platform

## 12. Troubleshooting

### Component not themed

Ensure the component is wrapped in `EnhancedThemeProvider`:

```tsx
<EnhancedThemeProvider>
  <App />
</EnhancedThemeProvider>
```

### Spacing not responsive

Check that `SpacingProvider` is in your app root:

```tsx
<SpacingProvider>
  <App />
</SpacingProvider>
```

### TypeScript errors

Update your TypeScript version and ensure all types are imported:

```tsx
import type { ButtonProps } from '@/components/universal';
```

## 12.1 Latest Updates (January 2025)

### New Components Added (Round 1)
- **RadioGroup**: Radio button groups with context-based state
- **Accordion**: Collapsible content panels with smooth animations
- **Breadcrumb**: Navigation breadcrumbs with ellipsis support
- **Table**: Data tables with striping, sorting, and hover states
- **NavigationMenu**: Navigation menus with content panels

### New Components Added (Round 2)
- **Slider & RangeSlider**: Value selection with range support, marks, and labels
- **Grid**: Responsive grid layout system with Row and Column helpers
- **Pagination**: Page navigation with multiple variants and usePagination hook
- **Popover**: Floating content with smart positioning and arrow
- **DatePicker & DateRangePicker**: Calendar-based date selection with time picker option

### New Components Added (Round 3)
- **Search & SearchModal**: Search input with suggestions, debouncing, and recent searches
- **EmptyState**: Empty content placeholders with pre-configured variants
- **Rating**: Interactive star ratings with statistics display
- **Timeline**: Event timeline with vertical/horizontal layouts
- **Stepper**: Step-by-step navigation with validation and progress tracking

### Shadow System
All themes now support 8 levels of shadows:
```tsx
const theme = useTheme();
// Available shadows:
theme.shadow2xs  // Smallest shadow
theme.shadowXs   // Extra small
theme.shadowSm   // Small
theme.shadow     // Default
theme.shadowMd   // Medium
theme.shadowLg   // Large
theme.shadowXl   // Extra large
theme.shadow2xl  // Largest shadow

// Usage example:
<Box style={{
  shadowColor: theme.primary,
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 5, // Android
}} />
```

### Updated Bubblegum Theme
The Bubblegum theme now features:
- Light mode: Pink-based shadows with 3D effect
- Dark mode: Blue-gray shadows for depth
- Custom hex colors for precise branding

## 13. Examples

See `/app/(auth)/complete-profile-universal.tsx` for a complete example using:
- Form components with validation
- Theme-aware styling
- Responsive layouts
- Toast notifications
- Progress indicators
- Toggle groups

## 14. Contributing

When adding new components:

1. Follow the existing component structure
2. Support all theme colors
3. Respect spacing density
4. Add TypeScript types
5. Include display name
6. Test on all platforms
7. Update this documentation

## 15. Resources

- [Design System Documentation](./DESIGN_SYSTEM.md)
- [Spacing Theme System](./SPACING_THEME_SYSTEM.md)
- [Theme Registry](../../lib/theme/theme-registry.tsx)
- [Component Source](../../components/universal/)