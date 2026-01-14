# Alert Management Blocks - Healthcare UI

## 🚨 Alert Creation Block

### Design Specifications
```typescript
// Golden ratio proportions
const AlertCreationBlock = {
  dimensions: {
    mobile: { width: '100%', height: 377 },  // Golden rectangle
    tablet: { width: 610, height: 377 },
    desktop: { width: 987, height: 610 },
  },
  spacing: {
    padding: 21,      // Fibonacci
    sectionGap: 34,   // Fibonacci
    itemGap: 13,      // Fibonacci
  }
};
```

### Component Structure
```tsx
import { 
  Container, VStack, HStack, Card, Button, 
  Input, Select, Badge, Text, Heading3 
} from '@/components/universal';
import { goldenSpacing, goldenShadows } from '@/lib/design-system';

const AlertCreationBlock = () => {
  const theme = useTheme();
  const { spacing } = useSpacingContext();
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.xxl}
      shadow={goldenShadows.lg}
      style={{
        minHeight: 377, // Golden rectangle
        backgroundColor: theme.emergency + '10', // 10% opacity
      }}
    >
      {/* Header Section - 55px */}
      <VStack gap={goldenSpacing.md} height={55}>
        <Heading3 colorTheme="emergency">Create Medical Alert</Heading3>
        <Text colorTheme="mutedForeground" size="small">
          All fields marked with * are required
        </Text>
      </VStack>
      
      {/* Form Section - 233px (Golden ratio) */}
      <VStack gap={goldenSpacing.lg} flex={1.618}>
        {/* Room Number - Quick Entry */}
        <HStack gap={goldenSpacing.md} alignItems="flex-end">
          <Input
            label="Room Number *"
            placeholder="302"
            keyboardType="numeric"
            maxLength={3}
            style={{ flex: 0.618 }}
            size="large"
            autoFocus
          />
          <Badge size="large" variant="outline">
            West Wing
          </Badge>
        </HStack>
        
        {/* Alert Type Grid - Golden proportions */}
        <VStack gap={goldenSpacing.sm}>
          <Text weight="medium">Alert Type *</Text>
          <Grid columns="1fr 1fr" gap={goldenSpacing.md}>
            <AlertTypeButton
              type="cardiac"
              icon="🫀"
              label="Cardiac Arrest"
              color={theme.emergency}
            />
            <AlertTypeButton
              type="code-blue"
              icon="🔵"
              label="Code Blue"
              color={theme.active}
            />
            <AlertTypeButton
              type="fall"
              icon="🦴"
              label="Patient Fall"
              color={theme.warning}
            />
            <AlertTypeButton
              type="fire"
              icon="🔥"
              label="Fire Alert"
              color={theme.urgent}
            />
          </Grid>
        </VStack>
        
        {/* Urgency Slider */}
        <VStack gap={goldenSpacing.sm}>
          <HStack justifyContent="space-between">
            <Text weight="medium">Urgency Level</Text>
            <Badge variant="default">Auto-set: Critical</Badge>
          </HStack>
          <UrgencySlider defaultValue={5} />
        </VStack>
        
        {/* Optional Details */}
        <VStack gap={goldenSpacing.sm}>
          <Text weight="medium">Additional Details (Optional)</Text>
          <HStack gap={goldenSpacing.md}>
            <Input
              placeholder="Type or use voice..."
              multiline
              numberOfLines={2}
              style={{ flex: 1 }}
            />
            <Button
              variant="outline"
              size="icon"
              onPress={startVoiceRecording}
            >
              🎤
            </Button>
          </HStack>
        </VStack>
      </VStack>
      
      {/* Action Section - 89px */}
      <HStack gap={goldenSpacing.md} height={89} alignItems="center">
        <Button
          size="large"
          variant="emergency"
          style={{ flex: 1.618 }}
          onPress={handleCreateAlert}
        >
          Send Alert →
        </Button>
        <Button
          size="large"
          variant="outline"
          style={{ flex: 1 }}
          onPress={handleCancel}
        >
          Cancel
        </Button>
      </HStack>
    </Card>
  );
};

// Alert Type Button Component
const AlertTypeButton = ({ type, icon, label, color, selected, onPress }) => {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      style={{
        height: 89, // Fibonacci
        backgroundColor: selected ? color : 'transparent',
        borderColor: color,
        borderWidth: 2,
      }}
      onPress={onPress}
    >
      <VStack gap={goldenSpacing.sm} alignItems="center">
        <Text size={34}>{icon}</Text>
        <Text size="small" weight="medium">
          {label}
        </Text>
      </VStack>
    </Button>
  );
};
```

## 📋 Alert List Block

### Design Specifications
```typescript
const AlertListBlock = {
  cardHeight: 144,     // Fibonacci
  cardSpacing: 13,     // Fibonacci
  maxVisible: 5,       // Fibonacci
  scrollBehavior: 'smooth',
  virtualScroll: true, // For performance
};
```

### Component Structure
```tsx
const AlertListBlock = ({ alerts, onAcknowledge, onViewDetails }) => {
  const theme = useTheme();
  
  return (
    <VStack gap={goldenSpacing.lg}>
      {/* Header with count */}
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap={goldenSpacing.md}>
          <Heading4>Active Alerts</Heading4>
          <Badge size="large" variant="emergency">
            {alerts.length}
          </Badge>
        </HStack>
        <Button variant="ghost" size="small">
          Filter ▼
        </Button>
      </HStack>
      
      {/* Alert Cards */}
      <ScrollContainer
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: goldenSpacing.md }}
      >
        {alerts.map((alert, index) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            index={index}
            onAcknowledge={onAcknowledge}
            onViewDetails={onViewDetails}
          />
        ))}
      </ScrollContainer>
    </VStack>
  );
};

// Individual Alert Card
const AlertCard = ({ alert, index, onAcknowledge, onViewDetails }) => {
  const theme = useTheme();
  const animationDelay = index * goldenAnimations.stagger.fast; // 34ms
  
  return (
    <Card
      padding={goldenSpacing.lg}
      gap={goldenSpacing.md}
      shadow={alert.priority > 3 ? goldenShadows.xl : goldenShadows.md}
      style={{
        height: 144, // Fibonacci
        borderLeftWidth: 5,
        borderLeftColor: getAlertColor(alert.type),
        animation: `slideIn ${goldenAnimations.normal}ms ${animationDelay}ms ease-out`,
      }}
    >
      {/* Alert Header - 34px */}
      <HStack justifyContent="space-between" alignItems="center" height={34}>
        <HStack gap={goldenSpacing.sm}>
          <Badge variant={getAlertVariant(alert.type)}>
            {alert.type}
          </Badge>
          <Text weight="bold">Room {alert.room}</Text>
        </HStack>
        <EscalationTimer startTime={alert.createdAt} />
      </HStack>
      
      {/* Alert Content - 55px */}
      <VStack gap={goldenSpacing.xs} flex={1}>
        <Text numberOfLines={2}>{alert.description}</Text>
        <HStack gap={goldenSpacing.sm}>
          <Text size="small" colorTheme="mutedForeground">
            {alert.department}
          </Text>
          {alert.acknowledgedBy && (
            <Badge size="small" variant="success">
              ✓ {alert.acknowledgedBy}
            </Badge>
          )}
        </HStack>
      </VStack>
      
      {/* Actions - 34px */}
      <HStack gap={goldenSpacing.md} height={34}>
        {!alert.acknowledged ? (
          <Button
            size="medium"
            variant="primary"
            style={{ flex: 1.618 }}
            onPress={() => onAcknowledge(alert.id)}
          >
            Acknowledge
          </Button>
        ) : (
          <Button
            size="medium"
            variant="success"
            style={{ flex: 1.618 }}
            disabled
          >
            ✓ Acknowledged
          </Button>
        )}
        <Button
          size="medium"
          variant="outline"
          style={{ flex: 1 }}
          onPress={() => onViewDetails(alert.id)}
        >
          Details
        </Button>
      </HStack>
    </Card>
  );
};
```

## 🔔 Alert Detail Block

### Design Specifications
```typescript
const AlertDetailBlock = {
  sections: {
    header: 89,      // Fibonacci
    patient: 144,    // Fibonacci
    timeline: 233,   // Fibonacci
    actions: 89,     // Fibonacci
  },
  totalHeight: 555,  // Sum of sections
};
```

### Component Structure
```tsx
const AlertDetailBlock = ({ alert }) => {
  const theme = useTheme();
  
  return (
    <Container scroll={false}>
      <VStack gap={0} style={{ minHeight: 555 }}>
        {/* Critical Alert Header - 89px */}
        <Box
          height={89}
          padding={goldenSpacing.xl}
          style={{
            backgroundColor: getAlertColor(alert.type),
          }}
        >
          <VStack gap={goldenSpacing.sm} justifyContent="center" flex={1}>
            <HStack justifyContent="space-between">
              <Heading3 colorTheme="inverse">
                {alert.type} - Room {alert.room}
              </Heading3>
              <EscalationBadge timeElapsed={alert.timeElapsed} />
            </HStack>
            <Text colorTheme="inverse" opacity={0.9}>
              {alert.department} • Priority {alert.priority}/5
            </Text>
          </VStack>
        </Box>
        
        {/* Patient Information - 144px */}
        <Card
          padding={goldenSpacing.xl}
          margin={goldenSpacing.lg}
          height={144}
          shadow={goldenShadows.md}
        >
          <HStack gap={goldenSpacing.lg}>
            <Avatar size={89} source={alert.patient.photo} />
            <VStack gap={goldenSpacing.sm} flex={1}>
              <Heading4>{alert.patient.name}</Heading4>
              <Text>{alert.patient.age}yo • {alert.patient.gender}</Text>
              <Text size="small">MRN: {alert.patient.mrn}</Text>
              <HStack gap={goldenSpacing.sm}>
                <Badge variant="warning">Allergic: Penicillin</Badge>
                <Badge variant="info">DNR: No</Badge>
              </HStack>
            </VStack>
          </HStack>
        </Card>
        
        {/* Response Timeline - 233px */}
        <Card
          padding={goldenSpacing.xl}
          marginHorizontal={goldenSpacing.lg}
          height={233}
          shadow={goldenShadows.sm}
        >
          <VStack gap={goldenSpacing.lg}>
            <Heading5>Response Timeline</Heading5>
            <Timeline
              items={[
                {
                  time: alert.createdAt,
                  event: 'Alert created by ' + alert.createdBy,
                  icon: '🚨',
                },
                {
                  time: alert.acknowledgedAt,
                  event: 'Acknowledged by ' + alert.acknowledgedBy,
                  icon: '✓',
                },
                {
                  time: 'Now',
                  event: 'Awaiting resolution',
                  icon: '⏳',
                  active: true,
                },
              ]}
            />
          </VStack>
        </Card>
        
        {/* Action Buttons - 89px */}
        <Box
          height={89}
          padding={goldenSpacing.xl}
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <HStack gap={goldenSpacing.md} flex={1}>
            <Button
              size="large"
              variant="success"
              style={{ flex: 1.618 }}
              onPress={handleResolve}
            >
              Resolve Alert
            </Button>
            <Button
              size="large"
              variant="outline"
              style={{ flex: 1 }}
              onPress={handleEscalate}
            >
              Escalate
            </Button>
            <Button
              size="large"
              variant="ghost"
              style={{ flex: 0.618 }}
              onPress={handleMore}
            >
              •••
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
};
```

## ⏱️ Escalation Timer Block

### Component Structure
```tsx
const EscalationTimer = ({ startTime, escalationThreshold = 300 }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const theme = useTheme();
  
  // Calculate urgency level
  const urgencyLevel = Math.min(
    Math.floor(timeElapsed / (escalationThreshold / 5)),
    5
  );
  
  const getTimerColor = () => {
    if (urgencyLevel <= 2) return theme.success;
    if (urgencyLevel <= 3) return theme.warning;
    return theme.emergency;
  };
  
  return (
    <Box
      padding={goldenSpacing.md}
      style={{
        minWidth: 89, // Fibonacci
        backgroundColor: getTimerColor() + '20',
        borderRadius: goldenSpacing.sm,
      }}
    >
      <VStack alignItems="center" gap={goldenSpacing.xs}>
        <Text
          size={21} // Fibonacci
          weight="bold"
          colorTheme={urgencyLevel > 3 ? 'emergency' : 'default'}
        >
          {formatTime(timeElapsed)}
        </Text>
        {urgencyLevel > 3 && (
          <Text size="tiny" colorTheme="emergency">
            ESCALATING
          </Text>
        )}
      </VStack>
    </Box>
  );
};
```

## 🎯 Quick Alert Templates Block

### Component Structure
```tsx
const QuickAlertTemplates = ({ onSelectTemplate }) => {
  const templates = [
    { id: 'cardiac', icon: '🫀', label: 'Cardiac', color: '#DC2626' },
    { id: 'code-blue', icon: '🔵', label: 'Code Blue', color: '#3B82F6' },
    { id: 'fall', icon: '🦴', label: 'Fall', color: '#F59E0B' },
    { id: 'fire', icon: '🔥', label: 'Fire', color: '#EF4444' },
    { id: 'security', icon: '🚔', label: 'Security', color: '#6366F1' },
  ];
  
  return (
    <VStack gap={goldenSpacing.md}>
      <Text weight="medium">Quick Alert Templates</Text>
      <ScrollContainer horizontal showsHorizontalScrollIndicator={false}>
        <HStack gap={goldenSpacing.md}>
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              style={{
                width: 89,  // Fibonacci
                height: 89, // Square
                borderColor: template.color,
              }}
              onPress={() => onSelectTemplate(template)}
            >
              <VStack gap={goldenSpacing.sm} alignItems="center">
                <Text size={34}>{template.icon}</Text>
                <Text size="tiny" numberOfLines={1}>
                  {template.label}
                </Text>
              </VStack>
            </Button>
          ))}
        </HStack>
      </ScrollContainer>
    </VStack>
  );
};
```

---

*These alert management blocks follow golden ratio proportions for visual harmony while maintaining healthcare-specific functionality.*