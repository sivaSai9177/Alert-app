# Migrating to the Universal Design System

This guide helps you migrate existing screens and components to use the new universal design system.

## Quick Reference

### Component Mappings

| Old Component | New Component | Example |
|--------------|---------------|---------|
| `View` | `Box` | `<Box p={4} bgTheme="background">` |
| `Text` | `Text` | `<Text size="lg" colorTheme="foreground">` |
| `SafeAreaView` + `ScrollView` | `Container` | `<Container scroll safe>` |
| `View` with `flexDirection: 'row'` | `HStack` | `<HStack spacing={4}>` |
| `View` with `flexDirection: 'column'` | `VStack` | `<VStack spacing={4}>` |
| Custom Button | `Button` | `<Button variant="solid" size="md">` |
| `TextInput` | `Input` | `<Input label="Email" error={error}>` |

### Style Props Mapping

| Old Style | New Prop | Example |
|-----------|----------|---------|
| `style={{ padding: 16 }}` | `p={4}` | 16px = spacing[4] |
| `style={{ paddingHorizontal: 20 }}` | `px={5}` | 20px = spacing[5] |
| `style={{ margin: 8 }}` | `m={2}` | 8px = spacing[2] |
| `style={{ backgroundColor: theme.background }}` | `bgTheme="background"` | |
| `style={{ color: theme.foreground }}` | `colorTheme="foreground"` | |
| `style={{ borderRadius: 8 }}` | `rounded="lg"` | |
| `style={{ flex: 1 }}` | `flex={1}` | |
| `style={{ gap: 12 }}` | `spacing={3}` on Stack | |

## Migration Examples

### 1. Basic Screen Migration

**Before:**
```tsx
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';

export default function Screen() {
  const theme = useTheme();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.foreground }}>
            Title
          </Text>
          <Text style={{ fontSize: 16, color: theme.mutedForeground, marginTop: 8 }}>
            Subtitle
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

**After:**
```tsx
import { Container, VStack, Heading1, Text } from '@/components/universal';

export default function Screen() {
  return (
    <Container scroll>
      <VStack p={4} spacing={2}>
        <Heading1>Title</Heading1>
        <Text colorTheme="mutedForeground">Subtitle</Text>
      </VStack>
    </Container>
  );
}
```

### 2. Card Component Migration

**Before:**
```tsx
<View style={{
  backgroundColor: theme.card,
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
}}>
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
    <Avatar />
    <View style={{ marginLeft: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: theme.foreground }}>
        John Doe
      </Text>
      <Text style={{ fontSize: 14, color: theme.mutedForeground }}>
        2 hours ago
      </Text>
    </View>
  </View>
  <Text style={{ fontSize: 16, color: theme.foreground }}>
    Card content goes here
  </Text>
</View>
```

**After:**
```tsx
<Box bgTheme="card" rounded="xl" p={4} shadow="md">
  <HStack alignItems="center" mb={3} spacing={3}>
    <Avatar />
    <VStack>
      <Text weight="semibold">John Doe</Text>
      <Caption>2 hours ago</Caption>
    </VStack>
  </HStack>
  <Paragraph>Card content goes here</Paragraph>
</Box>
```

### 3. Form Migration

**Before:**
```tsx
<View style={{ marginBottom: 16 }}>
  <Text style={{ fontSize: 14, fontWeight: '500', color: theme.foreground, marginBottom: 8 }}>
    Email
  </Text>
  <TextInput
    style={{
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.foreground,
    }}
    placeholder="Enter email"
    placeholderTextColor={theme.mutedForeground}
  />
  {error && (
    <Text style={{ fontSize: 12, color: theme.destructive, marginTop: 4 }}>
      {error}
    </Text>
  )}
</View>
```

**After:**
```tsx
<Input
  label="Email"
  placeholder="Enter email"
  error={error}
  mb={4}
/>
```

### 4. Button Migration

**Before:**
```tsx
<TouchableOpacity
  style={{
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    opacity: disabled ? 0.5 : 1,
  }}
  disabled={disabled}
  onPress={handlePress}
>
  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
    Submit
  </Text>
</TouchableOpacity>
```

**After:**
```tsx
<Button
  onPress={handlePress}
  isDisabled={disabled}
  size="md"
>
  Submit
</Button>
```

## Step-by-Step Migration Process

1. **Import Universal Components**
   ```tsx
   import { 
     Container, Box, Text, VStack, HStack, 
     Button, Input, Heading1, Paragraph, Caption 
   } from '@/components/universal';
   ```

2. **Replace Container Components**
   - `SafeAreaView` + `ScrollView` → `Container`
   - Add `scroll` prop if content is scrollable
   - Add `safe` prop for safe area support

3. **Replace Layout Components**
   - `View` → `Box`
   - `View` with `flexDirection: 'row'` → `HStack`
   - `View` with `flexDirection: 'column'` → `VStack`

4. **Update Spacing**
   - Convert pixel values to spacing scale
   - Use spacing props: `p`, `px`, `py`, `m`, `mx`, `my`, etc.
   - Use `spacing` prop on Stack components for gaps

5. **Update Typography**
   - Replace `Text` with design system `Text`
   - Use semantic components: `Heading1-6`, `Paragraph`, `Caption`, `Label`
   - Apply `size`, `weight`, `colorTheme` props

6. **Update Colors**
   - Replace hardcoded colors with theme colors
   - Use `colorTheme` for text colors
   - Use `bgTheme` for background colors
   - Use `borderTheme` for border colors

7. **Update Interactive Elements**
   - Replace custom buttons with `Button` component
   - Replace `TextInput` with `Input` component
   - Use built-in states: `isLoading`, `isDisabled`

## Common Patterns

### Centered Content
```tsx
<Box flex={1} justifyContent="center" alignItems="center">
  <Text>Centered</Text>
</Box>
```

### Page Header
```tsx
<Box px={4} py={3} borderBottomWidth={1} borderTheme="border">
  <Heading1>Page Title</Heading1>
</Box>
```

### List Item
```tsx
<HStack p={4} spacing={3} alignItems="center">
  <Icon />
  <VStack flex={1}>
    <Text weight="medium">Title</Text>
    <Caption>Description</Caption>
  </VStack>
  <ChevronRight />
</HStack>
```

### Form Section
```tsx
<VStack spacing={4} p={4}>
  <Heading3>Account Information</Heading3>
  <Input label="Username" placeholder="Enter username" />
  <Input label="Email" placeholder="Enter email" type="email" />
  <Button fullWidth>Save Changes</Button>
</VStack>
```

## Testing Your Migration

1. **Visual Testing**
   - Check appearance in both light and dark modes
   - Verify spacing and alignment
   - Ensure shadows and borders render correctly

2. **Platform Testing**
   - Test on iOS simulator
   - Test on Android emulator
   - Test on web browser

3. **Interaction Testing**
   - Verify touch targets are appropriate
   - Check loading and disabled states
   - Ensure keyboard behavior is correct

## Troubleshooting

### Issue: Styles not applying
**Solution:** Ensure you're using design system props, not style objects

### Issue: Spacing looks different
**Solution:** Use the spacing scale consistently (multiples of 4)

### Issue: Colors not changing with theme
**Solution:** Use `colorTheme` and `bgTheme` props instead of hardcoded colors

### Issue: Layout breaking
**Solution:** Use Stack components with proper spacing instead of margins

## Benefits After Migration

1. **Consistency**: All spacing, colors, and typography follow the design system
2. **Maintainability**: Less code, more readable
3. **Theme Support**: Automatic dark mode support
4. **Type Safety**: Full TypeScript support with autocomplete
5. **Performance**: Optimized components with minimal re-renders
6. **Cross-Platform**: Works identically on all platforms