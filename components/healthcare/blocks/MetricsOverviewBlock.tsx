import React, { Suspense, useDeferredValue, useTransition } from 'react';
import { Platform } from 'react-native';
import {
  Card,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Button,
  Grid,
  Progress,
} from '@/components/universal';
import { goldenSpacing, goldenShadows, goldenDimensions, goldenAnimations, healthcareColors } from '@/lib/design-system/golden-ratio';
import { useTheme } from '@/lib/theme/theme-provider';
import { api } from '@/lib/trpc';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { log } from '@/lib/core/logger';

// Metrics store with Zustand
interface MetricsState {
  timeRange: '1h' | '6h' | '24h' | '7d';
  department: string;
  refreshInterval: number;
  setTimeRange: (range: '1h' | '6h' | '24h' | '7d') => void;
  setDepartment: (dept: string) => void;
  setRefreshInterval: (interval: number) => void;
}

const useMetricsStore = create<MetricsState>()(
  devtools(
    subscribeWithSelector((set) => ({
      timeRange: '24h',
      department: 'all',
      refreshInterval: 30000, // 30 seconds
      
      setTimeRange: (range) => set({ timeRange: range }),
      setDepartment: (dept) => set({ department: dept }),
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
    }))
  )
);

// Primary metric card component
const PrimaryMetricCard = ({ 
  value, 
  label, 
  trend, 
  capacity, 
  color,
  icon 
}: { 
  value: number;
  label: string;
  trend?: number;
  capacity?: number;
  color: string;
  icon: string;
}) => {
  const theme = useTheme();
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.md}
      shadow={goldenShadows.lg}
      style={{
        minHeight: goldenDimensions.heights.large,
        borderTopWidth: 3,
        borderTopColor: color,
      }}
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        <VStack gap={goldenSpacing.sm}>
          <Text size="4xl" weight="bold">{value}</Text>
          <Text size="sm" colorTheme="mutedForeground">{label}</Text>
        </VStack>
        <Text size="3xl">{icon}</Text>
      </HStack>
      
      {capacity !== undefined && (
        <VStack gap={goldenSpacing.xs}>
          <HStack justifyContent="space-between">
            <Text size="xs" colorTheme="mutedForeground">Capacity</Text>
            <Text size="xs" weight="medium">{Math.round((value / capacity) * 100)}%</Text>
          </HStack>
          <Progress value={(value / capacity) * 100} variant="primary" />
        </VStack>
      )}
      
      {trend !== undefined && (
        <HStack gap={goldenSpacing.xs} alignItems="center">
          <Text size="sm" colorTheme={trend > 0 ? "destructive" : "success"}>
            {trend > 0 ? '↑' : '↓'}
          </Text>
          <Text size="sm" colorTheme="mutedForeground">
            {Math.abs(trend)}% from last period
          </Text>
        </HStack>
      )}
    </Card>
  );
};

// Secondary metric card
const SecondaryMetricCard = ({ 
  value, 
  label, 
  unit, 
  status 
}: { 
  value: number | string;
  label: string;
  unit?: string;
  status?: 'good' | 'warning' | 'critical';
}) => {
  const theme = useTheme();
  const statusColors = {
    good: healthcareColors.success,
    warning: healthcareColors.warning,
    critical: healthcareColors.emergency,
  };
  
  return (
    <Card
      padding={goldenSpacing.lg}
      gap={goldenSpacing.sm}
      shadow={goldenShadows.md}
      style={{
        height: goldenDimensions.heights.medium,
        borderLeftWidth: 3,
        borderLeftColor: status ? statusColors[status] : theme.border,
      }}
    >
      <Text size="xs" colorTheme="mutedForeground">{label}</Text>
      <HStack gap={goldenSpacing.xs} alignItems="baseline">
        <Text size="2xl" weight="bold">{value}</Text>
        {unit && <Text size="sm" colorTheme="mutedForeground">{unit}</Text>}
      </HStack>
    </Card>
  );
};

// Mini stat component
const MiniStat = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const theme = useTheme();
  
  return (
    <HStack
      gap={goldenSpacing.md}
      alignItems="center"
      padding={goldenSpacing.sm}
      style={{
        height: goldenDimensions.heights.small,
        borderRadius: theme.radius?.md || 8,
        backgroundColor: color + '10',
      }}
    >
      <Box
        width={8}
        height={8}
        style={{
          backgroundColor: color,
          borderRadius: 8,
        }}
      />
      <VStack gap={2} flex={1}>
        <Text size="xs" colorTheme="mutedForeground">{label}</Text>
        <Text weight="bold">{value}</Text>
      </VStack>
    </HStack>
  );
};

// Metrics skeleton loader
const MetricsSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Grid
      columns={Platform.OS === 'web' ? "1.618fr 1fr 0.618fr" : "1fr"}
      gap={goldenSpacing.lg}
    >
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          padding={goldenSpacing.xl}
          style={{
            height: goldenDimensions.heights.large,
            backgroundColor: theme.muted,
            opacity: 0.5,
          }}
        />
      ))}
    </Grid>
  );
};

// Main metrics content
const MetricsContent = ({ hospitalId }: { hospitalId: string }) => {
  const theme = useTheme();
  const { timeRange, department, refreshInterval, setTimeRange } = useMetricsStore();
  const [isPending, startTransition] = useTransition();
  
  // Deferred values for smooth interactions
  const deferredTimeRange = useDeferredValue(timeRange);
  const deferredDepartment = useDeferredValue(department);
  
  // Fetch metrics data
  const { data: metrics } = api.healthcare.getMetrics.useQuery(
    {
      timeRange: deferredTimeRange,
      department: deferredDepartment,
    },
    {
      refetchInterval: refreshInterval,
      refetchIntervalInBackground: true,
      suspense: true, // Enable suspense for this query
    }
  );
  
  // Real-time subscription with fallback
  if (Platform.OS === 'web' && process.env.NODE_ENV === 'development') {
    // Use WebSocket subscription on web in development
    api.healthcare.subscribeToMetrics.useSubscription(
      { hospitalId },
      {
        onData: (update) => {
          log.info('Metrics update received', 'METRICS', update);
        },
        onError: (error) => {
          log.error('Metrics subscription error', 'METRICS', error);
        },
      }
    );
  }
  
  if (!metrics) {
    return <MetricsSkeleton />;
  }
  
  return (
    <>
      {/* Time range selector */}
      <HStack gap={goldenSpacing.md} justifyContent="flex-end">
        {(['1h', '6h', '24h', '7d'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "solid" : "outline"}
            size="sm"
            onPress={() => {
              startTransition(() => {
                setTimeRange(range);
              });
            }}
            isLoading={isPending && timeRange === range}
          >
            {range.toUpperCase()}
          </Button>
        ))}
      </HStack>
      
      {/* Main metrics grid */}
      <Grid
        columns={Platform.OS === 'web' ? "1.618fr 1fr 0.618fr" : "1fr"}
        gap={goldenSpacing.lg}
        style={{ minHeight: goldenDimensions.heights.xlarge }}
      >
        {/* Primary Metric */}
        <PrimaryMetricCard
          value={metrics.activeAlerts}
          label="Active Alerts"
          trend={metrics.alertsTrend}
          capacity={metrics.alertCapacity}
          color={healthcareColors.emergency}
          icon="🚨"
        />
        
        {/* Secondary Metrics */}
        <VStack gap={goldenSpacing.md}>
          <SecondaryMetricCard
            value={metrics.avgResponseTime}
            label="Avg Response Time"
            unit="min"
            status={metrics.avgResponseTime <= 3 ? 'good' : metrics.avgResponseTime <= 5 ? 'warning' : 'critical'}
          />
          <SecondaryMetricCard
            value={metrics.staffOnline}
            label="Staff Online"
            unit={`/ ${metrics.totalStaff}`}
            status={metrics.staffOnline >= metrics.minStaffRequired ? 'good' : 'critical'}
          />
        </VStack>
        
        {/* Mini Stats */}
        <VStack gap={goldenSpacing.sm}>
          <Text size="sm" weight="medium">By Priority</Text>
          <MiniStat label="Critical" value={metrics.criticalAlerts} color={healthcareColors.emergency} />
          <MiniStat label="Urgent" value={metrics.urgentAlerts} color={healthcareColors.warning} />
          <MiniStat label="Standard" value={metrics.standardAlerts} color={healthcareColors.info} />
          <MiniStat label="Resolved" value={metrics.resolvedToday} color={healthcareColors.success} />
        </VStack>
      </Grid>
      
      {/* Department breakdown */}
      <Card padding={goldenSpacing.lg} gap={goldenSpacing.md}>
        <Text weight="medium">Department Performance</Text>
        <Grid columns={Platform.OS === 'web' ? 4 : 2} gap={goldenSpacing.md}>
          {metrics.departmentStats.map((dept) => (
            <VStack key={dept.id} gap={goldenSpacing.xs}>
              <HStack justifyContent="space-between">
                <Text size="sm">{dept.name}</Text>
                <Badge size="sm" variant={dept.alerts > 0 ? "destructive" : "outline"}>
                  {dept.alerts}
                </Badge>
              </HStack>
              <Progress 
                value={(dept.responseRate || 0) * 100} 
                size="sm"
                variant={dept.responseRate >= 0.8 ? "success" : "warning"}
              />
              <Text size="xs" colorTheme="mutedForeground">
                {Math.round((dept.responseRate || 0) * 100)}% response rate
              </Text>
            </VStack>
          ))}
        </Grid>
      </Card>
    </>
  );
};

// Main component with Suspense boundary
export const MetricsOverviewBlock = ({ hospitalId }: { hospitalId: string }) => {
  return (
    <VStack gap={goldenSpacing.lg}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text size="xl" weight="bold">System Metrics</Text>
        <Badge variant="outline" size="sm">
          Live
        </Badge>
      </HStack>
      
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsContent hospitalId={hospitalId} />
      </Suspense>
    </VStack>
  );
};