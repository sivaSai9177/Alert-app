# UI Blocks Inspiration Library

This library contains inspiration and patterns from shadcn/ui blocks for future implementation in our Universal Design System.

## 🔗 Analyzed shadcn Blocks

The following blocks were analyzed from shadcn/ui:
- https://ui.shadcn.com/blocks#dashboard-01
- https://ui.shadcn.com/blocks#sidebar-07
- https://ui.shadcn.com/blocks/sidebar#sidebar-13
- https://ui.shadcn.com/blocks/sidebar#sidebar-15
- https://ui.shadcn.com/blocks/calendar#calendar-11

## 📊 Dashboard Patterns

### Dashboard-01: Modular Dashboard Layout
**Source:** https://ui.shadcn.com/blocks#dashboard-01
**Key Features:**
- Sidebar + main content layout
- Interactive charts with `ChartAreaInteractive`
- Data tables with `DataTable` component
- Summary cards with `SectionCards`
- Responsive design with CSS variables

**Implementation Pattern:**
```typescript
<SidebarProvider
  style={{
    "--sidebar-width": "calc(var(--spacing) * 72)",
    "--header-height": "calc(var(--spacing) * 12)",
  }}
>
  <AppSidebar variant="inset" />
  <SidebarInset>
    <SiteHeader />
    {/* Dashboard content */}
  </SidebarInset>
</SidebarProvider>
```

**Universal Components Needed:**
- [x] Container
- [x] Card
- [x] Charts (LineChart, AreaChart)
- [x] Table
- [ ] Sidebar (advanced version)

## 🧭 Navigation Patterns

### Sidebar-07: Collapsible Icon Sidebar
**Source:** https://ui.shadcn.com/blocks#sidebar-07
**Key Features:**
- Collapses to icon-only view
- Breadcrumb navigation in header
- Toggle trigger for expand/collapse
- Responsive breakpoints

**Unique Aspects:**
- Uses `group-has-data-[collapsible=icon]` for dynamic styling
- Maintains navigation context when collapsed
- Smooth transitions between states

### Sidebar-13: Dialog-Based Sidebar
**Source:** https://ui.shadcn.com/blocks/sidebar#sidebar-13
**Key Features:**
- Sidebar rendered inside a dialog
- Modal-like experience
- Focused settings interface
- Centered layout

**Implementation Pattern:**
```tsx
<div className="flex h-svh items-center justify-center">
  <SettingsDialog />
</div>
```

**Use Case:** Settings panels, configuration wizards, or temporary navigation

### Sidebar-15: Dual Sidebar Layout
**Source:** https://ui.shadcn.com/blocks/sidebar#sidebar-15
**Key Features:**
- Left and right sidebars
- Center content area
- Sticky header with breadcrumbs
- Symmetrical navigation

**Architecture:**
```tsx
<SidebarProvider>
  <SidebarLeft />
  <SidebarInset>
    {/* Main content */}
  </SidebarInset>
  <SidebarRight />
</SidebarProvider>
```

**Use Case:** Complex applications with primary/secondary navigation

## 📅 Calendar Patterns

### Calendar-11: Restricted Date Range
**Source:** https://ui.shadcn.com/blocks/calendar#calendar-11
**Key Features:**
- Limited month navigation
- Date range selection
- Seasonal availability display
- Disabled navigation outside range

**Implementation:**
```typescript
<Calendar
  mode="range"
  numberOfMonths={2}
  startMonth={new Date(2025, 5, 1)}
  endMonth={new Date(2025, 6, 31)}
  disableNavigation
/>
```

**Use Case:** Booking systems, seasonal services, limited availability

## 🎨 Design Patterns to Implement

### 1. Advanced Sidebar Component
Based on the analysis, we should create an advanced Sidebar component with:
- Collapsible states (full, icon, hidden)
- Multiple variants (inset, floating, modal)
- Responsive behavior
- Navigation groups
- Icon support
- Breadcrumb integration

### 2. Dashboard Layout Components
- `DashboardProvider`: Manages layout state
- `DashboardSidebar`: Navigation component
- `DashboardContent`: Main content area
- `DashboardHeader`: Page header with actions
- `DashboardCards`: Summary card grid

### 3. Calendar Enhancements
- Date range restrictions
- Multi-month display
- Booking/availability modes
- Custom date highlighting

## 🚀 Implementation Priority

1. **Advanced Sidebar** (High Priority)
   - Essential for navigation
   - Multiple use cases
   - Complex state management

2. **Dashboard Layout** (Medium Priority)
   - Builds on sidebar
   - Common pattern
   - Reusable structure

3. **Calendar Features** (Low Priority)
   - Specific use cases
   - Enhancement to existing DatePicker

## 📝 Code Patterns to Adopt

### CSS Variables for Dynamic Sizing
```css
--sidebar-width: calc(var(--spacing) * 72);
--header-height: calc(var(--spacing) * 12);
```

### Responsive Utilities
```tsx
className="hidden md:flex"
className="group-has-data-[collapsible=icon]:hidden"
```

### Component Composition
```tsx
<Provider>
  <Layout>
    <Navigation />
    <Content />
  </Layout>
</Provider>
```

## 🔗 Reference Links

- [Shadcn Blocks](https://ui.shadcn.com/blocks)
- [Shadcn Components](https://ui.shadcn.com/docs/components)
- [Shadcn Colors](https://ui.shadcn.com/colors)

## 📋 Next Steps

1. Create advanced Sidebar component with all variants
2. Implement DashboardProvider and related components
3. Enhance Calendar with range restrictions
4. Create example implementations
5. Document patterns in Universal Component Library

---

*This inspiration library serves as a reference for implementing advanced UI patterns in our Universal Design System.*