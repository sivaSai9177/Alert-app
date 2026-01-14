# Universal Dialog and DropdownMenu Usage Guide

This guide demonstrates how to use the new universal Dialog and DropdownMenu components that work across iOS, Android, and Web platforms.

## Dialog Component

The Dialog component provides a modal overlay for displaying content that requires user attention or interaction.

### Basic Usage

```tsx
import { useState } from 'react';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  Button 
} from '@/components/universal';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a description of what the dialog is about.
          </DialogDescription>
        </DialogHeader>
        
        <Text>Dialog content goes here...</Text>
        
        <DialogFooter>
          <Button variant="ghost" onPress={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onPress={() => setOpen(false)}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Alert Dialog

For simple confirmation dialogs, use the AlertDialog component:

```tsx
import { useState } from 'react';
import { AlertDialog, Button } from '@/components/universal';

function DeleteButton() {
  const [showAlert, setShowAlert] = useState(false);

  const handleDelete = () => {
    console.log('Item deleted');
    // Perform delete action
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onPress={() => setShowAlert(true)}
      >
        Delete Item
      </Button>
      
      <AlertDialog
        open={showAlert}
        onOpenChange={setShowAlert}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the item."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        destructive
      />
    </>
  );
}
```

## DropdownMenu Component

The DropdownMenu component provides a floating menu that appears when triggered, perfect for actions and options.

### Basic Usage

```tsx
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  Button 
} from '@/components/universal';
import { Ionicons } from '@expo/vector-icons';

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ionicons name="ellipsis-vertical" size={20} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          icon={<Ionicons name="person-outline" size={16} />}
          onPress={() => console.log('Profile')}
        >
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          icon={<Ionicons name="settings-outline" size={16} />}
          onPress={() => console.log('Settings')}
          shortcut="⌘S"
        >
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          icon={<Ionicons name="log-out-outline" size={16} />}
          onPress={() => console.log('Logout')}
          destructive
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Checkbox Items

```tsx
import { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  Button 
} from '@/components/universal';

function ViewOptions() {
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View Options</Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={showGrid}
          onCheckedChange={setShowGrid}
        >
          Show Grid
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={showLabels}
          onCheckedChange={setShowLabels}
        >
          Show Labels
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Radio Group

```tsx
import { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  Button 
} from '@/components/universal';

function SortMenu() {
  const [sortBy, setSortBy] = useState('name');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Sort By</Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent>
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
          <DropdownMenuRadioItem value="name">
            Name
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date">
            Date
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="size">
            Size
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Features

### Dialog Features
- **Modal Overlay**: Blocks interaction with the rest of the app
- **Keyboard Support**: Proper keyboard handling on all platforms
- **Animation**: Smooth fade and scale animations
- **Responsive**: Adapts to screen size
- **Close Button**: Optional close button in the header
- **Scroll Support**: Content scrolls when needed
- **Theme Support**: Automatically uses the current theme colors

### DropdownMenu Features
- **Position Aware**: Automatically positions to stay within screen bounds
- **Alignment Options**: Start, center, or end alignment
- **Icons**: Support for icons in menu items
- **Shortcuts**: Display keyboard shortcuts
- **Separators**: Visual separation between groups
- **Checkbox Items**: Toggle multiple options
- **Radio Groups**: Select one option from many
- **Destructive Items**: Highlight dangerous actions
- **Theme Support**: Automatically uses the current theme colors

## Accessibility

Both components include proper accessibility features:
- Modal announcements for screen readers
- Keyboard navigation support
- Touch-friendly hit areas
- Proper contrast ratios with theme colors

## Performance

- Lazy rendering of modal content
- Efficient animations using native driver
- Minimal re-renders
- Automatic cleanup on unmount

## Platform Differences

While the components work across all platforms, there are some subtle differences:

### iOS
- Uses native iOS modal presentation
- Respects safe areas
- Smooth spring animations

### Android
- Material Design-inspired animations
- Hardware back button closes modals
- Elevation shadows

### Web
- CSS-based animations
- Keyboard shortcuts work
- Mouse hover states

## Migration from Shadcn Components

If you're migrating from the web-only shadcn components:

1. Replace imports from `@/components/shadcn/ui/dialog` with `@/components/universal`
2. Replace imports from `@/components/shadcn/ui/dropdown-menu` with `@/components/universal`
3. Remove any web-specific styling or props
4. Test on all target platforms

The API is designed to be as similar as possible to the original shadcn components, making migration straightforward.