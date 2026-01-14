# Native Scroll Header Implementation

## Overview
Implemented iOS-style sticky headers that appear when scrolling, providing a native navigation experience across all platforms.

## Components Created

### 1. **ScrollHeader Component**
- Native blur effect on iOS/Android using `expo-blur`
- CSS backdrop filter on web for performance
- Smooth fade-in animation when scrolling past threshold
- Dynamic border appears on scroll
- Safe area aware (respects device notches/status bars)

### 2. **ScrollContainer Component**
- Enhanced container with built-in scroll header support
- Animated scroll tracking
- Automatic padding adjustment for header
- All features of original Container component

## Features

### Visual Effects
- **Blur Background**: Native blur on mobile, backdrop-filter on web
- **Fade Animation**: Header fades in after 50px scroll
- **Title Animation**: Title slides up as header appears
- **Dynamic Border**: Border appears when scrolled
- **Theme Aware**: Adapts to light/dark mode

### Platform Optimizations
- **iOS**: 44pt header height with native blur
- **Android**: 56dp header height with native blur  
- **Web**: CSS backdrop-filter for performance

### Animations
```typescript
// Header opacity animation
opacity: scrollY.interpolate({
  inputRange: [0, 50, 70],
  outputRange: [0, 0, 1],
})

// Title slide animation
translateY: scrollY.interpolate({
  inputRange: [0, 50, 70],
  outputRange: [20, 20, 0],
})
```

## Usage

### Basic Usage
```tsx
<ScrollContainer safe headerTitle="Page Title">
  <YourContent />
</ScrollContainer>
```

### With Custom Header Content
```tsx
<ScrollContainer 
  safe 
  headerTitle="Settings"
  headerChildren={<IconButton />}
>
  <YourContent />
</ScrollContainer>
```

## Pages Updated
1. **Dashboard** - Shows "Dashboard" header on scroll
2. **Settings** - Shows "Settings" header on scroll
3. **Explore** - Shows "Explore" header on scroll

## Technical Implementation

### Scroll Tracking
- Uses `Animated.ScrollView` with scroll event
- Non-native driver for header animations
- 16ms scroll event throttle for smooth updates

### Safe Area Handling
- Header height includes safe area top inset
- Content padding adjusted automatically
- SafeAreaView edges configured per platform

### Performance
- Blur effects use native implementations
- CSS backdrop-filter on web for GPU acceleration
- Minimal re-renders with Animated API

## User Experience
- Clean initial view with full content visible
- Header appears smoothly as user scrolls
- Provides context and quick navigation
- Consistent with native iOS/Android patterns
- No jarring transitions or layout shifts