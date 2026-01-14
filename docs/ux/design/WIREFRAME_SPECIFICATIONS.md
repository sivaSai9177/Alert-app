# Wireframe Specifications - Healthcare Alert System

## 🎨 Design Principles

1. **Speed First**: Every interaction optimized for speed
2. **Clarity Under Stress**: Information hierarchy for panic situations  
3. **One-Handed Operation**: All critical actions accessible with thumb
4. **Progressive Disclosure**: Show only what's needed when needed
5. **Fail-Safe Design**: Prevent accidental actions, enable quick recovery

## 📱 Screen Specifications

### 1. Login Screen
**Purpose**: Quick, secure access to system  
**Target Time**: <5 seconds to dashboard

#### Layout
```
┌─────────────────────────┐
│      Hospital Logo      │
│                         │
│  ┌───────────────────┐  │
│  │ Email/Username    │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Password          │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   LOGIN (Large)   │  │
│  └───────────────────┘  │
│                         │
│  [ ] Remember me        │
│                         │
│  ──────── OR ────────   │
│                         │
│  ┌───────────────────┐  │
│  │ Sign in with Google│  │
│  └───────────────────┘  │
└─────────────────────────┘
```

#### Specifications
- **Input fields**: 60px height, large text (18px)
- **Login button**: 80px height, high contrast
- **Auto-focus**: Email field on load
- **Keyboard**: Email keyboard for username
- **Remember me**: Default checked
- **Error states**: Inline, non-blocking

---

### 2. Operator Dashboard
**Purpose**: Create alerts quickly and accurately  
**Target**: 3 taps to send alert

#### Layout
```
┌─────────────────────────┐
│ ⚡ EMERGENCY OPERATOR    │
│ Sarah Chen | On Duty ✓  │
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │  CREATE ALERT  🚨 │  │
│  │    (HUGE RED)     │  │
│  └───────────────────┘  │
│                         │
│ ACTIVE ALERTS (3)       │
│ ┌─────────────────────┐ │
│ │ Rm 302 - Cardiac    │ │
│ │ 2 min ago - Ack'd   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Rm 415 - Fall       │ │
│ │ 5 min ago - Pending │ │
│ └─────────────────────┘ │
│                         │
│ QUICK ALERTS            │
│ [CARDIAC] [CODE BLUE]  │
│ [FIRE] [SECURITY]      │
└─────────────────────────┘
```

#### Specifications
- **Create Alert button**: 100px height, pulsing animation
- **Active alerts**: Auto-refresh every 5 seconds
- **Quick alerts**: One-tap templates
- **Status indicators**: Color + icon + text
- **Font size**: Minimum 16px, 20px for critical

---

### 3. Alert Creation Form
**Purpose**: Capture essential info fast  
**Target**: <10 seconds to complete

#### Layout
```
┌─────────────────────────┐
│ ← CREATE MEDICAL ALERT  │
├─────────────────────────┤
│ ROOM NUMBER*            │
│ ┌─────────────────────┐ │
│ │ [3][0][2]          │ │
│ └─────────────────────┘ │
│                         │
│ ALERT TYPE*             │
│ ┌──────┐ ┌──────┐      │
│ │CARDIAC│ │ CODE │      │
│ │  🫀   │ │ BLUE │      │
│ └──────┘ └──────┘      │
│ ┌──────┐ ┌──────┐      │
│ │ FALL │ │ FIRE │      │
│ │  🦴   │ │  🔥  │      │
│ └──────┘ └──────┘      │
│                         │
│ URGENCY                 │
│ [1][2][③][4][5] ← Auto │
│                         │
│ DETAILS (Optional)      │
│ ┌─────────────────────┐ │
│ │ Voice note or type  │ │
│ │ 🎤                  │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │    SEND ALERT  →    │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Specifications
- **Room number**: Numeric keypad, auto-advance
- **Alert types**: 80px squares, icon + text
- **Urgency**: Auto-set based on type, adjustable
- **Voice note**: Prominent option for speed
- **Send button**: Swipe to confirm for safety
- **Required fields**: Minimal (room, type only)

---

### 4. Healthcare Dashboard (Nurse/Doctor)
**Purpose**: Monitor and respond to alerts  
**Target**: 2 taps to acknowledge

#### Layout
```
┌─────────────────────────┐
│ 👩‍⚕️ Dr. Johnson         │
│ Cardiology | Available  │
├─────────────────────────┤
│ URGENT ALERTS (2)    🔴 │
│ ┌─────────────────────┐ │
│ │ 302 - CARDIAC ARREST│ │
│ │ ⏱️ 0:45 ESCALATING  │ │
│ │ Ground Floor - ICU  │ │
│ │ [ACKNOWLEDGE]       │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 415 - CODE BLUE     │ │
│ │ ⏱️ 2:30             │ │
│ │ Dr. Smith responding│ │
│ │ [VIEW] [ASSIST]     │ │
│ └─────────────────────┘ │
│                         │
│ MY ALERTS (1)       🟡 │
│ ┌─────────────────────┐ │
│ │ 210 - FALL RISK     │ │
│ │ Acknowledged 5m ago │ │
│ │ [RESOLVE] [UPDATE]  │ │
│ └─────────────────────┘ │
│                         │
│ [FILTER: MY DEPT ▼]     │
└─────────────────────────┘
```

#### Specifications
- **Alert cards**: Swipe right to acknowledge
- **Timer**: Large, countdown for escalation
- **Status**: Clear visual hierarchy
- **Actions**: 60px minimum touch targets
- **Filters**: Quick access, remembered
- **Pull to refresh**: Standard gesture

---

### 5. Alert Detail View
**Purpose**: Complete information for response  
**Target**: All info visible without scrolling

#### Layout
```
┌─────────────────────────┐
│ ← CARDIAC ARREST    🚨  │
├─────────────────────────┤
│ ROOM 302 - ICU          │
│ John Doe (68yo Male)    │
│ MRN: 1234567           │
│                         │
│ ⏱️ 2:45 AGO             │
│ ESCALATES IN 0:15       │
│                         │
│ STATUS: PENDING         │
│ No one acknowledged yet │
│                         │
│ PATIENT INFO            │
│ • Cardiac history       │
│ • DNR: No              │
│ • Allergies: Penicillin│
│                         │
│ RESPONDERS              │
│ • Searching...          │
│                         │
│ ┌─────────────────────┐ │
│ │   ACKNOWLEDGE  ✓    │ │
│ └─────────────────────┘ │
│                         │
│ [📞 Call] [🗺️ Navigate]│
└─────────────────────────┘
```

#### Specifications
- **Critical info**: Above the fold
- **Timer**: Prominent, anxiety-inducing
- **Patient data**: Essential only
- **Actions**: Primary action huge
- **Secondary actions**: Still accessible
- **Updates**: Real-time status changes

---

### 6. Admin Dashboard
**Purpose**: System oversight and management  
**Target**: At-a-glance system health

#### Layout
```
┌─────────────────────────┐
│ 🏥 SYSTEM ADMIN         │
│ Good Morning, Admin     │
├─────────────────────────┤
│ SYSTEM STATUS      ✅   │
│ • Active Alerts: 3      │
│ • Avg Response: 1:23    │
│ • Staff Online: 45/50   │
│                         │
│ ALERTS TODAY            │
│ ┌─────────────────────┐ │
│ │   📊 Analytics       │ │
│ │ Total: 127           │ │
│ │ Resolved: 124        │ │
│ │ Escalated: 12        │ │
│ └─────────────────────┘ │
│                         │
│ QUICK ACTIONS           │
│ ┌─────┐ ┌─────┐        │
│ │Users│ │Audit│        │
│ │  👥 │ │  📋 │        │
│ └─────┘ └─────┘        │
│ ┌─────┐ ┌─────┐        │
│ │Report│ │Settings│     │
│ │  📈  │ │  ⚙️  │      │
│ └─────┘ └─────┘        │
└─────────────────────────┘
```

---

## 🎨 Component Specifications

### Alert Card Component
```
┌───────────────────────────┐
│ [Icon] ALERT TYPE     [⏱️] │
│ Room XXX - Location       │
│ Brief description...      │
│ Status: Pending/Ack'd     │
│ [ACTION 1] [ACTION 2]     │
└───────────────────────────┘
```

**States**:
- Default (gray border)
- Urgent (red border, pulse)
- Acknowledged (blue border)
- Resolved (green border)
- Escalating (orange, shake)

### Button Specifications
- **Primary**: 60-80px height, full width
- **Secondary**: 50px height, high contrast
- **Emergency**: 100px height, red, pulse
- **Text size**: 18-24px, bold
- **Touch target**: Minimum 44px
- **Padding**: 20px around text

### Color Palette
- **Emergency Red**: #DC2626
- **Warning Orange**: #F59E0B  
- **Success Green**: #10B981
- **Info Blue**: #3B82F6
- **Neutral Gray**: #6B7280
- **Background**: #F9FAFB (light)
- **Night Mode**: #1F2937 (dark)

### Typography
- **Headers**: SF Pro Display, 24-32px
- **Body**: SF Pro Text, 16-18px
- **Labels**: SF Pro Text, 14px
- **Emergency**: Bold, 20px minimum
- **Line height**: 1.5x for readability

### Spacing System
- **Base unit**: 4px
- **Component padding**: 16px
- **Section spacing**: 24px
- **Card margins**: 12px
- **Touch target spacing**: 8px minimum

## 📱 Responsive Behavior

### Phone (320-414px)
- Single column
- Stack all elements
- Bottom sheet for forms
- Swipe gestures primary

### Tablet (768-1024px)
- Two column for dashboards
- Side panel for details
- Larger touch targets
- More info visible

### Desktop (1024px+)
- Multi-column dashboards
- Sidebar navigation
- Keyboard shortcuts
- Hover states

## 🎯 Interaction Patterns

### Gestures
- **Swipe right**: Acknowledge/Accept
- **Swipe left**: Dismiss/Reject
- **Long press**: More options
- **Pull down**: Refresh
- **Pinch**: Zoom maps

### Feedback
- **Haptic**: On critical actions
- **Sound**: Customizable alerts
- **Visual**: Color + animation
- **Toast**: Non-blocking messages

### Loading States
- **Skeleton screens**: Never blank
- **Progressive**: Load critical first
- **Optimistic**: Show success immediately
- **Offline queue**: Visual indicator

## ♿ Accessibility Requirements

1. **Screen reader**: Full compatibility
2. **Voice control**: All actions
3. **High contrast**: WCAG AAA
4. **Text size**: Scalable 50-200%
5. **Color blind**: Safe palettes
6. **One-handed**: Everything reachable
7. **Left-handed**: Mirrored option

---

*These wireframes prioritize function over form. Beauty comes after life-saving efficiency.*