# Universal Components Fix Tasks - January 2025

## 🎯 Overview

This document outlines specific fixes needed based on the Universal Components Audit 2025. All tasks are HIGH PRIORITY to achieve full shadcn compliance.

## 📋 Task List by Priority

### 🔴 Priority 1: Interactive Element Fixes (TouchableOpacity → Pressable)

#### TASK-FIX-001: Dialog Component
**File**: `/components/universal/Dialog.tsx`
**Issues**:
- Line 199: Close button uses TouchableOpacity
- Line 346: Footer action buttons use TouchableOpacity

**Fix Required**:
```typescript
// Replace all TouchableOpacity with Pressable
import { Pressable } from 'react-native';

// Add proper web handlers
const webHandlers = Platform.OS === 'web' ? {
  onHoverIn: () => setIsHovered(true),
  onHoverOut: () => setIsHovered(false),
} : {};
```

**Best Practices**:
- Use Pressable for all interactive elements
- Add hover states for web with onHoverIn/onHoverOut
- Include visual feedback (opacity or background change)
- Maintain accessibility with proper roles

---

### 🟡 Priority 2: Theme Access Pattern Fixes

#### TASK-FIX-002: Tooltip Component
**File**: `/components/universal/Tooltip.tsx`
**Issues**:
- Lines 207-208: Uses `theme.popover || theme.card` fallback

**Fix Required**:
```typescript
// Remove fallback patterns
// Before:
backgroundColor: theme.popover || theme.card

// After:
backgroundColor: theme.popover
```

**Best Practices**:
- Direct theme property access only
- No fallback patterns
- Trust that theme properties exist

#### TASK-FIX-003: DropdownMenu Component
**File**: `/components/universal/DropdownMenu.tsx`
**Issues**:
- Line 243: Uses `theme?.popover || theme?.card || '#ffffff'`

**Fix Required**:
```typescript
// Remove optional chaining and fallbacks
// Before:
backgroundColor: theme?.popover || theme?.card || '#ffffff'

// After:
backgroundColor: theme.popover
```

#### TASK-FIX-004: Popover Component
**File**: `/components/universal/Popover.tsx`
**Issues**:
- Lines 223, 232: Uses `theme.popover || theme.card` fallback

**Fix Required**:
```typescript
// Same as Tooltip - remove fallbacks
backgroundColor: theme.popover
```

#### TASK-FIX-005: Switch Component
**File**: `/components/universal/Switch.tsx`
**Issues**:
- Complex Platform.select patterns

**Fix Required**:
```typescript
// Simplify Platform.select usage
// Consider extracting platform-specific styles to constants
const switchStyles = Platform.select({
  web: { /* web styles */ },
  default: { /* native styles */ }
});
```

---

### 🟢 Priority 3: Loading States Addition

#### TASK-FIX-006: Overlay Components Loading States
**Components**: Dialog, Popover, Tooltip, Select, DatePicker, FilePicker, Toast, Command, Drawer

**Add Loading States**:
```typescript
interface ComponentProps {
  isLoading?: boolean;
  // ... other props
}

// In component render:
{isLoading ? (
  <ActivityIndicator size="small" color={theme.primary} />
) : (
  // Regular content
)}
```

---

## 🛠️ Implementation Guidelines

### General Best Practices

1. **Theme Access**:
   ```typescript
   // ✅ CORRECT
   const theme = useTheme();
   backgroundColor: theme.primary
   
   // ❌ WRONG
   backgroundColor: theme?.primary || '#default'
   backgroundColor: theme.colors.primary
   ```

2. **Interactive Elements**:
   ```typescript
   // ✅ CORRECT - Pressable with web support
   <Pressable
     onPress={handlePress}
     onHoverIn={() => setHovered(true)}
     onHoverOut={() => setHovered(false)}
     style={({ pressed }) => ({
       opacity: pressed ? 0.8 : 1,
       backgroundColor: hovered ? theme.accent : 'transparent'
     })}
   >
   
   // ❌ WRONG - TouchableOpacity
   <TouchableOpacity onPress={handlePress}>
   ```

3. **Visual Feedback States**:
   - Hover: 10% opacity background (web only)
   - Pressed: 20% opacity background
   - Disabled: 50% opacity
   - Focus: Border or outline
   - Loading: ActivityIndicator

4. **Platform-Specific Styles**:
   ```typescript
   const styles = {
     ...commonStyles,
     ...(Platform.OS === 'web' && {
       cursor: 'pointer',
       transition: 'all 0.2s ease',
       userSelect: 'none',
     }),
   };
   ```

5. **TypeScript Safety**:
   ```typescript
   // Use proper types, avoid 'as any'
   interface WebStyles {
     cursor?: string;
     transition?: string;
     userSelect?: string;
   }
   ```

---

## 📝 Checklist for Each Fix

- [ ] Replace TouchableOpacity with Pressable
- [ ] Add hover states for web
- [ ] Remove theme fallback patterns
- [ ] Add loading states where missing
- [ ] Test on all platforms (iOS, Android, Web)
- [ ] Verify with all 5 themes
- [ ] Update component documentation
- [ ] Run TypeScript check

---

## 🧪 Testing Requirements

1. **Platform Testing**:
   - iOS Simulator
   - Android Emulator
   - Web browsers (Chrome, Safari, Firefox)

2. **Theme Testing**:
   - All 5 themes (default, bubblegum, ocean, forest, sunset)
   - Light and dark modes
   - Theme switching runtime

3. **Interaction Testing**:
   - Hover states (web)
   - Press states (all platforms)
   - Keyboard navigation
   - Screen reader compatibility

---

## 📊 Success Metrics

- All components use Pressable (0 TouchableOpacity)
- No theme fallback patterns (0 || operators)
- All overlay components have loading states
- 100% TypeScript compliance
- All tests passing

---

*Start with Priority 1 fixes as they impact user interaction directly.*