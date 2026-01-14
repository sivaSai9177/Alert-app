/**
 * Universal Design System for Cross-Platform React Native App
 * Provides consistent styling and components across iOS, Android, and Web
 */

import { Platform, Dimensions } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints for responsive design
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Spacing scale (4px base)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

// Typography scale
export const typography = {
  // Font families (platform-specific)
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: 'Menlo, Monaco, Consolas, "Courier New", monospace',
    }),
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Font weights
  fontWeight: {
    thin: '100' as const,
    extralight: '200' as const,
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
} as const;

// Border radius scale
export const borderRadius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

// Shadow styles (platform-specific)
export const shadows = {
  none: Platform.select({
    ios: {
      boxShadow: 'none',
    },
    android: {
      elevation: 0,
    },
    web: {
      boxShadow: 'none',
    },
  }),
  sm: Platform.select({
    ios: {
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    },
  }),
  base: Platform.select({
    ios: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
  }),
  md: Platform.select({
    ios: {
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.15)',
    },
    android: {
      elevation: 6,
    },
    web: {
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.15)',
    },
  }),
  lg: Platform.select({
    ios: {
      boxShadow: '0px 8px 10px rgba(0, 0, 0, 0.2)',
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: '0px 8px 10px rgba(0, 0, 0, 0.2)',
    },
  }),
  xl: Platform.select({
    ios: {
      boxShadow: '0px 12px 15px rgba(0, 0, 0, 0.25)',
    },
    android: {
      elevation: 12,
    },
    web: {
      boxShadow: '0px 12px 15px rgba(0, 0, 0, 0.25)',
    },
  }),
  '2xl': Platform.select({
    ios: {
      boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.3)',
    },
    android: {
      elevation: 16,
    },
    web: {
      boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.3)',
    },
  }),
} as const;

// Z-index scale
export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  auto: 'auto' as const,
} as const;

// Animation durations
export const duration = {
  75: 75,
  100: 100,
  150: 150,
  200: 200,
  300: 300,
  500: 500,
  700: 700,
  1000: 1000,
} as const;

// Opacity scale
export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
} as const;

// Responsive helpers
export const responsive = {
  isSmallScreen: () => SCREEN_WIDTH < breakpoints.sm,
  isMediumScreen: () => SCREEN_WIDTH >= breakpoints.sm && SCREEN_WIDTH < breakpoints.md,
  isLargeScreen: () => SCREEN_WIDTH >= breakpoints.md,
  isTablet: () => SCREEN_WIDTH >= breakpoints.md && SCREEN_WIDTH < breakpoints.lg,
  isDesktop: () => SCREEN_WIDTH >= breakpoints.lg,
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
} as const;

// Platform-specific helpers
export const platform = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
  isNative: Platform.OS !== 'web',
  select: Platform.select,
  version: Platform.Version,
} as const;

// Common style mixins
export const mixins = {
  // Center content
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  // Absolute fill
  absoluteFill: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  
  // Row layout
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  // Safe area padding (for native)
  safeArea: Platform.select({
    ios: {
      paddingTop: 44,
      paddingBottom: 34,
    },
    android: {
      paddingTop: 24,
      paddingBottom: 0,
    },
    web: {
      paddingTop: 0,
      paddingBottom: 0,
    },
  }),
} as const;

// Export everything as a single design system object
export const designSystem = {
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
  duration,
  opacity,
  breakpoints,
  responsive,
  platform,
  mixins,
} as const;

// Type helpers
export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
export type Duration = keyof typeof duration;
export type Opacity = keyof typeof opacity;
export type Breakpoint = keyof typeof breakpoints;

// Re-export spacing theme
export * from './spacing-theme';