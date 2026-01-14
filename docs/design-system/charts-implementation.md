# Universal Charts Implementation

## Overview

The Universal Charts library provides cross-platform chart components that work seamlessly on iOS, Android, and Web. Built with react-native-svg, these charts integrate with the theme system and support responsive sizing.

## Chart Types

### 1. Line Chart
```tsx
import { LineChart, ChartContainer } from '@/components/universal';

<ChartContainer title="Sales Trend" description="Monthly sales data">
  <LineChart
    data={{
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: '2024',
          data: [30, 45, 28, 80, 99, 43],
          color: theme.primary,
          filled: true,
        },
        {
          label: '2023',
          data: [20, 35, 40, 60, 70, 40],
          color: theme.secondary,
        },
      ],
    }}
    bezier
    showGrid
    showLegend
  />
</ChartContainer>
```

### 2. Bar Chart
```tsx
<BarChart
  data={{
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Revenue',
        data: [120, 150, 180, 200],
      },
      {
        label: 'Expenses',
        data: [80, 90, 100, 110],
      },
    ],
  }}
  stacked={false}
  horizontal={false}
/>
```

### 3. Pie Chart
```tsx
<PieChart
  data={[
    { label: 'Desktop', value: 45, color: theme.primary },
    { label: 'Mobile', value: 30, color: theme.secondary },
    { label: 'Tablet', value: 25, color: theme.accent },
  ]}
  innerRadius={60} // For donut chart
  showLabels
  showValues
/>
```

### 4. Area Chart
```tsx
<AreaChart
  data={{
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Users',
        data: [100, 120, 115, 134, 168],
      },
    ],
  }}
/>
```

### 5. Radar Chart
```tsx
<RadarChart
  data={{
    labels: ['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency'],
    datasets: [
      {
        label: 'Model A',
        data: [80, 90, 85, 95, 75],
        color: theme.primary,
      },
      {
        label: 'Model B',
        data: [70, 85, 90, 80, 85],
        color: theme.secondary,
      },
    ],
  }}
  levels={5}
  showGrid
/>
```

### 6. Radial Chart
```tsx
// Single progress
<RadialChart
  value={75}
  maxValue={100}
  showPercentage
  label="Progress"
/>

// Multiple radial bars
<RadialBarChart
  data={[
    { label: 'CPU', value: 65 },
    { label: 'RAM', value: 80 },
    { label: 'Disk', value: 45 },
  ]}
  maxValue={100}
/>
```

## Features

### Theme Integration
All charts automatically use theme colors:
- `theme.primary`, `theme.secondary`, `theme.accent` for data series
- `theme.border` for axes and grid lines
- `theme.foreground` and `theme.mutedForeground` for text

### Responsive Sizing
Charts automatically adapt to container width:
```tsx
<LineChart
  data={data}
  width={300}  // Optional, defaults to screen width - padding
  height={200} // Default 200-250 depending on chart type
/>
```

### Interactive Features
```tsx
<BarChart
  data={data}
  onBarPress={(datasetIndex, labelIndex, value) => {
    console.log(`Pressed bar: ${value}`);
  }}
/>
```

### Chart Container
Provides consistent styling and layout:
```tsx
<ChartContainer
  title="Chart Title"
  description="Optional description"
  height={300}
  aspectRatio={16/9} // Alternative to fixed height
>
  <LineChart data={data} />
</ChartContainer>
```

### Legend Component
```tsx
<ChartLegend
  items={[
    { name: 'Series 1', color: theme.primary, value: '45%' },
    { name: 'Series 2', color: theme.secondary, value: '55%' },
  ]}
  orientation="horizontal"
  position="bottom"
/>
```

## Customization

### Colors
```tsx
// Use theme colors
const chartConfig = useChartConfig();
// Access: chartConfig.colors.primary, chart1-5, success, warning, danger

// Or specify custom colors
<LineChart
  data={{
    datasets: [
      { data: [1,2,3], color: '#FF6B6B' },
    ],
  }}
/>
```

### Styling
```tsx
<BarChart
  data={data}
  showGrid={false}
  showXAxis={true}
  showYAxis={true}
  barWidth={20}
  style={{ marginTop: 20 }}
/>
```

## Performance Tips

1. **Memoize data**: Chart data should be memoized to prevent unnecessary re-renders
2. **Limit data points**: For line/area charts, limit to ~50 points for smooth performance
3. **Use aspectRatio**: Better than fixed heights for responsive layouts
4. **Disable animations**: On low-end devices, consider disabling bezier curves

## Platform Differences

- **Web**: Full SVG support with hover states
- **iOS/Android**: Touch interactions work seamlessly
- **Animations**: Hardware accelerated on all platforms

## Migration from Recharts

If migrating from web Recharts:
1. Data format is similar but simplified
2. Use `ChartContainer` instead of `ResponsiveContainer`
3. Interactions use `onPress` instead of `onClick`
4. Tooltips need manual implementation (see ChartTooltip component)

## Bundle Size

Charts add ~15KB to bundle (react-native-svg is likely already included).
Individual chart imports available for optimization:

```tsx
import { LineChart } from '@/components/universal/charts/LineChart';
```