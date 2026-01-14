# Sidebar-07 Implementation Guide

## Overview
This guide provides a complete implementation of the shadcn/ui sidebar-07 pattern converted to a universal React Native component that works seamlessly across iOS, Android, and Web platforms.

## Component Architecture

### Core Components
1. **Sidebar07Provider** - Context provider for sidebar state management
2. **Sidebar07** - Main sidebar container with collapsible behavior
3. **Sidebar07Inset** - Main content area that adjusts based on sidebar state
4. **Sidebar07Rail** - Toggle button for expanding/collapsing sidebar
5. **NavMain07** - Main navigation menu with collapsible groups
6. **NavProjects07** - Projects section with action menus
7. **NavUser07** - User profile section with dropdown
8. **TeamSwitcher07** - Team/workspace switcher

## Styling System

### Dimensions & Spacing
```typescript
// Core dimensions
const SIDEBAR_WIDTH = 256; // 16rem - Expanded width
const SIDEBAR_WIDTH_ICON = 48; // 3rem - Collapsed width
const SIDEBAR_WIDTH_MOBILE = 288; // 18rem - Mobile drawer width

// Component heights
const MENU_BUTTON_HEIGHT = 32; // Standard menu items
const MENU_BUTTON_HEIGHT_LG = 48; // Large menu items (user, team)
const HEADER_HEIGHT = 64; // Header height
const HEADER_HEIGHT_COLLAPSED = 48; // Header when sidebar collapsed

// Avatar and icon sizes
const AVATAR_SIZE = 32; // 8 units - h-8 w-8
const TEAM_LOGO_SIZE = 32; // size-8
const ICON_SIZE = 16; // size-4
const ICON_SIZE_SM = 14; // size-3.5
```

### Color System
```typescript
// Theme colors used
theme.background // Main background
theme.card // Sidebar background
theme.border // Border colors
theme.accent // Hover/active states
theme.accentForeground // Active text
theme.foreground // Primary text
theme.mutedForeground // Secondary text
theme.primary // Brand color
theme.primaryForeground // Text on brand color
```

### Transitions
- Width transitions: `200ms ease`
- Transform transitions: `200ms` (chevron rotation)
- Layout animations: `LayoutAnimation.Presets.easeInEaseOut`

## State Management

### Zustand Store Structure
```typescript
interface SidebarStore {
  // Core state
  isOpen: boolean;
  isMobileOpen: boolean;
  activeItem: string | null;
  expandedGroups: string[];
  activeTeam: string | null;
  
  // Actions
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setActiveItem: (item: string | null) => void;
  toggleGroup: (groupId: string) => void;
  setActiveTeam: (teamId: string) => void;
  resetGroups: () => void;
}
```

## Component Implementation Details

### 1. SidebarMenuButton Behavior
- **Default State**: Transparent background, standard text color
- **Hover State**: `theme.accent` background (web only)
- **Pressed State**: `theme.accent` background with opacity
- **Active State**: `theme.accent` background, `theme.accentForeground` text
- **Collapsed State**: 32x32px square, centered icon, no text

### 2. Collapsible Groups (NavMain)
- Uses Collapsible component for smooth expand/collapse
- ChevronRight icon rotates 90deg when expanded
- Sub-items indented by 36px (spacing[9])
- Active tracking for both parent and child items

### 3. Dropdown Menus
- **Position**: `side="right"` on desktop, `side="bottom"` on mobile
- **Width**: Minimum 224px (min-w-56)
- **Trigger**: Shows chevron-up/down icon
- **Content**: Includes groups, separators, and icons

### 4. NavProjects07 Component
- **Structure**: 
  ```tsx
  <SidebarGroup>
    <SidebarGroupLabel>Projects</SidebarGroupLabel>
    <SidebarGroupContent>
      {projects.map(project => (
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Icon name={project.icon} />
            <span>{project.name}</span>
          </SidebarMenuButton>
          <SidebarMenuAction>
            <DropdownMenu>...</DropdownMenu>
          </SidebarMenuAction>
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem>
        <SidebarMenuButton className="text-sidebar-foreground/70">
          <Icon name="ellipsis-horizontal" />
          <span>More</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarGroupContent>
  </SidebarGroup>
  ```
- **Hover State Management**:
  ```tsx
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  
  onMouseEnter={() => setHoveredProjectId(project.name)}
  onMouseLeave={() => setHoveredProjectId(null)}
  ```
- **Visibility**: Returns `null` when `isOpen === false`
- **Action Menu Items**: Folder, Share (with separator), Trash

### 5. SidebarMenuAction (Projects)
- Hidden by default, shows on hover (web)
- Always visible on mobile
- Positioned absolutely on the right
- 20x20px touch target

### 5. NavProjects07 Implementation
- **Mouse Event Handling**: Uses onMouseEnter/onMouseLeave for web hover states
- **Hidden When Collapsed**: Entire projects section hidden when sidebar is collapsed
- **Hover Actions**: Dropdown menu appears on hover (web only)
- **More Button**: Additional "More" button at the bottom to add new projects
- **Platform-Specific Behavior**:
  - Web: Actions appear on hover with mouse events
  - Mobile: Actions always visible for touch interaction
- **Layout**: Vertical stack with consistent spacing
- **Action Menu**: Includes Folder, Share, Trash actions with separators

### 6. Mobile Behavior
- Uses Drawer component instead of fixed sidebar
- Swipe to close enabled
- Backdrop click to close
- Full height drawer from left

## Icon Mapping (Lucide to Ionicons)
```typescript
// Navigation icons
'square-terminal' -> 'terminal'
'bot' -> 'hardware-chip-outline'
'book-open' -> 'book-outline'
'settings-2' -> 'settings-outline'

// Project icons
'frame' -> 'albums-outline'
'pie-chart' -> 'pie-chart-outline'
'map' -> 'map-outline'

// Action icons
'chevron-right' -> 'chevron-forward'
'chevrons-up-down' -> 'chevron-expand'
'more-horizontal' -> 'ellipsis-horizontal'
'folder' -> 'folder-outline'
'forward' -> 'share-outline'
'trash-2' -> 'trash-outline'
'plus' -> 'add'

// User menu icons
'sparkles' -> 'sparkles-outline'
'badge-check' -> 'checkmark-circle-outline'
'credit-card' -> 'card-outline'
'bell' -> 'notifications-outline'
'log-out' -> 'log-out-outline'
```

## Implementation Checklist

### Core Features
- [x] Collapsible sidebar with icon-only mode
- [x] Smooth width transitions
- [x] SidebarRail for toggle control
- [x] Persistent state with Zustand
- [x] Mobile drawer support
- [x] Keyboard shortcuts (Cmd/Ctrl + B)

### Navigation Features
- [x] Collapsible menu groups
- [x] Active state tracking
- [x] Sub-menu items with indentation
- [x] Tooltips in collapsed state
- [x] Breadcrumb navigation in header

### Interactive Elements
- [x] Team switcher with dropdown
- [x] User profile with dropdown menu
- [x] NavProjects07 with hover actions
  - [x] Mouse event handling for web
  - [x] Hidden when collapsed behavior
  - [x] More button at the bottom
  - [x] Platform-specific hover behavior
- [x] Project actions (hover menu)
- [x] Loading states with skeleton
- [x] Error boundaries

### Accessibility
- [x] Keyboard navigation support
- [x] ARIA labels for screen readers
- [x] Focus management
- [x] Touch targets (minimum 44px on mobile)

### Platform-Specific
- [x] Web: Hover states, keyboard shortcuts
- [x] Mobile: Drawer, swipe gestures
- [x] Responsive breakpoints
- [x] Platform-specific styling

## Usage Example

```tsx
import {
  Sidebar07Provider,
  Sidebar07,
  Sidebar07Header,
  Sidebar07Content,
  Sidebar07Footer,
  Sidebar07Rail,
  Sidebar07Inset,
  Sidebar07Trigger,
  NavMain07,
  NavProjects07,
  NavUser07,
  TeamSwitcher07,
} from '@/components/universal/Sidebar07';

export default function Layout() {
  const navMainItems = [
    {
      title: "Playground",
      url: "/(home)",
      icon: "terminal" as const,
      isActive: true,
      items: [
        { title: "History", url: "/(home)/history" },
        { title: "Starred", url: "/(home)/starred" },
        { title: "Settings", url: "/(home)/settings" },
      ],
    },
    // ... more items
  ];

  const projects = [
    {
      name: "Design Engineering",
      url: "/(home)/project/design",
      icon: "albums-outline" as const,
    },
    // ... more projects
  ];

  const teams = [
    {
      name: "Acme Inc",
      logo: () => <Text>A</Text>,
      plan: "Enterprise",
    },
    // ... more teams
  ];

  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://example.com/avatar.jpg",
  };

  return (
    <Sidebar07Provider>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Sidebar07 collapsible="icon">
          <Sidebar07Header>
            <TeamSwitcher07 teams={teams} />
          </Sidebar07Header>
          <Sidebar07Content>
            <NavMain07 items={navMainItems} />
            <NavProjects07 projects={projects} />
          </Sidebar07Content>
          <Sidebar07Footer>
            <NavUser07 user={user} />
          </Sidebar07Footer>
          <Sidebar07Rail />
        </Sidebar07>
        <Sidebar07Inset>
          <View style={{ flex: 1 }}>
            <View style={headerStyles}>
              <Sidebar07Trigger />
              <Separator orientation="vertical" />
              <Breadcrumb>
                {/* Breadcrumb content */}
              </Breadcrumb>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {/* Page content */}
            </ScrollView>
          </View>
        </Sidebar07Inset>
      </View>
    </Sidebar07Provider>
  );
}
```

## Best Practices

1. **State Management**
   - Use Zustand for global sidebar state
   - Track active routes with pathname
   - Persist collapsed state and expanded groups

2. **Performance**
   - Use LayoutAnimation for smooth transitions
   - Memoize heavy computations
   - Lazy load dropdown content

3. **Accessibility**
   - Provide meaningful labels
   - Ensure keyboard navigation works
   - Test with screen readers

4. **Responsive Design**
   - Test on various screen sizes
   - Ensure touch targets are adequate
   - Handle orientation changes

## Troubleshooting

### Common Issues

1. **Sidebar not animating smoothly**
   - Ensure LayoutAnimation is enabled on Android
   - Check transition timing values
   - Verify no conflicting animations

2. **Active state not updating**
   - Check pathname matching logic
   - Ensure Zustand store is properly connected
   - Verify route structure

3. **Mobile drawer not opening**
   - Check Drawer component implementation
   - Verify gesture handlers are not conflicting
   - Ensure proper z-index stacking

4. **Icons not showing**
   - Verify Ionicons import
   - Check icon name mapping
   - Ensure vector icons are properly linked

## Next Steps

1. Add more navigation sections as needed
2. Implement search functionality
3. Add notification badges
4. Create custom themes
5. Add analytics tracking
6. Implement deep linking support