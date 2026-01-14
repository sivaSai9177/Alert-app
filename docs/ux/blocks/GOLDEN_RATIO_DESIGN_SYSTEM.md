# Golden Ratio Design System for Healthcare Blocks

## 🌟 Golden Ratio Foundation

### Mathematical Basis
```
φ (phi) = 1.618033988749...
Golden Ratio = a/b = (a+b)/a = 1.618

Fibonacci Sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...
Ratios: 1/1, 2/1, 3/2, 5/3, 8/5, 13/8, 21/13, 34/21...
```

## 📐 Golden Ratio Spacing System

### Base Unit: 8px
```typescript
export const goldenSpacing = {
  // Fibonacci-based scale
  xxs: 2,    // 2px - Micro spacing
  xs: 3,     // 3px - Hairline
  sm: 5,     // 5px - Tight
  md: 8,     // 8px - Base unit
  lg: 13,    // 13px - Comfortable
  xl: 21,    // 21px - Spacious
  xxl: 34,   // 34px - Section spacing
  xxxl: 55,  // 55px - Major sections
  huge: 89,  // 89px - Page sections
  
  // Golden multipliers
  golden: (base: number) => Math.round(base * 1.618),
  goldenInverse: (base: number) => Math.round(base / 1.618),
};

// Responsive scaling with golden ratio
export const responsiveGoldenSpacing = {
  mobile: 1,
  tablet: 1.618,
  desktop: 2.618, // φ²
  large: 4.236,   // φ³
};
```

## 🎨 Golden Typography Scale

### Type Scale Using Golden Ratio
```typescript
export const goldenTypography = {
  // Base font size: 16px
  base: 16,
  
  // Scale up (multiply by φ)
  h6: 16,     // 16px - Base
  h5: 26,     // 16 × 1.618 = 25.888px
  h4: 42,     // 26 × 1.618 = 42.068px
  h3: 68,     // 42 × 1.618 = 67.956px
  h2: 110,    // 68 × 1.618 = 110.024px
  h1: 178,    // 110 × 1.618 = 177.98px
  
  // Scale down (divide by φ)
  body: 16,   // 16px
  small: 10,  // 16 ÷ 1.618 = 9.888px
  tiny: 6,    // 10 ÷ 1.618 = 6.180px
  
  // Line heights using golden ratio
  lineHeight: {
    tight: 1.25,     // 1 + (1/φ²)
    normal: 1.618,   // φ
    relaxed: 2.618,  // φ²
  }
};
```

## 📦 Golden Block Dimensions

### Card Proportions
```typescript
export const goldenCards = {
  // Width : Height ratios
  landscape: {
    width: 377,  // Fibonacci number
    height: 233, // 377 ÷ 1.618
  },
  portrait: {
    width: 233,
    height: 377,
  },
  square: {
    width: 233,
    height: 233,
  },
  
  // Responsive cards
  responsive: (containerWidth: number) => ({
    width: containerWidth,
    height: Math.round(containerWidth / 1.618),
  }),
};
```

## 🏥 Healthcare Block Specifications

### 1. Alert Card Block (Golden Rectangle)
```tsx
const AlertCardBlock = () => {
  const goldenHeight = 233; // px
  const goldenWidth = 377;  // px (233 × 1.618)
  
  return (
    <Card
      style={{
        width: goldenWidth,
        height: goldenHeight,
        padding: goldenSpacing.lg, // 13px
        gap: goldenSpacing.md,     // 8px
      }}
    >
      {/* Header section: 89px (Fibonacci) */}
      <Box height={89}>
        <HStack spacing={goldenSpacing.md}>
          <Badge size={34}>{/* Icon: 34px (Fibonacci) */}</Badge>
          <VStack flex={1}>
            <Heading5>Alert Type</Heading5>
            <Text size="small">Room 302</Text>
          </VStack>
          <Timer size={55}>{/* Timer: 55px (Fibonacci) */}</Timer>
        </HStack>
      </Box>
      
      {/* Content section: 89px */}
      <Box height={89} gap={goldenSpacing.sm}>
        <Text>Patient information and alert details...</Text>
      </Box>
      
      {/* Action section: 55px (Fibonacci) */}
      <HStack height={55} gap={goldenSpacing.md}>
        <Button flex={1.618}>Acknowledge</Button>
        <Button flex={1}>Details</Button>
      </HStack>
    </Card>
  );
};
```

### 2. Dashboard Metrics Block (Golden Spiral)
```tsx
const MetricsBlock = () => {
  // Golden spiral dimensions
  const sizes = [144, 89, 55, 34, 21, 13];
  
  return (
    <Grid
      columns="1.618fr 1fr 0.618fr" // Golden ratio columns
      gap={goldenSpacing.lg}
    >
      {/* Primary metric: largest */}
      <Card height={sizes[0]} padding={goldenSpacing.xl}>
        <Stats
          value="127"
          label="Active Alerts"
          trend="+12%"
          size="huge"
        />
      </Card>
      
      {/* Secondary metrics */}
      <VStack gap={goldenSpacing.md}>
        <Card height={sizes[1]} padding={goldenSpacing.lg}>
          <Stats value="45" label="Staff Online" />
        </Card>
        <Card height={sizes[2]} padding={goldenSpacing.md}>
          <Stats value="1:23" label="Avg Response" />
        </Card>
      </VStack>
      
      {/* Tertiary metrics */}
      <VStack gap={goldenSpacing.sm}>
        {sizes.slice(3).map((size, i) => (
          <Card key={i} height={size} padding={goldenSpacing.sm}>
            <Stats compact />
          </Card>
        ))}
      </VStack>
    </Grid>
  );
};
```

### 3. Patient Information Block (Golden Section)
```tsx
const PatientInfoBlock = () => {
  const totalHeight = 377;
  const majorSection = 233; // 377 ÷ 1.618
  const minorSection = 144; // 377 - 233
  
  return (
    <Card height={totalHeight}>
      {/* Major section: Patient vitals */}
      <Box height={majorSection} padding={goldenSpacing.xl}>
        <Grid columns="1fr 1.618fr" gap={goldenSpacing.lg}>
          <Avatar size={144} /> {/* Fibonacci number */}
          <VStack gap={goldenSpacing.md}>
            <Heading4>John Doe</Heading4>
            <Text>68 years • Male • #1234567</Text>
            <HStack gap={goldenSpacing.sm}>
              <Badge>Cardiac</Badge>
              <Badge>Diabetes</Badge>
              <Badge>DNR: No</Badge>
            </HStack>
          </VStack>
        </Grid>
      </Box>
      
      {/* Minor section: Quick actions */}
      <Box height={minorSection} padding={goldenSpacing.lg}>
        <HStack gap={goldenSpacing.md}>
          <Button flex={1.618}>View History</Button>
          <Button flex={1}>Contact</Button>
          <Button flex={0.618}>More</Button>
        </HStack>
      </Box>
    </Card>
  );
};
```

### 4. Timeline Block (Fibonacci Sequence)
```tsx
const TimelineBlock = () => {
  const nodeSize = 21; // Fibonacci
  const lineWidth = 3; // Fibonacci
  const spacing = 34;  // Fibonacci
  
  return (
    <Timeline
      nodeSize={nodeSize}
      lineWidth={lineWidth}
      spacing={spacing}
      items={[
        { time: '2:45 ago', event: 'Alert created', size: 55 },
        { time: '2:30 ago', event: 'Acknowledged', size: 34 },
        { time: '1:15 ago', event: 'Doctor arrived', size: 34 },
        { time: '0:45 ago', event: 'Treatment started', size: 55 },
      ]}
    />
  );
};
```

## 🎯 Golden Ratio Shadows

```typescript
export const goldenShadows = {
  // Shadow blur radius follows golden ratio
  sm: {
    shadow: `0 ${2}px ${3}px rgba(0,0,0,0.05)`,    // 2, 3 Fibonacci
    spread: 1,
  },
  md: {
    shadow: `0 ${3}px ${5}px rgba(0,0,0,0.07)`,    // 3, 5 Fibonacci
    spread: 2,
  },
  lg: {
    shadow: `0 ${5}px ${8}px rgba(0,0,0,0.1)`,     // 5, 8 Fibonacci
    spread: 3,
  },
  xl: {
    shadow: `0 ${8}px ${13}px rgba(0,0,0,0.15)`,   // 8, 13 Fibonacci
    spread: 5,
  },
  xxl: {
    shadow: `0 ${13}px ${21}px rgba(0,0,0,0.2)`,   // 13, 21 Fibonacci
    spread: 8,
  },
};
```

## 🔄 Golden Animations

```typescript
export const goldenAnimations = {
  // Duration in ms follows Fibonacci
  instant: 89,    // Nearly instant feedback
  fast: 144,      // Quick transitions
  normal: 233,    // Standard animations
  slow: 377,      // Deliberate animations
  slowest: 610,   // Complex sequences
  
  // Easing with golden ratio
  easeGolden: 'cubic-bezier(0.618, 0, 0.382, 1)',
  easeGoldenIn: 'cubic-bezier(0.618, 0, 1, 1)',
  easeGoldenOut: 'cubic-bezier(0, 0, 0.382, 1)',
  
  // Stagger delays
  stagger: {
    fast: 34,     // 34ms between items
    normal: 55,   // 55ms between items
    slow: 89,     // 89ms between items
  },
};
```

## 📱 Responsive Golden Grid

```typescript
export const goldenGrid = {
  mobile: {
    columns: 5,      // Fibonacci
    gutter: 13,      // Fibonacci
    margin: 21,      // Fibonacci
  },
  tablet: {
    columns: 8,      // Fibonacci
    gutter: 21,      // Fibonacci
    margin: 34,      // Fibonacci
  },
  desktop: {
    columns: 13,     // Fibonacci
    gutter: 34,      // Fibonacci
    margin: 55,      // Fibonacci
  },
};
```

## 🎨 Color Harmony with Golden Ratio

```typescript
export const goldenColorHarmony = {
  // Hue rotation using golden angle (137.5°)
  generatePalette: (baseHue: number) => {
    const goldenAngle = 137.5;
    return {
      primary: `hsl(${baseHue}, 70%, 50%)`,
      secondary: `hsl(${(baseHue + goldenAngle) % 360}, 70%, 50%)`,
      tertiary: `hsl(${(baseHue + goldenAngle * 2) % 360}, 70%, 50%)`,
      quaternary: `hsl(${(baseHue + goldenAngle * 3) % 360}, 70%, 50%)`,
      quinary: `hsl(${(baseHue + goldenAngle * 4) % 360}, 70%, 50%)`,
    };
  },
};
```

## 📊 Layout Templates Using Golden Ratio

### Dashboard Layout
```
|-------- 1.618 --------|-- 1 --|
|                       |       |
|   Main Content       | Side  |
|   (Alert List)       | bar   |
|                       |       |
|-------- 1 ------------|
|   Secondary Content   |
|   (Metrics)          |
|-----------------------|
```

### Detail View Layout
```
|-------- φ² (2.618) ---------|
|         Header              |
|-------- φ (1.618) ----------|
|      Main Content           |
|-------- 1 ------------------|
|        Actions              |
|-----------------------------|
```

---

*The golden ratio creates visual harmony that reduces cognitive load in high-stress healthcare environments.*