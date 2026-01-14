# Dashboard Blocks - Healthcare UI

## 📊 Metrics Overview Block

### Design Specifications
```typescript
// Golden ratio grid for metrics
const MetricsOverviewBlock = {
  layout: {
    primary: '1.618fr',    // Main metric
    secondary: '1fr',      // Secondary metrics
    tertiary: '0.618fr',   // Supporting metrics
  },
  heights: {
    large: 144,   // Fibonacci
    medium: 89,   // Fibonacci
    small: 55,    // Fibonacci
    tiny: 34,     // Fibonacci
  }
};
```

### Component Structure
```tsx
import { 
  Grid, Card, Stats, Badge, Text, 
  Heading4, VStack, HStack, Progress 
} from '@/components/universal';
import { goldenSpacing, goldenShadows, goldenAnimations } from '@/lib/design-system';

const MetricsOverviewBlock = ({ metrics, timeRange = '24h' }) => {
  const theme = useTheme();
  
  return (
    <Grid
      columns="1.618fr 1fr 0.618fr"
      gap={goldenSpacing.lg}
      style={{ minHeight: 233 }} // Fibonacci
    >
      {/* Primary Metric - Active Alerts */}
      <Card
        padding={goldenSpacing.xl}
        shadow={goldenShadows.lg}
        style={{
          height: 144,
          background: `linear-gradient(135deg, ${theme.emergency}10 0%, ${theme.emergency}05 100%)`,
        }}
      >
        <VStack gap={goldenSpacing.md} flex={1}>
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack gap={goldenSpacing.xs}>
              <Text size="small" colorTheme="mutedForeground">
                Active Alerts
              </Text>
              <Heading1 style={{ fontSize: 55 }}> {/* Fibonacci */}
                {metrics.activeAlerts}
              </Heading1>
            </VStack>
            <Badge
              variant={metrics.trend > 0 ? "warning" : "success"}
              size="small"
            >
              {metrics.trend > 0 ? '↑' : '↓'} {Math.abs(metrics.trend)}%
            </Badge>
          </HStack>
          <Progress
            value={metrics.activeAlerts}
            max={metrics.capacity}
            height={8}
            colorScheme="emergency"
          />
          <Text size="tiny" colorTheme="mutedForeground">
            {metrics.capacity - metrics.activeAlerts} capacity remaining
          </Text>
        </VStack>
      </Card>
      
      {/* Secondary Metrics */}
      <VStack gap={goldenSpacing.md}>
        {/* Response Time */}
        <Card
          padding={goldenSpacing.lg}
          shadow={goldenShadows.md}
          style={{ height: 89 }}
        >
          <HStack justifyContent="space-between" alignItems="center" flex={1}>
            <VStack gap={goldenSpacing.xs}>
              <Text size="small" colorTheme="mutedForeground">
                Avg Response
              </Text>
              <Heading3>{metrics.avgResponse}</Heading3>
            </VStack>
            <CircularProgress
              value={metrics.responseScore}
              size={55}
              strokeWidth={5}
              color={theme.success}
            />
          </HStack>
        </Card>
        
        {/* Staff Online */}
        <Card
          padding={goldenSpacing.md}
          shadow={goldenShadows.md}
          style={{ height: 55 }}
        >
          <HStack justifyContent="space-between" alignItems="center" flex={1}>
            <Text weight="medium">Staff Online</Text>
            <HStack gap={goldenSpacing.sm}>
              <Text size="large" weight="bold">
                {metrics.staffOnline}
              </Text>
              <Text colorTheme="mutedForeground">
                / {metrics.totalStaff}
              </Text>
            </HStack>
          </HStack>
        </Card>
      </VStack>
      
      {/* Tertiary Metrics - Mini Stats */}
      <VStack gap={goldenSpacing.sm}>
        <MiniStat
          label="Critical"
          value={metrics.critical}
          color={theme.emergency}
          height={34}
        />
        <MiniStat
          label="Urgent"
          value={metrics.urgent}
          color={theme.warning}
          height={34}
        />
        <MiniStat
          label="Standard"
          value={metrics.standard}
          color={theme.info}
          height={34}
        />
        <MiniStat
          label="Resolved"
          value={metrics.resolved}
          color={theme.success}
          height={34}
        />
      </VStack>
    </Grid>
  );
};

// Mini Stat Component
const MiniStat = ({ label, value, color, height }) => (
  <Card
    padding={goldenSpacing.sm}
    style={{
      height,
      borderLeftWidth: 3,
      borderLeftColor: color,
    }}
  >
    <HStack justifyContent="space-between" alignItems="center" flex={1}>
      <Text size="tiny" colorTheme="mutedForeground">
        {label}
      </Text>
      <Text weight="bold">{value}</Text>
    </HStack>
  </Card>
);
```

## 📈 Real-Time Analytics Block

### Design Specifications
```typescript
const AnalyticsBlock = {
  chartHeight: 233,        // Fibonacci
  legendHeight: 34,        // Fibonacci
  controlsHeight: 55,      // Fibonacci
  refreshInterval: 5000,   // 5 seconds
};
```

### Component Structure
```tsx
const RealTimeAnalyticsBlock = ({ data, onTimeRangeChange }) => {
  const [timeRange, setTimeRange] = useState('1h');
  const theme = useTheme();
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.lg}
      shadow={goldenShadows.md}
    >
      {/* Header with Controls */}
      <HStack justifyContent="space-between" alignItems="center" height={55}>
        <VStack gap={goldenSpacing.xs}>
          <Heading4>Alert Trends</Heading4>
          <Text size="small" colorTheme="mutedForeground">
            Real-time monitoring
          </Text>
        </VStack>
        
        <HStack gap={goldenSpacing.md}>
          <SegmentedControl
            value={timeRange}
            onValueChange={setTimeRange}
            options={[
              { label: '1H', value: '1h' },
              { label: '6H', value: '6h' },
              { label: '24H', value: '24h' },
              { label: '7D', value: '7d' },
            ]}
          />
          <Button variant="ghost" size="icon">
            <RefreshIcon />
          </Button>
        </HStack>
      </HStack>
      
      {/* Chart Area */}
      <Box height={233}>
        <AreaChart
          data={data}
          height={233}
          categories={['Critical', 'Urgent', 'Standard']}
          colors={[theme.emergency, theme.warning, theme.info]}
          stacked
          showGrid
          showLegend={false}
          animate={{
            duration: goldenAnimations.normal,
            easing: goldenAnimations.easeGolden,
          }}
        />
      </Box>
      
      {/* Legend */}
      <HStack gap={goldenSpacing.lg} justifyContent="center" height={34}>
        <LegendItem color={theme.emergency} label="Critical" />
        <LegendItem color={theme.warning} label="Urgent" />
        <LegendItem color={theme.info} label="Standard" />
      </HStack>
      
      {/* Quick Stats */}
      <Grid columns="1fr 1fr 1fr" gap={goldenSpacing.md}>
        <StatCard
          label="Peak Hour"
          value={data.peakHour}
          subvalue="+45% alerts"
        />
        <StatCard
          label="Quiet Hour"
          value={data.quietHour}
          subvalue="-62% alerts"
        />
        <StatCard
          label="Trend"
          value={data.trend}
          subvalue="vs yesterday"
        />
      </Grid>
    </Card>
  );
};
```

## 👥 Staff Status Block

### Design Specifications
```typescript
const StaffStatusBlock = {
  layout: 'golden-spiral', // Visual hierarchy
  statusSizes: [89, 55, 34, 21], // Fibonacci
  maxVisible: 8, // Fibonacci
};
```

### Component Structure
```tsx
const StaffStatusBlock = ({ staff, departments }) => {
  const theme = useTheme();
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.lg}
      shadow={goldenShadows.md}
    >
      {/* Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <Heading4>Staff Status</Heading4>
        <Badge variant="success">
          {staff.filter(s => s.status === 'available').length} Available
        </Badge>
      </HStack>
      
      {/* Department Breakdown */}
      <Grid columns="repeat(auto-fit, minmax(144px, 1fr))" gap={goldenSpacing.md}>
        {departments.map((dept) => (
          <DepartmentCard
            key={dept.id}
            department={dept}
            staff={staff.filter(s => s.department === dept.id)}
          />
        ))}
      </Grid>
      
      {/* Individual Staff List */}
      <VStack gap={goldenSpacing.sm}>
        <Text weight="medium">On-Duty Staff</Text>
        <ScrollContainer
          style={{ maxHeight: 377 }} // Fibonacci
          showsVerticalScrollIndicator={false}
        >
          <VStack gap={goldenSpacing.sm}>
            {staff
              .filter(s => s.isOnDuty)
              .map((member, index) => (
                <StaffMemberRow
                  key={member.id}
                  member={member}
                  index={index}
                />
              ))}
          </VStack>
        </ScrollContainer>
      </VStack>
    </Card>
  );
};

// Department Card Component
const DepartmentCard = ({ department, staff }) => {
  const available = staff.filter(s => s.status === 'available').length;
  const busy = staff.filter(s => s.status === 'busy').length;
  const total = staff.length;
  
  return (
    <Card
      padding={goldenSpacing.md}
      gap={goldenSpacing.sm}
      style={{
        height: 89, // Fibonacci
        borderTopWidth: 3,
        borderTopColor: department.color,
      }}
    >
      <Text weight="medium" size="small">
        {department.name}
      </Text>
      <HStack justifyContent="space-between" flex={1}>
        <VStack gap={2}>
          <Text size="large" weight="bold">
            {available}/{total}
          </Text>
          <Text size="tiny" colorTheme="mutedForeground">
            Available
          </Text>
        </VStack>
        <CircularProgress
          value={(available / total) * 100}
          size={34} // Fibonacci
          strokeWidth={3}
          color={department.color}
        />
      </HStack>
    </Card>
  );
};

// Staff Member Row
const StaffMemberRow = ({ member, index }) => {
  const statusColors = {
    available: 'success',
    busy: 'warning',
    break: 'info',
    offline: 'muted',
  };
  
  return (
    <HStack
      gap={goldenSpacing.md}
      padding={goldenSpacing.sm}
      style={{
        opacity: 0,
        animation: `fadeIn ${goldenAnimations.fast}ms ${
          index * goldenAnimations.stagger.fast
        }ms ease-out forwards`,
      }}
    >
      <Avatar size={34} source={member.avatar} />
      <VStack flex={1} gap={2}>
        <Text weight="medium" size="small">
          {member.name}
        </Text>
        <Text size="tiny" colorTheme="mutedForeground">
          {member.role} • {member.department}
        </Text>
      </VStack>
      <Badge
        variant={statusColors[member.status]}
        size="small"
      >
        {member.status}
      </Badge>
      {member.activeAlerts > 0 && (
        <Badge variant="outline" size="small">
          {member.activeAlerts} alerts
        </Badge>
      )}
    </HStack>
  );
};
```

## 🗺️ Alert Heat Map Block

### Design Specifications
```typescript
const AlertHeatMapBlock = {
  mapHeight: 377,     // Golden rectangle
  zoneSize: 55,       // Fibonacci
  legendHeight: 34,   // Fibonacci
};
```

### Component Structure
```tsx
const AlertHeatMapBlock = ({ zones, alerts }) => {
  const theme = useTheme();
  
  // Calculate heat intensity for each zone
  const getZoneIntensity = (zoneId) => {
    const zoneAlerts = alerts.filter(a => a.zoneId === zoneId);
    return Math.min(zoneAlerts.length / 5, 1); // Max intensity at 5 alerts
  };
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.lg}
      shadow={goldenShadows.md}
    >
      {/* Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <VStack gap={goldenSpacing.xs}>
          <Heading4>Alert Distribution</Heading4>
          <Text size="small" colorTheme="mutedForeground">
            Real-time facility overview
          </Text>
        </VStack>
        <Button variant="outline" size="small">
          Full Screen
        </Button>
      </HStack>
      
      {/* Map Container */}
      <Box
        height={377}
        style={{
          backgroundColor: theme.surface,
          borderRadius: goldenSpacing.md,
          overflow: 'hidden',
        }}
      >
        <Grid
          columns="repeat(8, 1fr)" // Hospital layout
          gap={2}
          padding={goldenSpacing.md}
          height="100%"
        >
          {zones.map((zone) => (
            <ZoneTile
              key={zone.id}
              zone={zone}
              intensity={getZoneIntensity(zone.id)}
              alerts={alerts.filter(a => a.zoneId === zone.id)}
            />
          ))}
        </Grid>
      </Box>
      
      {/* Heat Legend */}
      <HStack gap={goldenSpacing.lg} justifyContent="center" height={34}>
        <HStack gap={goldenSpacing.sm}>
          <Box
            width={21}
            height={21}
            style={{
              backgroundColor: theme.success + '20',
              borderRadius: goldenSpacing.xs,
            }}
          />
          <Text size="small">No Alerts</Text>
        </HStack>
        <HStack gap={goldenSpacing.sm}>
          <Box
            width={21}
            height={21}
            style={{
              backgroundColor: theme.warning + '60',
              borderRadius: goldenSpacing.xs,
            }}
          />
          <Text size="small">Moderate</Text>
        </HStack>
        <HStack gap={goldenSpacing.sm}>
          <Box
            width={21}
            height={21}
            style={{
              backgroundColor: theme.emergency,
              borderRadius: goldenSpacing.xs,
            }}
          />
          <Text size="small">High Activity</Text>
        </HStack>
      </HStack>
    </Card>
  );
};

// Zone Tile Component
const ZoneTile = ({ zone, intensity, alerts }) => {
  const theme = useTheme();
  
  const getZoneColor = () => {
    if (intensity === 0) return theme.success + '20';
    if (intensity < 0.5) return theme.warning + `${Math.round(intensity * 120)}`;
    return theme.emergency + `${Math.round(intensity * 100)}`;
  };
  
  return (
    <Button
      variant="ghost"
      style={{
        backgroundColor: getZoneColor(),
        height: 55,
        padding: goldenSpacing.sm,
        position: 'relative',
      }}
    >
      <VStack gap={2} alignItems="center">
        <Text size="tiny" weight="medium">
          {zone.name}
        </Text>
        {alerts.length > 0 && (
          <Badge
            size="small"
            variant="emergency"
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
            }}
          >
            {alerts.length}
          </Badge>
        )}
      </VStack>
    </Button>
  );
};
```

## 📅 Shift Performance Block

### Component Structure
```tsx
const ShiftPerformanceBlock = ({ shifts, currentShift }) => {
  const theme = useTheme();
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.lg}
      shadow={goldenShadows.md}
    >
      {/* Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <Heading4>Shift Performance</Heading4>
        <Badge variant="info">
          {currentShift.name} Shift
        </Badge>
      </HStack>
      
      {/* Performance Metrics */}
      <Grid columns="1fr 1fr" gap={goldenSpacing.md}>
        <PerformanceMetric
          label="Response Time"
          current={currentShift.avgResponse}
          previous={shifts[shifts.length - 2]?.avgResponse}
          format="time"
          target={120} // 2 minutes
        />
        <PerformanceMetric
          label="Resolution Rate"
          current={currentShift.resolutionRate}
          previous={shifts[shifts.length - 2]?.resolutionRate}
          format="percentage"
          target={95}
        />
        <PerformanceMetric
          label="Escalations"
          current={currentShift.escalations}
          previous={shifts[shifts.length - 2]?.escalations}
          format="number"
          target={5}
          inverse // Lower is better
        />
        <PerformanceMetric
          label="Staff Efficiency"
          current={currentShift.efficiency}
          previous={shifts[shifts.length - 2]?.efficiency}
          format="percentage"
          target={85}
        />
      </Grid>
      
      {/* Shift Comparison Chart */}
      <Box height={144}> {/* Fibonacci */}
        <BarChart
          data={shifts}
          categories={['Response Time', 'Resolution Rate', 'Efficiency']}
          height={144}
          horizontal
          showValues
          colors={[theme.primary, theme.success, theme.info]}
        />
      </Box>
    </Card>
  );
};

// Performance Metric Component
const PerformanceMetric = ({ 
  label, 
  current, 
  previous, 
  format, 
  target,
  inverse = false 
}) => {
  const theme = useTheme();
  const improvement = ((current - previous) / previous) * 100;
  const targetMet = inverse ? current <= target : current >= target;
  
  const formatValue = (value) => {
    switch (format) {
      case 'time':
        return `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toString();
    }
  };
  
  return (
    <Card
      padding={goldenSpacing.md}
      gap={goldenSpacing.sm}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: targetMet ? theme.success : theme.warning,
      }}
    >
      <Text size="small" colorTheme="mutedForeground">
        {label}
      </Text>
      <HStack justifyContent="space-between" alignItems="baseline">
        <Text size="large" weight="bold">
          {formatValue(current)}
        </Text>
        <Badge
          variant={improvement > 0 ? "success" : "warning"}
          size="small"
        >
          {improvement > 0 ? '↑' : '↓'} {Math.abs(improvement).toFixed(1)}%
        </Badge>
      </HStack>
      <Progress
        value={current}
        max={target * (inverse ? 2 : 1.2)}
        height={5}
        colorScheme={targetMet ? "success" : "warning"}
      />
    </Card>
  );
};
```

---

*Dashboard blocks provide real-time insights using golden ratio proportions for optimal information hierarchy.*