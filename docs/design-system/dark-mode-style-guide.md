# Dark Mode Style Guide

## Overview
This guide explains how to properly implement dark mode support across all components in the Expo app using shadcn components and our theme system.

## Core Principles

### 1. **Always Use Theme Colors**
```typescript
// ❌ BAD - Hardcoded colors
<Text style={{ color: '#000000' }}>Hello</Text>
<View style={{ backgroundColor: '#ffffff' }}>

// ✅ GOOD - Theme-aware colors
<Text style={{ color: theme.foreground }}>Hello</Text>
<View style={{ backgroundColor: theme.background }}>
```

### 2. **Import useTheme Hook**
```typescript
import { useTheme } from '@/lib/theme/theme-provider';

export default function MyComponent() {
  const theme = useTheme();
  // Use theme.foreground, theme.background, etc.
}
```

## Theme Color Reference

### Background Colors
- `theme.background` - Main background (white/dark)
- `theme.card` - Card background
- `theme.popover` - Popover/modal background
- `theme.secondary` - Secondary background

### Text Colors
- `theme.foreground` - Primary text color
- `theme.mutedForeground` - Secondary/muted text
- `theme.cardForeground` - Text on cards
- `theme.primaryForeground` - Text on primary color
- `theme.secondaryForeground` - Text on secondary color
- `theme.destructiveForeground` - Text on destructive color

### Interactive Colors
- `theme.primary` - Primary brand color
- `theme.secondary` - Secondary color
- `theme.destructive` - Error/danger color
- `theme.accent` - Accent color
- `theme.muted` - Muted elements

### Border Colors
- `theme.border` - Default border color
- `theme.input` - Input border color
- `theme.ring` - Focus ring color

## Component Examples

### SafeAreaView
```typescript
// Always set background color
<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
```

### Text Elements
```typescript
// Headings
<Text style={{ color: theme.foreground, fontSize: 24, fontWeight: 'bold' }}>
  Dashboard
</Text>

// Muted text
<Text style={{ color: theme.mutedForeground, fontSize: 14 }}>
  Subtitle or description
</Text>
```

### Cards
```typescript
// Card component already handles theme
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle> {/* Automatically themed */}
    <CardDescription>Description</CardDescription> {/* Uses mutedForeground */}
  </CardHeader>
</Card>
```

### Buttons
```typescript
// Button component handles theme automatically
<Button variant="default">
  <Text>Click me</Text> {/* Text color handled by Button */}
</Button>

// For custom button text colors
<Button variant="outline">
  <Text style={{ color: theme.foreground }}>Click me</Text>
</Button>
```

### Input Fields
```typescript
// Input component is now theme-aware
<Input 
  placeholder="Enter text"
  // No need to set colors manually
/>
```

### Custom Components
```typescript
const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <View style={{
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      padding: 16,
      borderRadius: 8,
    }}>
      <Text style={{ color: theme.cardForeground }}>
        Content
      </Text>
    </View>
  );
};
```

## Using ThemedText Component
```typescript
import { ThemedText, Heading, MutedText } from '@/components/themed/ThemedText';

// Basic usage
<ThemedText>Default text</ThemedText>
<ThemedText variant="muted">Secondary text</ThemedText>
<ThemedText variant="primary">Primary colored text</ThemedText>

// Size and weight
<ThemedText size="xl" weight="bold">Large bold text</ThemedText>
<ThemedText size="sm" variant="muted">Small muted text</ThemedText>

// Convenience components
<Heading>Page Title</Heading>
<MutedText>Subtitle or description</MutedText>
```

## Platform-Specific Considerations

### Web
- CSS classes work alongside inline styles
- `className` props are supported
- Document class is updated for dark mode

### Mobile (iOS/Android)
- Only inline styles work
- No `className` support in production
- Theme colors must be applied via style prop

## Common Patterns

### Borders
```typescript
// Light borders that adapt to theme
style={{
  borderBottomWidth: 1,
  borderBottomColor: theme.border,
}}
```

### Shadows (Mobile)
```typescript
// Shadows need to be adjusted for dark mode
style={{
  shadowColor: theme.foreground,
  shadowOpacity: theme.colorScheme === 'dark' ? 0.3 : 0.1,
}}
```

### Conditional Styling
```typescript
const colorScheme = useColorScheme();

style={{
  backgroundColor: colorScheme === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)',
}}
```

## Migration Checklist

When updating a component for dark mode:

1. [ ] Import `useTheme` hook
2. [ ] Replace hardcoded colors:
   - `#000`, `#000000`, `black` → `theme.foreground`
   - `#fff`, `#ffffff`, `white` → `theme.background`
   - `#666`, `#999` → `theme.mutedForeground`
   - `#e5e7eb`, `#f3f4f6` → `theme.muted` or `theme.secondary`
   - Border colors → `theme.border`
3. [ ] Update SafeAreaView backgrounds
4. [ ] Check ScrollView backgrounds
5. [ ] Update any custom styled components
6. [ ] Test in both light and dark modes

## Testing Dark Mode

1. Use the Settings screen toggle
2. Check all text is readable
3. Verify sufficient contrast
4. Ensure interactive elements are visible
5. Test on both platforms (web/mobile)

## Best Practices

1. **Never hardcode colors** - Always use theme values
2. **Test both modes** - Switch between light/dark frequently during development
3. **Consider contrast** - Ensure text is readable in both modes
4. **Use semantic colors** - Use `mutedForeground` for secondary text, not a hardcoded gray
5. **Keep consistency** - Use the same theme patterns across all screens

## Troubleshooting

### Text appears black in dark mode
- Check if you're using `style={{ color: theme.foreground }}`
- Ensure theme provider is properly wrapped around the component

### Background doesn't change
- Set `backgroundColor: theme.background` on SafeAreaView
- Check parent components aren't overriding the background

### Input text not visible
- The Input component should now handle this automatically
- If using TextInput directly, set `style={{ color: theme.foreground }}`

### Custom colors needed
- For special cases, you can still use custom colors
- Consider adding them to the theme if used frequently
- Use opacity for subtle variations: `${theme.primary}20` (20% opacity)