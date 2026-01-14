# High-Fidelity Design Guide - Healthcare Alert System

## 🎨 Visual Design Language

### Design Philosophy
**"Calm Urgency"** - Convey critical information without inducing panic. Every visual element should help healthcare workers make faster, better decisions under pressure.

## 🎨 Enhanced Color System

### Primary Palette
```scss
// Alert Severity Colors
$emergency-red: #DC2626;      // Cardiac, Critical
$emergency-red-light: #FEE2E2;
$emergency-red-dark: #991B1B;

$urgent-orange: #F59E0B;      // Escalating, Warning  
$urgent-orange-light: #FEF3C7;
$urgent-orange-dark: #D97706;

$active-blue: #3B82F6;        // Acknowledged, Active
$active-blue-light: #DBEAFE;
$active-blue-dark: #2563EB;

$resolved-green: #10B981;     // Completed, Success
$resolved-green-light: #D1FAE5;
$resolved-green-dark: #059669;

// UI Colors
$background-light: #FFFFFF;
$surface-light: #F9FAFB;
$border-light: #E5E7EB;

$background-dark: #111827;
$surface-dark: #1F2937;
$border-dark: #374151;

// Text Colors
$text-primary: #111827;
$text-secondary: #6B7280;
$text-tertiary: #9CA3AF;
$text-inverse: #FFFFFF;
```

### Semantic Colors
```scss
// Role-Based Colors
$operator-purple: #7C3AED;
$nurse-teal: #14B8A6;
$doctor-indigo: #6366F1;
$admin-slate: #64748B;

// Time-Based Indicators
$day-mode-accent: #FBBF24;
$night-mode-accent: #6366F1;
$shift-change: #F59E0B;
```

## 📐 Layout Grid System

### Mobile Grid (375px)
- **Columns**: 4
- **Gutter**: 16px
- **Margins**: 20px

### Tablet Grid (768px)
- **Columns**: 8
- **Gutter**: 24px
- **Margins**: 32px

### Desktop Grid (1440px)
- **Columns**: 12
- **Gutter**: 24px
- **Margins**: 48px

## 🔤 Typography System

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
             'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
```

### Type Scale
```scss
// Display - For critical numbers/timers
.display-large {
  font-size: 57px;
  line-height: 64px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

// Headlines - Screen titles
.headline-1 {
  font-size: 32px;
  line-height: 40px;
  font-weight: 600;
}

.headline-2 {
  font-size: 28px;
  line-height: 36px;
  font-weight: 600;
}

// Body - Main content
.body-large {
  font-size: 18px;
  line-height: 28px;
  font-weight: 400;
}

.body-medium {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
}

// Labels - UI elements
.label-large {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  letter-spacing: 0.01em;
}
```

## 🎯 Component Design Specifications

### Alert Card - High Fidelity
```
╭───────────────────────────────────────╮
│ ● CARDIAC ARREST          ⏱ 0:45     │ <- 20px height, red bg
├───────────────────────────────────────┤
│                                       │
│ Room 302 - West Wing ICU              │ <- 18px, bold
│ John Doe • 68yo • Male • #1234567    │ <- 14px, secondary
│                                       │
│ "Patient unresponsive, beginning CPR" │ <- 16px, italic
│                                       │
│ ├─ Dr. Smith acknowledged (0:30 ago)  │ <- 14px, blue text
│ └─ 2 nurses en route                  │
│                                       │
├───────────────────────────────────────┤
│ [    ACKNOWLEDGE    ] [   DETAILS   ] │ <- 50px height buttons
╰───────────────────────────────────────╯
```

**Visual Details**:
- Card shadow: `0 4px 6px rgba(0,0,0,0.07)`
- Border radius: 12px
- Padding: 20px
- Hover state: Lift 2px, stronger shadow
- Active state: Scale 0.98
- Border: 2px solid (color based on severity)

### Primary Button States
```
Default:
╭─────────────────────────╮
│     CREATE ALERT        │ <- White text on red
╰─────────────────────────╯
Shadow: 0 4px 6px rgba(220,38,38,0.2)

Hover:
╭─────────────────────────╮
│     CREATE ALERT        │ <- Darker red, lift
╰─────────────────────────╯
Transform: translateY(-2px)

Active:
╭─────────────────────────╮
│     CREATE ALERT        │ <- Even darker, pressed
╰─────────────────────────╯
Transform: scale(0.96)

Disabled:
╭─────────────────────────╮
│     CREATE ALERT        │ <- Gray, no shadow
╰─────────────────────────╯
Opacity: 0.5
```

### Input Field Design
```
Label
╭─────────────────────────╮
│ Placeholder text        │
╰─────────────────────────╯
Helper text

Focus state:
╭═════════════════════════╮
│ User input             │ <- Blue border
╰═════════════════════════╯

Error state:
╭═════════════════════════╮
│ Invalid input          │ <- Red border
╰═════════════════════════╯
⚠ Error message in red
```

## 🌓 Dark Mode Adaptations

### Night Shift Theme
- Reduced blue light emissions
- Lower contrast ratios (but still AA compliant)
- Warmer color temperature
- Dimmed emergency colors (still distinguishable)

```scss
// Night Mode Overrides
.night-mode {
  --emergency-red: #EF4444;    // Slightly less harsh
  --urgent-orange: #FB923C;    // Warmer tone
  --active-blue: #60A5FA;      // Reduced intensity
  --background: #0F172A;       // Deep blue-black
  --surface: #1E293B;          // Raised surfaces
  --text-primary: #F1F5F9;     // Soft white
}
```

## 📱 Platform-Specific Adaptations

### iOS Design
- Use SF Symbols for icons
- Respect safe areas
- iOS-style navigation
- Haptic feedback on actions
- Blur effects for modals

### Android Design
- Material Design 3 principles
- Use Material Icons
- FAB for primary actions
- Ripple effects on touch
- Bottom sheets for forms

### Web Design
- Hover states on all interactive elements
- Keyboard navigation indicators
- Responsive to all screen sizes
- Print-friendly alert views
- Right-click context menus

## 🎬 Micro-interactions & Animation

### Animation Principles
- **Purpose**: Every animation has a function
- **Speed**: 200-300ms for most transitions
- **Easing**: ease-out for entries, ease-in for exits
- **Performance**: Use transform and opacity only

### Key Animations

#### Alert Arrival
```css
@keyframes alertSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

#### Urgency Pulse
```css
@keyframes urgentPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
  }
}
```

#### Success Confirmation
```css
@keyframes successCheck {
  0% {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(45deg);
  }
  100% {
    transform: scale(1) rotate(45deg);
    opacity: 1;
  }
}
```

## 🎯 Screen-by-Screen High Fidelity

### 1. Operator Alert Creation
- **Background**: Subtle emergency red gradient
- **Create button**: Pulsing animation, drop shadow
- **Form fields**: Large touch targets, clear labels
- **Quick templates**: Icon + color coding
- **Voice input**: Prominent microphone button

### 2. Healthcare Dashboard
- **Alert cards**: Elevation hierarchy by urgency
- **Timers**: Large, countdown animation
- **Status badges**: Color + icon + text
- **Swipe actions**: Visual feedback trails
- **Pull to refresh**: Custom hospital logo animation

### 3. Alert Detail
- **Hero section**: Alert type with dramatic color
- **Patient info**: Card-based layout
- **Action buttons**: Fixed bottom position
- **Map integration**: Inline with directions
- **History timeline**: Visual progression

### 4. Analytics Dashboard
- **Data viz**: Chart.js with custom theme
- **Metrics cards**: Real-time number animations
- **Filters**: Chip-based selection
- **Export options**: Clear file type icons
- **Date ranges**: Calendar picker

## 🎨 Design System Components

### Elevation System
```scss
$elevation-1: 0 1px 3px rgba(0,0,0,0.12);
$elevation-2: 0 4px 6px rgba(0,0,0,0.07);
$elevation-3: 0 10px 20px rgba(0,0,0,0.1);
$elevation-4: 0 15px 25px rgba(0,0,0,0.12);
```

### Border Radius Scale
```scss
$radius-sm: 4px;   // Buttons, inputs
$radius-md: 8px;   // Cards, modals  
$radius-lg: 12px;  // Containers
$radius-xl: 16px;  // Sheets, large modals
$radius-full: 9999px; // Pills, badges
```

### Spacing Tokens
```scss
$space-xs: 4px;
$space-sm: 8px;
$space-md: 16px;
$space-lg: 24px;
$space-xl: 32px;
$space-2xl: 48px;
$space-3xl: 64px;
```

## 📸 Asset Requirements

### Icons
- Format: SVG (preferred) or PNG @3x
- Style: Outlined, 24px grid
- Stroke: 2px consistent
- Emergency icons: Filled style

### Images
- Profile photos: 1:1 ratio, 200px minimum
- Hospital logo: SVG, light/dark variants
- Backgrounds: Blur for privacy
- Loading states: Skeleton screens

### Export Specifications
- iOS: @1x, @2x, @3x
- Android: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
- Web: SVG or @2x PNG with srcset

## 🚀 Implementation Notes

### Performance Considerations
- Lazy load images below fold
- Use CSS containment for alert lists
- Virtualize long lists (>50 items)
- Optimize animations for 60fps
- Preload critical fonts

### Accessibility Enhancements
- Focus visible outlines (not just color)
- ARIA labels for all icons
- Semantic HTML structure
- Skip navigation links
- Reduced motion options

---

*This guide ensures our life-saving tool is not just functional, but a joy to use even in the most stressful moments.*