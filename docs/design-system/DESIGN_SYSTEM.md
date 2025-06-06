# Universal Design System

A comprehensive design system for building consistent, cross-platform React Native applications that work seamlessly on iOS, Android, and Web.

## Overview

This design system provides:
- **Universal Components**: Platform-agnostic components that adapt to each platform
- **Design Tokens**: Consistent spacing, typography, colors, and shadows
- **Theme Integration**: Full dark mode support with automatic theme switching
- **Type Safety**: Complete TypeScript support with proper types
- **Performance**: Optimized for React Native with minimal overhead

## Core Components

### 1. Box
A flexible container component with extensive styling props.

```tsx
import { Box } from '@/components/universal';

// Basic usage
<Box p={4} bg={theme.card} rounded="lg" shadow="md">
  <Text>Content</Text>
</Box>

// Advanced layout
<Box
  flex={1}
  flexDirection="row"
  justifyContent="space-between"
  alignItems="center"
  px={6}
  py={4}
  bgTheme="background"
  borderBottomWidth={1}
  borderTheme="border"
>
  {/* Content */}
</Box>
```

**Props:**
- Spacing: `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl`, `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`
- Layout: `flex`, `flexDirection`, `justifyContent`, `alignItems`, `gap`
- Visual: `bg`, `bgTheme`, `rounded`, `shadow`, `opacity`
- Border: `borderWidth`, `borderColor`, `borderTheme`

### 2. Text
Typography component with built-in theme support.

```tsx
import { Text, Heading1, Paragraph, Caption } from '@/components/universal';

// Basic text
<Text size="lg" weight="semibold" colorTheme="primary">
  Hello World
</Text>

// Convenience components
<Heading1>Page Title</Heading1>
<Paragraph>Body text with proper line height.</Paragraph>
<Caption>Small muted text</Caption>
```

**Props:**
- Typography: `size`, `weight`, `align`, `transform`, `decoration`
- Color: `color`, `colorTheme`
- Spacing: `mt`, `mr`, `mb`, `ml`

### 3. Stack
Layout component for arranging children with consistent spacing.

```tsx
import { Stack, VStack, HStack } from '@/components/universal';

// Vertical stack
<VStack spacing={4}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</VStack>

// Horizontal stack
<HStack spacing={2} alignItems="center">
  <Icon />
  <Text>Label</Text>
</HStack>
```

### 4. Button
Accessible button component with multiple variants.

```tsx
import { Button } from '@/components/universal';

// Primary button
<Button onPress={handlePress}>
  Click Me
</Button>

// Different variants
<Button variant="outline" colorScheme="secondary">
  Secondary
</Button>

<Button 
  variant="ghost" 
  size="lg"
  leftIcon={<Icon name="settings" />}
  isLoading={loading}
>
  Settings
</Button>
```

**Props:**
- Variants: `solid`, `outline`, `ghost`, `link`
- Sizes: `sm`, `md`, `lg`, `xl`
- Color schemes: `primary`, `secondary`, `destructive`, `accent`, `muted`
- States: `isLoading`, `isDisabled`

### 5. Container
Page container with safe area and scroll support.

```tsx
import { Container } from '@/components/universal';

// Basic page
<Container>
  <Heading1>Page Title</Heading1>
  <Paragraph>Content goes here</Paragraph>
</Container>

// Scrollable with max width
<Container scroll maxWidth="lg" px={4}>
  {/* Long content */}
</Container>
```

### 6. Input
Form input component with validation support.

```tsx
import { Input } from '@/components/universal';

<Input
  label="Email"
  placeholder="Enter your email"
  error={errors.email}
  hint="We'll never share your email"
  isRequired
/>
```

## Design Tokens

### Spacing Scale
Based on 4px unit:
```tsx
spacing: {
  0: 0,    // 0px
  1: 4,    // 4px
  2: 8,    // 8px
  3: 12,   // 12px
  4: 16,   // 16px
  5: 20,   // 20px
  6: 24,   // 24px
  8: 32,   // 32px
  10: 40,  // 40px
  12: 48,  // 48px
  16: 64,  // 64px
  20: 80,  // 80px
  24: 96,  // 96px
  32: 128, // 128px
}
```

### Typography Scale
```tsx
fontSize: {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
}

fontWeight: {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

### Border Radius
```tsx
borderRadius: {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
}
```

### Shadows
Platform-optimized shadows:
```tsx
shadows: {
  none: { /* no shadow */ },
  sm: { /* subtle shadow */ },
  base: { /* default shadow */ },
  md: { /* medium shadow */ },
  lg: { /* large shadow */ },
  xl: { /* extra large shadow */ },
  '2xl': { /* 2x large shadow */ },
}
```

## Theme Colors

All components automatically use theme colors:

```tsx
// Background colors
theme.background      // Main background
theme.card           // Card background
theme.popover        // Popover/modal background

// Text colors
theme.foreground     // Primary text
theme.mutedForeground // Secondary text
theme.cardForeground  // Text on cards

// Interactive colors
theme.primary        // Primary actions
theme.secondary      // Secondary actions
theme.destructive    // Errors/dangers
theme.accent         // Accents/success
theme.muted          // Disabled states

// Border colors
theme.border         // Default borders
theme.input          // Input borders
theme.ring           // Focus rings
```

## Migration Guide

### From Hardcoded Styles
```tsx
// Before
<View style={{ 
  padding: 16, 
  backgroundColor: '#ffffff',
  borderRadius: 8 
}}>
  <Text style={{ color: '#000000', fontSize: 18 }}>
    Title
  </Text>
</View>

// After
<Box p={4} bgTheme="background" rounded="lg">
  <Text size="lg" colorTheme="foreground">
    Title
  </Text>
</Box>
```

### From Shadcn Components
```tsx
// Before
import { Card } from '@/components/shadcn/ui/card';
<Card className="p-4">

// After
import { Box } from '@/components/universal';
<Box p={4} bgTheme="card" rounded="lg" shadow="sm">
```

## Best Practices

1. **Use Theme Colors**: Always use `colorTheme` or `bgTheme` props instead of hardcoded colors
2. **Consistent Spacing**: Use the spacing scale for all padding/margin
3. **Semantic Components**: Use `Heading1`, `Paragraph`, etc. for better semantics
4. **Platform Awareness**: Test on all platforms to ensure consistency
5. **Dark Mode**: Always test components in both light and dark modes

## Examples

### Card Component
```tsx
<Box bgTheme="card" rounded="lg" shadow="md" p={4}>
  <HStack spacing={3} mb={3}>
    <Avatar size={40} />
    <VStack flex={1}>
      <Text weight="semibold">John Doe</Text>
      <Caption>2 hours ago</Caption>
    </VStack>
  </HStack>
  <Paragraph mb={3}>
    This is a sample card component using the design system.
  </Paragraph>
  <Button size="sm" variant="outline">
    Read More
  </Button>
</Box>
```

### Form Example
```tsx
<Container px={4}>
  <VStack spacing={6}>
    <Heading1>Sign Up</Heading1>
    
    <Input
      label="Full Name"
      placeholder="John Doe"
      isRequired
    />
    
    <Input
      label="Email"
      placeholder="john@example.com"
      keyboardType="email-address"
      isRequired
    />
    
    <Input
      label="Password"
      placeholder="••••••••"
      secureTextEntry
      isRequired
    />
    
    <Button fullWidth>
      Create Account
    </Button>
  </VStack>
</Container>
```

## Platform-Specific Features

The design system automatically handles platform differences:

- **iOS**: Uses San Francisco font, iOS-style shadows
- **Android**: Uses Roboto font, elevation for shadows
- **Web**: Uses system fonts, CSS shadows

## Performance Considerations

1. Components are optimized to minimize re-renders
2. Styles are memoized where appropriate
3. Platform checks are done at build time when possible
4. No runtime CSS-in-JS overhead

## Future Enhancements

- [ ] Animation system with Reanimated
- [ ] Advanced form components (Select, Checkbox, Radio)
- [ ] Data display components (Table, List)
- [ ] Overlay components (Modal, Drawer, Popover)
- [ ] Icon system integration
- [ ] Accessibility improvements

## Contributing

When adding new components:
1. Ensure full TypeScript support
2. Test on all platforms
3. Support both light and dark modes
4. Follow the existing prop patterns
5. Add comprehensive documentation