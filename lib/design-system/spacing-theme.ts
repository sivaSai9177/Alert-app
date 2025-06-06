/**
 * Spacing Theme System
 * Provides responsive spacing scales for different density modes
 */

import { Dimensions } from 'react-native';

// Density modes
export type SpacingDensity = 'compact' | 'medium' | 'large';

// Base spacing unit (4px)
const BASE_UNIT = 4;

// Spacing scale multipliers for each density
const DENSITY_MULTIPLIERS = {
  compact: 0.75,  // 75% of base
  medium: 1,      // 100% of base
  large: 1.25,    // 125% of base
} as const;

// Base spacing scale (medium density)
const BASE_SPACING = {
  0: 0,
  0.5: BASE_UNIT * 0.5,    // 2px
  1: BASE_UNIT * 1,        // 4px
  1.5: BASE_UNIT * 1.5,    // 6px
  2: BASE_UNIT * 2,        // 8px
  2.5: BASE_UNIT * 2.5,    // 10px
  3: BASE_UNIT * 3,        // 12px
  3.5: BASE_UNIT * 3.5,    // 14px
  4: BASE_UNIT * 4,        // 16px
  5: BASE_UNIT * 5,        // 20px
  6: BASE_UNIT * 6,        // 24px
  7: BASE_UNIT * 7,        // 28px
  8: BASE_UNIT * 8,        // 32px
  9: BASE_UNIT * 9,        // 36px
  10: BASE_UNIT * 10,      // 40px
  11: BASE_UNIT * 11,      // 44px
  12: BASE_UNIT * 12,      // 48px
  14: BASE_UNIT * 14,      // 56px
  16: BASE_UNIT * 16,      // 64px
  20: BASE_UNIT * 20,      // 80px
  24: BASE_UNIT * 24,      // 96px
  28: BASE_UNIT * 28,      // 112px
  32: BASE_UNIT * 32,      // 128px
  36: BASE_UNIT * 36,      // 144px
  40: BASE_UNIT * 40,      // 160px
  44: BASE_UNIT * 44,      // 176px
  48: BASE_UNIT * 48,      // 192px
  52: BASE_UNIT * 52,      // 208px
  56: BASE_UNIT * 56,      // 224px
  60: BASE_UNIT * 60,      // 240px
  64: BASE_UNIT * 64,      // 256px
  72: BASE_UNIT * 72,      // 288px
  80: BASE_UNIT * 80,      // 320px
  96: BASE_UNIT * 96,      // 384px
} as const;

export type SpacingScale = keyof typeof BASE_SPACING;

// Generate spacing for a specific density
export function getSpacing(density: SpacingDensity): typeof BASE_SPACING {
  const multiplier = DENSITY_MULTIPLIERS[density];
  const spacing: any = {};
  
  Object.entries(BASE_SPACING).forEach(([key, value]) => {
    spacing[key] = Math.round(value * multiplier);
  });
  
  return spacing;
}

// Component-specific spacing presets
export const COMPONENT_SPACING = {
  compact: {
    // Padding
    buttonPadding: { x: 3, y: 2 },
    cardPadding: 3,
    containerPadding: 3,
    inputPadding: { x: 3, y: 2 },
    
    // Margins
    sectionMargin: 4,
    elementMargin: 2,
    
    // Gaps
    stackGap: 2,
    formGap: 3,
    listItemGap: 2,
    
    // Specific measurements
    iconSize: 16,
    avatarSize: 32,
    borderRadius: 4,
  },
  medium: {
    // Padding
    buttonPadding: { x: 4, y: 2.5 },
    cardPadding: 4,
    containerPadding: 4,
    inputPadding: { x: 4, y: 3 },
    
    // Margins
    sectionMargin: 6,
    elementMargin: 3,
    
    // Gaps
    stackGap: 3,
    formGap: 4,
    listItemGap: 3,
    
    // Specific measurements
    iconSize: 20,
    avatarSize: 40,
    borderRadius: 6,
  },
  large: {
    // Padding
    buttonPadding: { x: 6, y: 3 },
    cardPadding: 6,
    containerPadding: 6,
    inputPadding: { x: 5, y: 4 },
    
    // Margins
    sectionMargin: 8,
    elementMargin: 4,
    
    // Gaps
    stackGap: 4,
    formGap: 6,
    listItemGap: 4,
    
    // Specific measurements
    iconSize: 24,
    avatarSize: 48,
    borderRadius: 8,
  },
} as const;

// Screen size breakpoints for auto-density
const SCREEN_BREAKPOINTS = {
  compact: 360,   // Small phones
  medium: 414,    // Standard phones
  large: 768,     // Tablets and large phones
} as const;

// Auto-detect density based on screen width
export function getAutoDensity(): SpacingDensity {
  const { width } = Dimensions.get('window');
  
  if (width < SCREEN_BREAKPOINTS.compact) {
    return 'compact';
  } else if (width < SCREEN_BREAKPOINTS.large) {
    return 'medium';
  } else {
    return 'large';
  }
}

// Typography scale based on density
export const TYPOGRAPHY_SCALE = {
  compact: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 36,
    '6xl': 48,
    '7xl': 60,
    '8xl': 72,
    '9xl': 96,
  },
  medium: {
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
  large: {
    xs: 14,
    sm: 16,
    base: 18,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
    '4xl': 48,
    '5xl': 60,
    '6xl': 72,
    '7xl': 96,
    '8xl': 128,
    '9xl': 160,
  },
} as const;

// Component size scales
export const COMPONENT_SIZES = {
  compact: {
    button: {
      sm: { height: 32, minWidth: 64 },
      md: { height: 36, minWidth: 80 },
      lg: { height: 40, minWidth: 96 },
      xl: { height: 44, minWidth: 112 },
    },
    input: {
      sm: { height: 32 },
      md: { height: 36 },
      lg: { height: 40 },
    },
    checkbox: {
      sm: 16,
      md: 18,
      lg: 20,
    },
    switch: {
      sm: 0.7,
      md: 0.8,
      lg: 0.9,
    },
  },
  medium: {
    button: {
      sm: { height: 36, minWidth: 72 },
      md: { height: 44, minWidth: 96 },
      lg: { height: 52, minWidth: 120 },
      xl: { height: 60, minWidth: 144 },
    },
    input: {
      sm: { height: 36 },
      md: { height: 44 },
      lg: { height: 52 },
    },
    checkbox: {
      sm: 18,
      md: 20,
      lg: 24,
    },
    switch: {
      sm: 0.8,
      md: 1,
      lg: 1.2,
    },
  },
  large: {
    button: {
      sm: { height: 44, minWidth: 88 },
      md: { height: 52, minWidth: 112 },
      lg: { height: 60, minWidth: 144 },
      xl: { height: 68, minWidth: 176 },
    },
    input: {
      sm: { height: 44 },
      md: { height: 52 },
      lg: { height: 60 },
    },
    checkbox: {
      sm: 20,
      md: 24,
      lg: 28,
    },
    switch: {
      sm: 1,
      md: 1.2,
      lg: 1.4,
    },
  },
} as const;

// Export all spacing configurations
export const spacingTheme = {
  getSpacing,
  getAutoDensity,
  componentSpacing: COMPONENT_SPACING,
  typographyScale: TYPOGRAPHY_SCALE,
  componentSizes: COMPONENT_SIZES,
  densityMultipliers: DENSITY_MULTIPLIERS,
  baseUnit: BASE_UNIT,
} as const;