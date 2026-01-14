# 📊 Charts Implementation Index - Multi-Agent Reference

*Last Updated: January 7, 2025*

## Overview

This index provides quick access to all charts-related information for agents working on the project.

## Chart Components Implemented

### 1. Core Chart Types
- **LineChart** (`/components/universal/charts/LineChart.tsx`)
  - Standard line charts with data points
  - Bezier curve support for smooth lines
  - Multiple datasets support
  - Filled area option

- **BarChart** (`/components/universal/charts/BarChart.tsx`)
  - Vertical and horizontal bars
  - Grouped and stacked modes
  - Custom bar widths
  - Interactive press handlers

- **PieChart** (`/components/universal/charts/PieChart.tsx`)
  - Standard pie charts
  - Donut charts (with innerRadius)
  - Labels and value display
  - Slice animations

- **AreaChart** (`/components/universal/charts/AreaChart.tsx`)
  - Filled area charts
  - Multiple datasets
  - Gradient fills
  - Stacked areas

- **RadarChart** (`/components/universal/charts/RadarChart.tsx`)
  - Multi-axis comparison
  - Configurable levels
  - Multiple datasets
  - Grid and labels

- **RadialChart** (`/components/universal/charts/RadialChart.tsx`)
  - Progress indicators
  - Radial bar charts
  - Percentage display
  - Custom colors

### 2. Supporting Components
- **ChartContainer** (`/components/universal/charts/ChartContainer.tsx`)
  - Wrapper for consistent styling
  - Title and description support
  - Responsive sizing
  - Theme integration

- **ChartLegend** (Inside ChartContainer)
  - Horizontal/vertical layouts
  - Color indicators
  - Value display
  - Interactive selection

- **ChartTooltip** (Inside ChartContainer)
  - Touch/hover tooltips
  - Formatted values
  - Custom content
  - Theme-aware styling

## Quick Implementation Guide

### Basic Line Chart
```typescript
import { LineChart, ChartContainer } from '@/components/universal';

<ChartContainer title="Revenue">
  <LineChart
    data={{
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        label: '2024',
        data: [100, 150, 120],
        color: theme.primary,
      }]
    }}
  />
</ChartContainer>
```

### Theme Integration
All charts automatically adapt to the current theme:
- Primary/secondary colors for data series
- Background/foreground for text
- Border colors for grids
- Shadow support in themes

### Responsive Behavior
Charts automatically:
- Adapt to container width
- Scale text based on density
- Adjust touch targets
- Support landscape/portrait

## Key Files Reference

### Implementation Files
- `/components/universal/charts/` - All chart components
- `/components/universal/charts/index.ts` - Exports
- `/lib/theme/theme-registry.tsx` - Theme colors used by charts

### Documentation Files
- `/docs/design-system/CHARTS_IMPLEMENTATION.md` - Complete guide
- `/docs/multi-agent/UNIVERSAL_COMPONENTS_TASK_INDEX.md` - Task tracking
- `/CLAUDE.md` - Updated with charts info

### Example Usage
- Settings page can show usage stats
- Admin dashboard can display analytics
- Profile page can show activity charts

## Common Patterns

### Data Format
```typescript
// Line/Area/Bar charts
{
  labels: string[],
  datasets: [{
    label: string,
    data: number[],
    color?: string,
  }]
}

// Pie charts
[
  { label: string, value: number, color?: string }
]

// Radar charts
{
  labels: string[],
  datasets: [{
    label: string,
    data: number[],
    color?: string,
  }]
}
```

### Performance Tips
1. Memoize chart data with `useMemo`
2. Limit data points to ~50 for smooth performance
3. Use `aspectRatio` instead of fixed heights
4. Disable animations on low-end devices

## Agent Commands

### View chart implementation
```
Agent: Show me the LineChart implementation
```

### Test charts
```
Agent: Create a test screen with all chart types
```

### Add charts to a screen
```
Agent: Add a revenue chart to the admin dashboard
```

## Next Steps

1. **TASK-104**: Create Blocks Inspiration Library
2. **TASK-002**: Use charts in Admin Dashboard
3. **TASK-005**: Add charts to Organization Management

---

*This index helps agents quickly find and use chart components in the codebase.*