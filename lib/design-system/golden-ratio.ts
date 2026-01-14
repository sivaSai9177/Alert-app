/**
 * Golden Ratio Design System
 * Mathematical foundation using φ (1.618) for harmonious proportions
 */

import { Platform } from 'react-native';

// Golden ratio constant
export const PHI = 1.618;

// Fibonacci-based spacing scale (in pixels)
export const goldenSpacing = {
  xxs: 2,   // Micro
  xs: 3,    // Hairline  
  sm: 5,    // Tight
  md: 8,    // Base
  lg: 13,   // Comfortable
  xl: 21,   // Spacious
  xxl: 34,  // Section
  xxxl: 55, // Major
  huge: 89, // Page
} as const;

// Golden ratio typography scale
export const goldenTypography = {
  sizes: {
    tiny: 8,     // 13 ÷ φ
    small: 13,   // 21 ÷ φ
    body: 21,    // Base (Fibonacci)
    large: 34,   // 21 × φ
    heading4: 55,  // 34 × φ
    heading3: 89,  // 55 × φ
    heading2: 144, // 89 × φ
    heading1: 233, // 144 × φ
  },
  lineHeights: {
    tiny: 13,
    small: 21,
    body: 34,
    large: 55,
    heading4: 89,
    heading3: 144,
    heading2: 233,
    heading1: 377,
  },
} as const;

// Golden rectangle dimensions
export const goldenDimensions = {
  // Width : Height = φ : 1
  cards: {
    small: { width: 144, height: 89 },    // Fibonacci
    medium: { width: 233, height: 144 },  // Fibonacci
    large: { width: 377, height: 233 },   // Fibonacci
    huge: { width: 610, height: 377 },    // Fibonacci
  },
  // Common heights
  heights: {
    mini: 34,
    small: 55,
    medium: 89,
    large: 144,
    xlarge: 233,
    huge: 377,
    massive: 610,
  },
} as const;

// Golden ratio shadows (offset and blur use Fibonacci)
export const goldenShadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      shadowOpacity: 0.089, // 0.089 ≈ 1/11.2 (close to Fibonacci ratio)
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.089)',
    } as any,
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 5,
      shadowOpacity: 0.13, // 0.13 ≈ 1/7.7 (between Fibonacci numbers)
    },
    android: {
      elevation: 5,
    },
    web: {
      boxShadow: '0 3px 5px rgba(0, 0, 0, 0.13)',
    } as any,
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowRadius: 8,
      shadowOpacity: 0.21, // 0.21 ≈ 1/4.8 (close to Fibonacci ratio)
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: '0 5px 8px rgba(0, 0, 0, 0.21)',
    } as any,
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 13,
      shadowOpacity: 0.34, // 0.34 ≈ 1/2.9 (close to Fibonacci ratio)
    },
    android: {
      elevation: 13,
    },
    web: {
      boxShadow: '0 8px 13px rgba(0, 0, 0, 0.34)',
    } as any,
  }),
} as const;

// Golden ratio animations (duration in ms)
export const goldenAnimations = {
  durations: {
    instant: 89,
    fast: 144,
    normal: 233,
    slow: 377,
    slowest: 610,
  },
  // Stagger delays for list animations
  stagger: {
    fast: 34,
    normal: 55,
    slow: 89,
  },
  // Easing function that approximates golden ratio curve
  easeGolden: 'cubic-bezier(0.382, 0, 0.618, 1)',
} as const;

// Healthcare-specific color semantics
export const healthcareColors = {
  emergency: '#DC2626',  // Critical alerts
  warning: '#F59E0B',    // Escalating
  info: '#3B82F6',       // Active/Info
  success: '#10B981',    // Resolved/Good
  muted: '#6B7280',      // Inactive
} as const;

// Export type helpers
export type GoldenSpacing = keyof typeof goldenSpacing;
export type GoldenHeight = keyof typeof goldenDimensions.heights;
export type GoldenDuration = keyof typeof goldenAnimations.durations;