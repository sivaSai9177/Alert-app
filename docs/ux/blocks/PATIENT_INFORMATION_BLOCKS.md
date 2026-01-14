# Patient Information Blocks - Healthcare UI

## 🏥 Patient Card Block

### Design Specifications
```typescript
// Golden ratio patient card
const PatientCardBlock = {
  dimensions: {
    collapsed: { height: 144 },  // Fibonacci
    expanded: { height: 377 },   // Golden rectangle
  },
  sections: {
    header: 89,      // Basic info
    vitals: 144,     // Vital signs
    history: 144,    // Recent history
  }
};
```

### Component Structure
```tsx
import { 
  Card, VStack, HStack, Avatar, Text, Badge, 
  Heading4, Button, Grid, Separator 
} from '@/components/universal';
import { goldenSpacing, goldenShadows } from '@/lib/design-system';

const PatientCardBlock = ({ patient, onViewDetails, expanded = false }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  return (
    <Card
      padding={goldenSpacing.xl}
      shadow={goldenShadows.md}
      style={{
        height: isExpanded ? 377 : 144,
        transition: `height ${goldenAnimations.normal}ms ${goldenAnimations.easeGolden}`,
      }}
    >
      {/* Header Section - Always Visible */}
      <HStack gap={goldenSpacing.lg} height={89}>
        <Avatar
          size={89}
          source={patient.photo}
          fallback={patient.initials}
        />
        
        <VStack flex={1} gap={goldenSpacing.sm}>
          <HStack justifyContent="space-between">
            <Heading4>{patient.name}</Heading4>
            <HStack gap={goldenSpacing.sm}>
              {patient.alerts.map(alert => (
                <AlertIndicator
                  key={alert.id}
                  type={alert.type}
                  priority={alert.priority}
                />
              ))}
            </HStack>
          </HStack>
          
          <HStack gap={goldenSpacing.md}>
            <Text colorTheme="mutedForeground">
              {patient.age}yo • {patient.gender}
            </Text>
            <Separator orientation="vertical" height={13} />
            <Text size="small">
              MRN: {patient.mrn}
            </Text>
            <Separator orientation="vertical" height={13} />
            <Text size="small">
              Room {patient.room}
            </Text>
          </HStack>
          
          <HStack gap={goldenSpacing.sm}>
            <Badge variant="outline" size="small">
              {patient.department}
            </Badge>
            {patient.primaryCondition && (
              <Badge variant="info" size="small">
                {patient.primaryCondition}
              </Badge>
            )}
            {patient.flags.dnr && (
              <Badge variant="warning" size="small">
                DNR
              </Badge>
            )}
          </HStack>
        </VStack>
        
        <Button
          variant="ghost"
          size="icon"
          onPress={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '⌃' : '⌄'}
        </Button>
      </HStack>
      
      {/* Expanded Content */}
      {isExpanded && (
        <>
          <Separator marginVertical={goldenSpacing.lg} />
          
          {/* Vital Signs Section */}
          <VStack gap={goldenSpacing.md}>
            <Text weight="medium">Current Vitals</Text>
            <Grid columns="repeat(auto-fit, minmax(89px, 1fr))" gap={goldenSpacing.md}>
              <VitalSign
                label="HR"
                value={patient.vitals.heartRate}
                unit="bpm"
                status={getVitalStatus(patient.vitals.heartRate, 'hr')}
              />
              <VitalSign
                label="BP"
                value={`${patient.vitals.bp.systolic}/${patient.vitals.bp.diastolic}`}
                unit="mmHg"
                status={getVitalStatus(patient.vitals.bp, 'bp')}
              />
              <VitalSign
                label="O₂"
                value={patient.vitals.oxygen}
                unit="%"
                status={getVitalStatus(patient.vitals.oxygen, 'o2')}
              />
              <VitalSign
                label="Temp"
                value={patient.vitals.temperature}
                unit="°F"
                status={getVitalStatus(patient.vitals.temperature, 'temp')}
              />
              <VitalSign
                label="RR"
                value={patient.vitals.respRate}
                unit="/min"
                status={getVitalStatus(patient.vitals.respRate, 'rr')}
              />
            </Grid>
          </VStack>
          
          {/* Quick Actions */}
          <HStack gap={goldenSpacing.md} marginTop={goldenSpacing.lg}>
            <Button
              variant="primary"
              style={{ flex: 1.618 }}
              onPress={() => onViewDetails(patient.id)}
            >
              View Full Chart
            </Button>
            <Button
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => onContactDoctor(patient.id)}
            >
              Contact Doctor
            </Button>
            <Button
              variant="ghost"
              style={{ flex: 0.618 }}
              onPress={() => onMoreOptions(patient.id)}
            >
              •••
            </Button>
          </HStack>
        </>
      )}
    </Card>
  );
};

// Vital Sign Component
const VitalSign = ({ label, value, unit, status }) => {
  const statusColors = {
    normal: 'success',
    warning: 'warning',
    critical: 'emergency',
  };
  
  return (
    <Card
      padding={goldenSpacing.md}
      style={{
        height: 55, // Fibonacci
        borderBottomWidth: 3,
        borderBottomColor: theme[statusColors[status]],
      }}
    >
      <VStack gap={2} alignItems="center">
        <Text size="tiny" colorTheme="mutedForeground">
          {label}
        </Text>
        <HStack gap={2} alignItems="baseline">
          <Text weight="bold" size="large">
            {value}
          </Text>
          <Text size="tiny" colorTheme="mutedForeground">
            {unit}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
};
```

## 📊 Patient History Timeline Block

### Design Specifications
```typescript
const PatientTimelineBlock = {
  itemHeight: 89,        // Fibonacci per item
  maxVisible: 8,         // Fibonacci
  groupByPeriod: true,
  virtualScroll: true,
};
```

### Component Structure
```tsx
const PatientHistoryTimeline = ({ patientId, events, onEventClick }) => {
  const theme = useTheme();
  const groupedEvents = groupEventsByDay(events);
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.lg}
      shadow={goldenShadows.md}
    >
      {/* Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <Heading4>Patient History</Heading4>
        <HStack gap={goldenSpacing.md}>
          <FilterChips
            options={['All', 'Medical', 'Nursing', 'Labs', 'Vitals']}
            selected={filter}
            onSelect={setFilter}
          />
          <Button variant="outline" size="small">
            Export
          </Button>
        </HStack>
      </HStack>
      
      {/* Timeline */}
      <ScrollContainer
        style={{ maxHeight: 610 }} // Fibonacci
        showsVerticalScrollIndicator={false}
      >
        <VStack gap={goldenSpacing.xl}>
          {Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <VStack key={date} gap={goldenSpacing.lg}>
              {/* Date Header */}
              <HStack gap={goldenSpacing.md} alignItems="center">
                <Box
                  width={89}
                  padding={goldenSpacing.sm}
                  style={{
                    backgroundColor: theme.primary + '10',
                    borderRadius: goldenSpacing.sm,
                  }}
                >
                  <Text size="small" weight="medium" textAlign="center">
                    {formatDate(date)}
                  </Text>
                </Box>
                <Separator flex={1} />
              </HStack>
              
              {/* Events for this day */}
              <VStack gap={goldenSpacing.md} paddingLeft={goldenSpacing.xl}>
                {dayEvents.map((event, index) => (
                  <TimelineEvent
                    key={event.id}
                    event={event}
                    index={index}
                    onPress={() => onEventClick(event)}
                  />
                ))}
              </VStack>
            </VStack>
          ))}
        </VStack>
      </ScrollContainer>
    </Card>
  );
};

// Timeline Event Component
const TimelineEvent = ({ event, index, onPress }) => {
  const theme = useTheme();
  const eventTypeColors = {
    medical: theme.primary,
    nursing: theme.info,
    lab: theme.success,
    vital: theme.warning,
    alert: theme.emergency,
  };
  
  return (
    <HStack
      gap={goldenSpacing.md}
      style={{
        opacity: 0,
        animation: `slideIn ${goldenAnimations.fast}ms ${
          index * goldenAnimations.stagger.fast
        }ms ease-out forwards`,
      }}
    >
      {/* Timeline Node */}
      <VStack alignItems="center">
        <Box
          width={21}
          height={21}
          style={{
            backgroundColor: eventTypeColors[event.type],
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text size="tiny" colorTheme="inverse">
            {event.icon}
          </Text>
        </Box>
        {index < events.length - 1 && (
          <Box
            width={2}
            flex={1}
            style={{
              backgroundColor: theme.border,
              marginTop: goldenSpacing.xs,
            }}
          />
        )}
      </VStack>
      
      {/* Event Content */}
      <Card
        flex={1}
        padding={goldenSpacing.md}
        gap={goldenSpacing.sm}
        onPress={onPress}
        style={{ minHeight: 89 }}
      >
        <HStack justifyContent="space-between">
          <Text weight="medium">{event.title}</Text>
          <Text size="small" colorTheme="mutedForeground">
            {formatTime(event.timestamp)}
          </Text>
        </HStack>
        <Text size="small" numberOfLines={2}>
          {event.description}
        </Text>
        <HStack gap={goldenSpacing.sm}>
          <Badge size="small" variant="outline">
            {event.type}
          </Badge>
          <Text size="tiny" colorTheme="mutedForeground">
            by {event.author}
          </Text>
        </HStack>
      </Card>
    </HStack>
  );
};
```

## 💊 Medication Management Block

### Design Specifications
```typescript
const MedicationBlock = {
  layout: 'schedule-based',
  timeSlots: [8, 12, 16, 20], // Hours
  cardHeight: 89,              // Fibonacci
};
```

### Component Structure
```tsx
const MedicationManagementBlock = ({ patient, medications, onAdminister }) => {
  const theme = useTheme();
  const now = new Date().getHours();
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.lg}
      shadow={goldenShadows.md}
    >
      {/* Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <VStack gap={goldenSpacing.xs}>
          <Heading4>Medications</Heading4>
          <Text size="small" colorTheme="mutedForeground">
            {medications.filter(m => m.administered).length}/{medications.length} administered today
          </Text>
        </VStack>
        <Button variant="outline" size="small">
          Add Medication
        </Button>
      </HStack>
      
      {/* Current/Next Dose Alert */}
      {getNextDose(medications) && (
        <Alert
          variant="info"
          icon="💊"
          title="Next Dose"
          description={`${getNextDose(medications).name} due at ${formatTime(getNextDose(medications).time)}`}
        />
      )}
      
      {/* Medication Schedule */}
      <VStack gap={goldenSpacing.lg}>
        {groupMedicationsByTime(medications).map(([time, meds]) => (
          <VStack key={time} gap={goldenSpacing.md}>
            <HStack gap={goldenSpacing.md} alignItems="center">
              <Badge
                variant={time <= now ? "default" : "outline"}
                size="small"
              >
                {formatTime(time)}
              </Badge>
              <Separator flex={1} />
              {time <= now && (
                <Text size="tiny" colorTheme="mutedForeground">
                  {meds.filter(m => m.administered).length}/{meds.length} given
                </Text>
              )}
            </HStack>
            
            <VStack gap={goldenSpacing.sm}>
              {meds.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onAdminister={onAdminister}
                  isPastDue={time < now && !medication.administered}
                />
              ))}
            </VStack>
          </VStack>
        ))}
      </VStack>
    </Card>
  );
};

// Medication Card Component
const MedicationCard = ({ medication, onAdminister, isPastDue }) => {
  const theme = useTheme();
  
  return (
    <Card
      padding={goldenSpacing.md}
      style={{
        height: 89,
        borderLeftWidth: 3,
        borderLeftColor: isPastDue ? theme.emergency : 
                        medication.administered ? theme.success : 
                        theme.border,
        opacity: medication.administered ? 0.7 : 1,
      }}
    >
      <HStack gap={goldenSpacing.md} alignItems="center">
        <VStack flex={1} gap={goldenSpacing.xs}>
          <HStack gap={goldenSpacing.sm}>
            <Text weight="medium">{medication.name}</Text>
            {medication.isPRN && (
              <Badge size="small" variant="info">PRN</Badge>
            )}
          </HStack>
          <Text size="small">
            {medication.dose} • {medication.route}
          </Text>
          {medication.instructions && (
            <Text size="tiny" colorTheme="mutedForeground">
              {medication.instructions}
            </Text>
          )}
        </VStack>
        
        {!medication.administered ? (
          <Button
            variant={isPastDue ? "emergency" : "primary"}
            size="small"
            onPress={() => onAdminister(medication.id)}
          >
            Administer
          </Button>
        ) : (
          <VStack alignItems="flex-end" gap={2}>
            <Badge variant="success" size="small">
              ✓ Given
            </Badge>
            <Text size="tiny" colorTheme="mutedForeground">
              {formatTime(medication.administeredAt)}
            </Text>
          </VStack>
        )}
      </HStack>
    </Card>
  );
};
```

## 📈 Vital Signs Trend Block

### Design Specifications
```typescript
const VitalSignsTrendBlock = {
  chartHeight: 233,     // Fibonacci
  timeRanges: [1, 6, 24, 72], // Hours
  refreshInterval: 60000, // 1 minute
};
```

### Component Structure
```tsx
const VitalSignsTrendBlock = ({ patient, vitals, timeRange = 6 }) => {
  const theme = useTheme();
  const [selectedVital, setSelectedVital] = useState('heartRate');
  
  const vitalConfigs = {
    heartRate: {
      label: 'Heart Rate',
      unit: 'bpm',
      color: theme.emergency,
      normalRange: [60, 100],
    },
    bloodPressure: {
      label: 'Blood Pressure',
      unit: 'mmHg',
      color: theme.primary,
      normalRange: { systolic: [90, 140], diastolic: [60, 90] },
    },
    oxygen: {
      label: 'O₂ Saturation',
      unit: '%',
      color: theme.info,
      normalRange: [95, 100],
    },
    temperature: {
      label: 'Temperature',
      unit: '°F',
      color: theme.warning,
      normalRange: [97, 99.5],
    },
  };
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.lg}
      shadow={goldenShadows.md}
    >
      {/* Header with Controls */}
      <VStack gap={goldenSpacing.md}>
        <HStack justifyContent="space-between" alignItems="center">
          <Heading4>Vital Signs Trends</Heading4>
          <HStack gap={goldenSpacing.md}>
            <SegmentedControl
              value={timeRange}
              onValueChange={setTimeRange}
              options={[
                { label: '1H', value: 1 },
                { label: '6H', value: 6 },
                { label: '24H', value: 24 },
                { label: '3D', value: 72 },
              ]}
            />
          </HStack>
        </HStack>
        
        {/* Vital Selector */}
        <ScrollContainer horizontal showsHorizontalScrollIndicator={false}>
          <HStack gap={goldenSpacing.md}>
            {Object.entries(vitalConfigs).map(([key, config]) => (
              <Button
                key={key}
                variant={selectedVital === key ? "default" : "outline"}
                size="small"
                onPress={() => setSelectedVital(key)}
                style={{
                  borderColor: config.color,
                  backgroundColor: selectedVital === key ? config.color : 'transparent',
                }}
              >
                {config.label}
              </Button>
            ))}
          </HStack>
        </ScrollContainer>
      </VStack>
      
      {/* Chart Area */}
      <Box height={233} position="relative">
        <LineChart
          data={vitals[selectedVital]}
          height={233}
          color={vitalConfigs[selectedVital].color}
          showGrid
          showArea
          normalRange={vitalConfigs[selectedVital].normalRange}
          animate={{
            duration: goldenAnimations.normal,
            easing: goldenAnimations.easeGolden,
          }}
        />
        
        {/* Current Value Overlay */}
        <Box
          position="absolute"
          top={goldenSpacing.md}
          right={goldenSpacing.md}
          padding={goldenSpacing.md}
          style={{
            backgroundColor: theme.surface + 'EE',
            borderRadius: goldenSpacing.sm,
            ...goldenShadows.sm,
          }}
        >
          <VStack gap={2} alignItems="flex-end">
            <Text size="small" colorTheme="mutedForeground">
              Current
            </Text>
            <HStack gap={goldenSpacing.xs} alignItems="baseline">
              <Text size="large" weight="bold">
                {getCurrentValue(vitals[selectedVital])}
              </Text>
              <Text size="small">
                {vitalConfigs[selectedVital].unit}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </Box>
      
      {/* Quick Stats */}
      <Grid columns="1fr 1fr 1fr" gap={goldenSpacing.md}>
        <StatCard
          label="Average"
          value={calculateAverage(vitals[selectedVital])}
          unit={vitalConfigs[selectedVital].unit}
        />
        <StatCard
          label="Min/Max"
          value={`${getMin(vitals[selectedVital])}/${getMax(vitals[selectedVital])}`}
          unit={vitalConfigs[selectedVital].unit}
        />
        <StatCard
          label="Trend"
          value={getTrend(vitals[selectedVital])}
          unit=""
          color={getTrendColor(getTrend(vitals[selectedVital]))}
        />
      </Grid>
    </Card>
  );
};
```

## 🩺 Treatment Plan Block

### Component Structure
```tsx
const TreatmentPlanBlock = ({ patient, treatments, onUpdateStatus }) => {
  const theme = useTheme();
  const activeCount = treatments.filter(t => t.status === 'active').length;
  const completedCount = treatments.filter(t => t.status === 'completed').length;
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.lg}
      shadow={goldenShadows.md}
    >
      {/* Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <VStack gap={goldenSpacing.xs}>
          <Heading4>Treatment Plan</Heading4>
          <HStack gap={goldenSpacing.md}>
            <Badge variant="info">{activeCount} Active</Badge>
            <Badge variant="success">{completedCount} Completed</Badge>
          </HStack>
        </VStack>
        <Button variant="outline" size="small">
          Add Treatment
        </Button>
      </HStack>
      
      {/* Treatment Categories */}
      <VStack gap={goldenSpacing.lg}>
        {groupTreatmentsByCategory(treatments).map(([category, items]) => (
          <VStack key={category} gap={goldenSpacing.md}>
            <Text weight="medium" colorTheme="mutedForeground">
              {category}
            </Text>
            <VStack gap={goldenSpacing.sm}>
              {items.map((treatment) => (
                <TreatmentItem
                  key={treatment.id}
                  treatment={treatment}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
            </VStack>
          </VStack>
        ))}
      </VStack>
    </Card>
  );
};

// Treatment Item Component
const TreatmentItem = ({ treatment, onUpdateStatus }) => {
  const theme = useTheme();
  const statusColors = {
    pending: theme.muted,
    active: theme.info,
    completed: theme.success,
    cancelled: theme.error,
  };
  
  return (
    <Card
      padding={goldenSpacing.md}
      gap={goldenSpacing.sm}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: statusColors[treatment.status],
        opacity: treatment.status === 'completed' ? 0.7 : 1,
      }}
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        <VStack flex={1} gap={goldenSpacing.xs}>
          <Text weight="medium">{treatment.name}</Text>
          <Text size="small" colorTheme="mutedForeground">
            {treatment.description}
          </Text>
          <HStack gap={goldenSpacing.sm}>
            <Text size="tiny">
              Started: {formatDate(treatment.startDate)}
            </Text>
            {treatment.endDate && (
              <Text size="tiny">
                Ends: {formatDate(treatment.endDate)}
              </Text>
            )}
          </HStack>
        </VStack>
        
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon">
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onPress={() => onUpdateStatus(treatment.id, 'active')}>
              Mark Active
            </DropdownMenuItem>
            <DropdownMenuItem onPress={() => onUpdateStatus(treatment.id, 'completed')}>
              Mark Completed
            </DropdownMenuItem>
            <DropdownMenuItem onPress={() => onViewDetails(treatment.id)}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </HStack>
    </Card>
  );
};
```

---

*Patient information blocks provide comprehensive, at-a-glance views using golden ratio proportions for optimal readability.*