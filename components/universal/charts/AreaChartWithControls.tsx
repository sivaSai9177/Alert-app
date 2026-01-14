import React, { useMemo, useState, useEffect, useCallback, useTransition } from 'react';
import { ViewStyle, Dimensions } from 'react-native';
import { AreaChart, AreaChartData } from './AreaChart';
import { ChartContainer, ChartLegend } from './ChartContainer';
import { HStack } from '../Stack';
import { Box } from '../Box';
import { Button } from '../Button';
import { SpacingScale } from '@/lib/design-system';
import { useTheme } from '@/lib/theme/theme-provider';

export interface TimeRange {
  label: string;
  value: string;
  days: number;
}

export interface AreaChartWithControlsProps {
  data: Record<string, AreaChartData>; // Data for each time range
  title?: string;
  description?: string;
  timeRanges?: TimeRange[];
  defaultTimeRange?: string;
  showLegend?: boolean;
  height?: number;
  style?: ViewStyle;
  onTimeRangeChange?: (range: string) => void;
}

const defaultTimeRanges: TimeRange[] = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 3 months', value: '90d', days: 90 },
];

export const AreaChartWithControls: React.FC<AreaChartWithControlsProps> = ({
  data,
  title,
  description,
  timeRanges = defaultTimeRanges,
  defaultTimeRange = '7d',
  showLegend = true,
  height = 300,
  style,
  onTimeRangeChange,
}) => {
  const theme = useTheme();
  const [selectedRange, setSelectedRange] = useState(defaultTimeRange);
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const updateIsMobile = () => {
      const { width } = Dimensions.get('window');
      setIsMobile(width < 768);
    };
    
    updateIsMobile();
    const subscription = Dimensions.addEventListener('change', updateIsMobile);
    return () => subscription?.remove();
  }, []);

  const handleRangeChange = useCallback((range: string) => {
    startTransition(() => {
      setSelectedRange(range);
      onTimeRangeChange?.(range);
    });
  }, [onTimeRangeChange]);

  const currentData = data[selectedRange] || data[defaultTimeRange];

  // Generate legend items from data
  const legendItems = useMemo(() => {
    if (!currentData?.datasets) return [];
    
    return currentData.datasets.map((dataset, index) => ({
      name: dataset.label,
      color: dataset.color || `hsl(var(--chart-${index + 1}))`,
    }));
  }, [currentData]);

  return (
    <ChartContainer
      title={title}
      description={description}
      height={height}
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
        ...(style as any),
      }}
    >
      <Box flex={1} style={{ padding: 0 }}>
        {/* Time Range Controls */}
        <Box px={4 as SpacingScale} pt={2 as SpacingScale}>
          <HStack 
            justifyContent="flex-end" 
            spacing={1} 
            mb={3 as SpacingScale}
          >
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                size="sm"
                variant={selectedRange === range.value ? 'secondary' : 'ghost'}
                onPress={() => handleRangeChange(range.value)}
                style={{
                  paddingHorizontal: 16,
                  backgroundColor: selectedRange === range.value ? theme.secondary : 'transparent',
                  borderColor: theme.border,
                }}
              >
                {isMobile && range.value === '90d' ? '3m' : range.label}
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Chart */}
        {currentData && (
          <Box flex={1} px={2 as SpacingScale} pb={2 as SpacingScale}>
            <AreaChart
              data={currentData}
              height={height - 120} // Account for controls and legend
              showGrid
              showXAxis
              showYAxis
              bezier
              style={{
                backgroundColor: 'transparent',
              }}
            />
          </Box>
        )}

        {/* Legend */}
        {showLegend && legendItems.length > 0 && (
          <ChartLegend
            items={legendItems}
            orientation="horizontal"
            position="bottom"
          />
        )}
      </Box>
    </ChartContainer>
  );
};

// Helper function to generate sample visitor data
// Wrapped in a hook for memoization
export const useGenerateVisitorData = (days: number): AreaChartData => {
  return useMemo(() => {
  // Use stable seed for consistent data during re-renders
  const seed = days;
  const random = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  const labels: string[] = [];
  const desktopData: number[] = [];
  const mobileData: number[] = [];
  
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Format label based on range
    let label: string;
    if (days <= 7) {
      label = date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (days <= 30) {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // Skip some labels for better readability on longer ranges
    if (days > 30 && i % 7 !== 0) {
      labels.push('');
    } else if (days > 7 && days <= 30 && i % 2 !== 0) {
      labels.push('');
    } else {
      labels.push(label);
    }
    
    // Generate realistic visitor data with stable seed
    const baseVisitors = 300 + random(i) * 200;
    const weekendMultiplier = (date.getDay() === 0 || date.getDay() === 6) ? 0.7 : 1;
    
    desktopData.push(Math.floor(baseVisitors * weekendMultiplier * (0.6 + random(i + 1000) * 0.2)));
    mobileData.push(Math.floor(baseVisitors * weekendMultiplier * (0.4 + random(i + 2000) * 0.2)));
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Desktop',
        data: desktopData,
        filled: true,
        color: 'hsl(var(--chart-1))',
        strokeWidth: 2,
      },
      {
        label: 'Mobile',
        data: mobileData,
        filled: true,
        color: 'hsl(var(--chart-2))',
        strokeWidth: 2,
      },
    ],
  };
  }, [days]);
};

// Non-hook version for external use
export const generateVisitorData = (days: number): AreaChartData => {
  // Use stable seed for consistent data
  const seed = days;
  const random = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  const labels: string[] = [];
  const desktopData: number[] = [];
  const mobileData: number[] = [];
  
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    let label: string;
    if (days <= 7) {
      label = date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    if (days > 30 && i % 7 !== 0) {
      labels.push('');
    } else if (days > 7 && days <= 30 && i % 2 !== 0) {
      labels.push('');
    } else {
      labels.push(label);
    }
    
    const baseVisitors = 300 + random(i) * 200;
    const weekendMultiplier = (date.getDay() === 0 || date.getDay() === 6) ? 0.7 : 1;
    
    desktopData.push(Math.floor(baseVisitors * weekendMultiplier * (0.6 + random(i + 1000) * 0.2)));
    mobileData.push(Math.floor(baseVisitors * weekendMultiplier * (0.4 + random(i + 2000) * 0.2)));
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Desktop',
        data: desktopData,
        filled: true,
        color: 'hsl(var(--chart-1))',
        strokeWidth: 2,
      },
      {
        label: 'Mobile',
        data: mobileData,
        filled: true,
        color: 'hsl(var(--chart-2))',
        strokeWidth: 2,
      },
    ],
  };
};