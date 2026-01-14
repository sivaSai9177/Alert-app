# Hover States Enhancement TODO

## Shadcn Standard Patterns

Based on the shadcn components analysis, here are the standard patterns we should follow:

### 1. **Dropdown Menu Items**
- **Hover/Focus**: `bg-accent` and `text-accent-foreground`
- **Disabled**: `opacity-50`
- **Transition**: `transition-colors` (color transitions only)

### 2. **Buttons**
- **Default variant hover**: `bg-primary/90` (90% opacity)
- **Outline variant hover**: `bg-accent text-accent-foreground`
- **Ghost variant hover**: `bg-accent text-accent-foreground`
- **Secondary variant hover**: `bg-secondary/80` (80% opacity)
- **Link variant hover**: `underline`
- **Press state**: `opacity: 0.7`

### 3. **Select/Input**
- **Focus**: `ring-2 ring-ring ring-offset-2` (focus ring)
- **Hover**: Subtle border color change
- **No background changes**

### 4. **Dialog Buttons**
- **Cancel (Ghost)**: `hover:bg-accent hover:text-accent-foreground`
- **Confirm (Primary)**: `hover:bg-primary/90`

## ✅ Components Already Fixed
1. **DropdownMenu** - Now uses `bg-accent` on hover (fixed)
2. **Dialog** - Cancel button uses accent colors (partially fixed)
3. **Select** - Removed transform effects, kept simple
4. **Link** - Using theme colors
5. **Switch** - Using theme-based shadows
6. **Popover** - Has scale animation

## 🔧 Components That Need Fixes

### 1. **Dialog.tsx**
- [ ] Fix the confirm button to use `opacity: 0.9` on hover instead of 0.7 on press
- [ ] Add missing theme/spacing imports for cancel button
- [ ] Ensure both buttons follow shadcn patterns

### 2. **Button.tsx (Universal)**
- [ ] Update hover states to match shadcn patterns
- [ ] Default: hover opacity 0.9
- [ ] Ghost/Outline: hover bg-accent
- [ ] Remove any transform effects

### 3. **Select.tsx**
- [ ] Add focus ring styles
- [ ] Fix TypeScript errors with size props
- [ ] Ensure dropdown items use accent hover

### 4. **Link.tsx**
- [ ] Ensure primary links use opacity hover (not color change)
- [ ] Ghost links should use accent background

### 5. **ColorPicker.tsx**
- [ ] Replace TouchableOpacity with Pressable
- [ ] Add proper hover states to color swatches
- [ ] Use accent color for selected state

### 6. **Drawer.tsx**
- [ ] Replace TouchableOpacity
- [ ] Add hover states to close button
- [ ] Fix overlay color

### 7. **Command.tsx**
- [ ] Replace TouchableOpacity
- [ ] Add accent hover to items
- [ ] Fix overlay color

### 8. **List.tsx**
- [ ] Replace TouchableOpacity
- [ ] Add accent hover to list items
- [ ] Add swipe action hover states

### 9. **ContextMenu.tsx**
- [ ] Replace TouchableOpacity
- [ ] Match dropdown menu hover patterns

### 10. **DatePicker.tsx**
- [ ] Fix overlay color
- [ ] Add hover states to date cells
- [ ] Selected date should use primary color

### 11. **Toast.tsx**
- [ ] Add hover state to close button
- [ ] Use accent for action buttons

## 🎨 Color Values to Use

```typescript
// Hover states
hover: {
  background: theme.accent, // For ghost/outline variants
  text: theme.accentForeground,
  primaryOpacity: 0.9, // For primary buttons
  secondaryOpacity: 0.8, // For secondary buttons
}

// Press states
pressed: {
  opacity: 0.7, // Universal press opacity
}

// Focus states
focus: {
  ring: theme.ring || theme.primary,
  ringOffset: theme.background,
}

// Disabled states
disabled: {
  opacity: 0.5,
  background: theme.muted,
  text: theme.mutedForeground,
}
```

## 📝 Implementation Guidelines

1. **Use Pressable everywhere** - No TouchableOpacity
2. **Consistent transitions** - Use `transition: all 0.2s ease` for web
3. **No transform effects** - Avoid scale/translate on hover (except Popover trigger)
4. **Opacity for primary actions** - Primary buttons use opacity hover
5. **Accent for secondary actions** - Ghost/outline use accent background
6. **Focus rings for inputs** - All form elements need focus rings
7. **Platform-specific styles** - Wrap web-specific styles in Platform.OS checks

## 🚀 Migration Checklist

For each component:
- [ ] Replace TouchableOpacity with Pressable
- [ ] Add proper hover states matching shadcn
- [ ] Add focus states where applicable
- [ ] Test on web with mouse hover
- [ ] Test on mobile with touch
- [ ] Verify TypeScript types
- [ ] Update documentation

## 📊 Progress Tracking

- Total components to fix: 11
- Fixed with proper hover states: 0
- In progress: Dialog.tsx
- Remaining: 10