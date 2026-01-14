# Spacing Theme System

A comprehensive responsive spacing system that provides adaptive layouts for compact, medium, and large display densities across all platforms.

## Overview

The spacing theme system allows your app to adapt its visual density based on:
- Device screen size
- User preferences
- Accessibility needs

This ensures optimal content display whether on a small phone, tablet, or large screen.

## Core Concepts

### 1. Spacing Densities

The system provides three density modes:

#### **Compact** (75% of base)
- For small screens or when maximum content is needed
- Reduced padding, margins, and component sizes
- Ideal for phones under 360px width

#### **Medium** (100% of base)
- Default density for most devices
- Standard spacing and sizing
- Ideal for standard phones (360-768px)

#### **Large** (125% of base)
- Enhanced readability and touch targets
- Increased spacing and larger components
- Ideal for tablets and accessibility

### 2. Automatic Density Detection

The system automatically selects the appropriate density based on screen width:
- **< 360px**: Compact
- **360-768px**: Medium
- **> 768px**: Large

Users can override this automatic selection in settings.

## Implementation

### 1. SpacingProvider Setup

The `SpacingProvider` is included in the root layout:

```tsx
// app/_layout.tsx
<SpacingProvider>
  {/* Your app content */}
</SpacingProvider>
```

### 2. Using Spacing in Components

#### Box Component
```tsx
import { Box } from '@/components/universal';

// Spacing automatically adjusts based on density
<Box p={4} m={2} gap={3}>
  {/* In compact: padding=12px, margin=6px, gap=9px */}
  {/* In medium: padding=16px, margin=8px, gap=12px */}
  {/* In large: padding=20px, margin=10px, gap=15px */}
</Box>
```

#### Text Component
```tsx
import { Text } from '@/components/universal';

// Font sizes adjust with density
<Text size="lg">
  {/* Compact: 16px, Medium: 18px, Large: 20px */}
</Text>
```

#### Stack Components
```tsx
import { VStack, HStack } from '@/components/universal';

// Stack spacing responds to density
<VStack spacing={4}>
  {/* Compact: 12px, Medium: 16px, Large: 20px */}
</VStack>
```

### 3. Component-Specific Spacing

Components like Button, Input, and Card automatically adjust their internal spacing:

```tsx
// Button heights by density and size
// Compact: sm=32px, md=36px, lg=40px
// Medium:  sm=36px, md=44px, lg=52px
// Large:   sm=44px, md=52px, lg=60px
<Button size="md">Click Me</Button>
```

### 4. Using the Spacing Hook

Access spacing values directly:

```tsx
import { useSpacing } from '@/contexts/SpacingContext';

function MyComponent() {
  const { spacing, density, componentSpacing } = useSpacing();
  
  return (
    <View style={{
      padding: spacing[4], // Responsive padding
      borderRadius: componentSpacing.borderRadius,
    }}>
      <Text>Current density: {density}</Text>
    </View>
  );
}
```

### 5. Responsive Values

Use different values for each density:

```tsx
import { useResponsive } from '@/contexts/SpacingContext';

function MyComponent() {
  const iconSize = useResponsive({
    compact: 16,
    medium: 20,
    large: 24,
  });
  
  return <Icon size={iconSize} />;
}
```

## Spacing Scale Reference

The base spacing unit is 4px, with the following scale:

| Scale | Compact | Medium | Large |
|-------|---------|--------|-------|
| 0     | 0px     | 0px    | 0px   |
| 0.5   | 2px     | 2px    | 3px   |
| 1     | 3px     | 4px    | 5px   |
| 2     | 6px     | 8px    | 10px  |
| 3     | 9px     | 12px   | 15px  |
| 4     | 12px    | 16px   | 20px  |
| 5     | 15px    | 20px   | 25px  |
| 6     | 18px    | 24px   | 30px  |
| 8     | 24px    | 32px   | 40px  |
| 10    | 30px    | 40px   | 50px  |
| 12    | 36px    | 48px   | 60px  |
| 16    | 48px    | 64px   | 80px  |

## Typography Scale

Font sizes also adapt to density:

| Size | Compact | Medium | Large |
|------|---------|--------|-------|
| xs   | 10px    | 12px   | 14px  |
| sm   | 12px    | 14px   | 16px  |
| base | 14px    | 16px   | 18px  |
| lg   | 16px    | 18px   | 20px  |
| xl   | 18px    | 20px   | 24px  |
| 2xl  | 20px    | 24px   | 30px  |
| 3xl  | 24px    | 30px   | 36px  |

## Component Presets

### Button Padding
- **Compact**: px=3, py=2
- **Medium**: px=4, py=2.5
- **Large**: px=6, py=3

### Card Padding
- **Compact**: p=3 (9px)
- **Medium**: p=4 (16px)
- **Large**: p=6 (30px)

### Form Gaps
- **Compact**: gap=3 (9px)
- **Medium**: gap=4 (16px)
- **Large**: gap=6 (30px)

### Icon Sizes
- **Compact**: 16px
- **Medium**: 20px
- **Large**: 24px

## User Settings

Users can change density in Settings > App Settings > Display Density:
1. Navigate to Settings
2. Find "App Settings" card
3. Select preferred density
4. The app immediately updates all spacing

## Best Practices

### 1. Always Use Scale Values
```tsx
// ❌ Bad - hardcoded values
<Box style={{ padding: 16 }}>

// ✅ Good - uses spacing scale
<Box p={4}>
```

### 2. Let Components Handle Sizing
```tsx
// ❌ Bad - manual button sizing
<Button style={{ height: 44, paddingHorizontal: 16 }}>

// ✅ Good - size prop handles it
<Button size="md">
```

### 3. Use Semantic Spacing
```tsx
// Section spacing
<VStack spacing={6}> {/* Sections */}
  <VStack spacing={4}> {/* Groups */}
    <VStack spacing={2}> {/* Items */}
```

### 4. Test All Densities
Always test your UI in all three density modes to ensure:
- Content fits properly in compact mode
- Touch targets are adequate in all modes
- Text remains readable
- Layouts don't break

## Migration Guide

### From Fixed Spacing
```tsx
// Before
<View style={{ padding: 16, margin: 8 }}>

// After
<Box p={4} m={2}>
```

### From Fixed Gaps
```tsx
// Before
<View style={{ gap: 12 }}>

// After
<VStack spacing={3}>
```

### From Fixed Font Sizes
```tsx
// Before
<Text style={{ fontSize: 18 }}>

// After
<Text size="lg">
```

## Platform Considerations

### iOS
- Respects iOS Dynamic Type settings
- Safe area insets adjust with density

### Android
- Follows Material Design density principles
- Elevation shadows scale appropriately

### Web
- Responsive to browser zoom levels
- Keyboard accessible at all densities

## Performance

- Spacing values are memoized for performance
- Density changes trigger minimal re-renders
- AsyncStorage persists user preference
- No runtime calculations after initial setup

## Troubleshooting

### Components Not Updating
Ensure components are using the universal design system:
```tsx
// Use universal components
import { Box, Text, Button } from '@/components/universal';
```

### Spacing Looks Wrong
Check if you're mixing systems:
```tsx
// Don't mix hardcoded with scale values
<Box p={4} style={{ margin: 8 }}> // ❌
<Box p={4} m={2}> // ✅
```

### Custom Components
Wrap custom components with spacing support:
```tsx
function MyCustomCard({ children, ...props }) {
  return (
    <Box bgTheme="card" p={4} rounded="lg" {...props}>
      {children}
    </Box>
  );
}
```

## Future Enhancements

1. **Custom Density Profiles**: Create custom spacing scales
2. **Per-Screen Density**: Different densities for different screens
3. **Animation Support**: Smooth transitions between densities
4. **A11y Integration**: Tie to system accessibility settings
5. **Landscape/Portrait**: Different densities for orientations

The spacing theme system ensures your app looks great and functions well across all devices and user preferences, providing a truly adaptive and accessible experience.