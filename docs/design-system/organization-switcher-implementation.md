# Organization/Team Switcher Implementation

## Overview
The TeamSwitcher07 component has been updated to match the exact styling and behavior of the shadcn/ui team-switcher component, functioning as an organization switcher.

## Key Features

### 1. Component Structure
- Uses `Sidebar07Menu` and `Sidebar07MenuItem` wrappers
- Utilizes `Sidebar07MenuButton` with size="lg" for proper height
- Implements dropdown menu with proper positioning and styling

### 2. Visual Design
- **Logo Display**: 32x32px square with rounded corners (rounded-lg)
- **Background**: Uses `bgTheme="primary"` for brand color
- **Text Layout**: Organization name and plan in vertical stack
- **Icon**: Chevron-expand icon for dropdown indicator

### 3. Dropdown Menu Features
- **Label**: "Organizations" header in dropdown
- **Items**: Each organization with logo/initial, name, and keyboard shortcut
- **Borders**: Thin borders on logo containers (borderWidth: StyleSheet.hairlineWidth)
- **Add Button**: "Add organization" option with plus icon
- **Keyboard Shortcuts**: Shows ⌘1, ⌘2, etc. on web only

### 4. State Management
- Integrates with Zustand store for persistent selection
- Supports multiple organizations/teams
- Fallback to first organization if none selected

### 5. Responsive Behavior
- **Collapsed State**: Shows only logo in icon-only mode
- **Tooltip**: Displays organization name on hover when collapsed
- **Mobile**: Full dropdown functionality with touch interactions

## Usage Example

```tsx
<TeamSwitcher07
  teams={[
    {
      name: 'Acme Inc',
      plan: 'Enterprise',
      logo: ({ size, color }) => (
        <Ionicons name="business" size={size} color={color} />
      ),
    },
    {
      name: 'Acme Corp.',
      plan: 'Startup',
      logo: ({ size, color }) => (
        <Ionicons name="rocket" size={size} color={color} />
      ),
    },
    {
      name: 'My Organization',
      plan: 'Free',
      // No logo - will show initial
    },
  ]}
/>
```

## Styling Details

### Colors
- Logo background: `theme.primary`
- Logo text/icon: `theme.primaryForeground`
- Organization name: Default text color
- Plan text: `theme.mutedForeground`
- Dropdown borders: `theme.border`

### Dimensions
- Button height: 48px (size="lg")
- Logo size: 32x32px
- Logo icon size: 16px
- Dropdown item logo: 24x24px
- Dropdown item icon: 14px
- Minimum dropdown width: 224px (min-w-56)

### Typography
- Organization name: size="sm", weight="medium"
- Plan text: size="xs", colorTheme="mutedForeground"
- Add button text: weight="medium"

## Implementation Notes

1. **Logo Component**: Accepts a function component that receives size and color props
2. **Fallback**: Shows first letter of organization name if no logo provided
3. **Line Height**: Fixed line heights for consistent text alignment
4. **Border Styling**: Uses StyleSheet.hairlineWidth for pixel-perfect borders
5. **Padding**: Consistent padding using spacing system

## Comparison with shadcn/ui

The implementation matches the shadcn/ui team-switcher with these adaptations:
- React Native components instead of HTML elements
- Ionicons instead of Lucide icons
- Platform-specific keyboard shortcut display
- Touch-optimized interactions for mobile
- StyleSheet.hairlineWidth for consistent borders across platforms

## Future Enhancements

1. Add team/organization creation flow
2. Implement team switching API integration
3. Add team member count display
4. Support for team avatars/custom logos
5. Quick team search for users with many organizations