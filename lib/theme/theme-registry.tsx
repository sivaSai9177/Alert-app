// Base theme interface
export interface Theme {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  successForeground: string;
}

// Extended theme interface with shadows
export interface ExtendedTheme extends Theme {
  // Shadow definitions
  shadow2xs?: string;
  shadowXs?: string;
  shadowSm?: string;
  shadow?: string;
  shadowMd?: string;
  shadowLg?: string;
  shadowXl?: string;
  shadow2xl?: string;
}

// Theme interface for consistent structure
export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  colors: {
    light: ExtendedTheme;
    dark: ExtendedTheme;
  };
}

// Convert HSL to Hex helper
function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((v, i) => {
    const num = parseFloat(v);
    return i === 0 ? num : num / 100;
  });

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Default shadcn theme (New York)
export const defaultTheme: ThemeDefinition = {
  id: 'default',
  name: 'Default',
  description: 'Clean and modern default theme',
  colors: {
    light: {
      background: hslToHex('0 0% 100%'),
      foreground: hslToHex('222.2 84% 4.9%'),
      card: hslToHex('0 0% 100%'),
      cardForeground: hslToHex('222.2 84% 4.9%'),
      popover: hslToHex('0 0% 100%'),
      popoverForeground: hslToHex('222.2 84% 4.9%'),
      primary: hslToHex('222.2 47.4% 11.2%'),
      primaryForeground: hslToHex('210 40% 98%'),
      secondary: hslToHex('210 40% 96%'),
      secondaryForeground: hslToHex('222.2 84% 4.9%'),
      muted: hslToHex('210 40% 96%'),
      mutedForeground: hslToHex('215.4 16.3% 46.9%'),
      accent: hslToHex('210 40% 96%'),
      accentForeground: hslToHex('222.2 84% 4.9%'),
      destructive: hslToHex('0 84.2% 60.2%'),
      destructiveForeground: hslToHex('210 40% 98%'),
      border: hslToHex('214.3 31.8% 91.4%'),
      input: hslToHex('214.3 31.8% 91.4%'),
      ring: hslToHex('222.2 84% 4.9%'),
      success: hslToHex('142.1 76.2% 36.3%'),
      successForeground: hslToHex('355.7 100% 97.3%'),
    },
    dark: {
      background: hslToHex('222.2 84% 4.9%'),
      foreground: hslToHex('210 40% 98%'),
      card: hslToHex('222.2 84% 4.9%'),
      cardForeground: hslToHex('210 40% 98%'),
      popover: hslToHex('222.2 84% 4.9%'),
      popoverForeground: hslToHex('210 40% 98%'),
      primary: hslToHex('210 40% 98%'),
      primaryForeground: hslToHex('222.2 47.4% 11.2%'),
      secondary: hslToHex('217.2 32.6% 17.5%'),
      secondaryForeground: hslToHex('210 40% 98%'),
      muted: hslToHex('217.2 32.6% 17.5%'),
      mutedForeground: hslToHex('215 20.2% 65.1%'),
      accent: hslToHex('217.2 32.6% 17.5%'),
      accentForeground: hslToHex('210 40% 98%'),
      destructive: hslToHex('0 62.8% 30.6%'),
      destructiveForeground: hslToHex('210 40% 98%'),
      border: hslToHex('217.2 32.6% 17.5%'),
      input: hslToHex('217.2 32.6% 17.5%'),
      ring: hslToHex('212.7 26.8% 83.9%'),
      success: hslToHex('142.1 70% 45.3%'),
      successForeground: hslToHex('142.1 85% 95%'),
    },
  },
};

// Bubblegum theme
export const bubblegumTheme: ThemeDefinition = {
  id: 'bubblegum',
  name: 'Bubblegum',
  description: 'Playful pink and purple theme',
  colors: {
    light: {
      background: '#f6e6ee',
      foreground: '#5b5b5b',
      card: '#fdedc9',
      cardForeground: '#5b5b5b',
      popover: '#ffffff',
      popoverForeground: '#5b5b5b',
      primary: '#d04f99',
      primaryForeground: '#ffffff',
      secondary: '#8acfd1',
      secondaryForeground: '#333333',
      muted: '#b2e1eb',
      mutedForeground: '#7a7a7a',
      accent: '#fbe2a7',
      accentForeground: '#333333',
      destructive: '#f96f70',
      destructiveForeground: '#ffffff',
      border: '#d04f99',
      input: '#e4e4e4',
      ring: '#e670ab',
      success: '#52c41a',
      successForeground: '#ffffff',
      // Shadows for light mode
      shadow2xs: '3px 3px 0px 0px rgba(208, 79, 153, 0.50)',
      shadowXs: '3px 3px 0px 0px rgba(208, 79, 153, 0.50)',
      shadowSm: '3px 3px 0px 0px rgba(208, 79, 153, 1.00), 3px 1px 2px -1px rgba(208, 79, 153, 1.00)',
      shadow: '3px 3px 0px 0px rgba(208, 79, 153, 1.00), 3px 1px 2px -1px rgba(208, 79, 153, 1.00)',
      shadowMd: '3px 3px 0px 0px rgba(208, 79, 153, 1.00), 3px 2px 4px -1px rgba(208, 79, 153, 1.00)',
      shadowLg: '3px 3px 0px 0px rgba(208, 79, 153, 1.00), 3px 4px 6px -1px rgba(208, 79, 153, 1.00)',
      shadowXl: '3px 3px 0px 0px rgba(208, 79, 153, 1.00), 3px 8px 10px -1px rgba(208, 79, 153, 1.00)',
      shadow2xl: '3px 3px 0px 0px rgba(208, 79, 153, 2.50)',
    },
    dark: {
      background: '#12242e',
      foreground: '#f3e3ea',
      card: '#1c2e38',
      cardForeground: '#f3e3ea',
      popover: '#1c2e38',
      popoverForeground: '#f3e3ea',
      primary: '#fbe2a7',
      primaryForeground: '#12242e',
      secondary: '#e4a2b1',
      secondaryForeground: '#12242e',
      muted: '#24272b',
      mutedForeground: '#e4a2b1',
      accent: '#c67b96',
      accentForeground: '#f3e3ea',
      destructive: '#e35ea4',
      destructiveForeground: '#12242e',
      border: '#324859',
      input: '#20333d',
      ring: '#50afb6',
      success: '#73d13d',
      successForeground: '#12242e',
      // Shadows for dark mode
      shadow2xs: '3px 3px 0px 0px rgba(50, 72, 89, 0.50)',
      shadowXs: '3px 3px 0px 0px rgba(50, 72, 89, 0.50)',
      shadowSm: '3px 3px 0px 0px rgba(50, 72, 89, 1.00), 3px 1px 2px -1px rgba(50, 72, 89, 1.00)',
      shadow: '3px 3px 0px 0px rgba(50, 72, 89, 1.00), 3px 1px 2px -1px rgba(50, 72, 89, 1.00)',
      shadowMd: '3px 3px 0px 0px rgba(50, 72, 89, 1.00), 3px 2px 4px -1px rgba(50, 72, 89, 1.00)',
      shadowLg: '3px 3px 0px 0px rgba(50, 72, 89, 1.00), 3px 4px 6px -1px rgba(50, 72, 89, 1.00)',
      shadowXl: '3px 3px 0px 0px rgba(50, 72, 89, 1.00), 3px 8px 10px -1px rgba(50, 72, 89, 1.00)',
      shadow2xl: '3px 3px 0px 0px rgba(50, 72, 89, 2.50)',
    },
  },
};

// Ocean theme
export const oceanTheme: ThemeDefinition = {
  id: 'ocean',
  name: 'Ocean',
  description: 'Cool blues and teals',
  colors: {
    light: {
      background: '#f0f9ff',
      foreground: '#0c4a6e',
      card: '#e0f2fe',
      cardForeground: '#0c4a6e',
      popover: '#e0f2fe',
      popoverForeground: '#0c4a6e',
      primary: '#0284c7',
      primaryForeground: '#f0f9ff',
      secondary: '#7dd3fc',
      secondaryForeground: '#0c4a6e',
      muted: '#bae6fd',
      mutedForeground: '#075985',
      accent: '#38bdf8',
      accentForeground: '#0c4a6e',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#7dd3fc',
      input: '#7dd3fc',
      ring: '#0284c7',
      success: '#10b981',
      successForeground: '#ffffff',
    },
    dark: {
      background: '#082f49',
      foreground: '#e0f2fe',
      card: '#0c4a6e',
      cardForeground: '#e0f2fe',
      popover: '#0c4a6e',
      popoverForeground: '#e0f2fe',
      primary: '#38bdf8',
      primaryForeground: '#082f49',
      secondary: '#0284c7',
      secondaryForeground: '#e0f2fe',
      muted: '#155e75',
      mutedForeground: '#7dd3fc',
      accent: '#0ea5e9',
      accentForeground: '#082f49',
      destructive: '#dc2626',
      destructiveForeground: '#e0f2fe',
      border: '#1e5d7b',
      input: '#1e5d7b',
      ring: '#38bdf8',
      success: '#22c55e',
      successForeground: '#082f49',
    },
  },
};

// Forest theme
export const forestTheme: ThemeDefinition = {
  id: 'forest',
  name: 'Forest',
  description: 'Natural greens and earth tones',
  colors: {
    light: {
      background: '#f7fee7',
      foreground: '#1a2e05',
      card: '#ecfccb',
      cardForeground: '#1a2e05',
      popover: '#ecfccb',
      popoverForeground: '#1a2e05',
      primary: '#65a30d',
      primaryForeground: '#fefce8',
      secondary: '#a3e635',
      secondaryForeground: '#1a2e05',
      muted: '#d9f99d',
      mutedForeground: '#365314',
      accent: '#84cc16',
      accentForeground: '#1a2e05',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#bef264',
      input: '#bef264',
      ring: '#65a30d',
      success: '#16a34a',
      successForeground: '#ffffff',
    },
    dark: {
      background: '#14532d',
      foreground: '#d9f99d',
      card: '#1e7e3e',
      cardForeground: '#d9f99d',
      popover: '#1e7e3e',
      popoverForeground: '#d9f99d',
      primary: '#84cc16',
      primaryForeground: '#14532d',
      secondary: '#65a30d',
      secondaryForeground: '#d9f99d',
      muted: '#2a6f3b',
      mutedForeground: '#a3e635',
      accent: '#a3e635',
      accentForeground: '#14532d',
      destructive: '#ef4444',
      destructiveForeground: '#d9f99d',
      border: '#3f8e4e',
      input: '#3f8e4e',
      ring: '#84cc16',
      success: '#22c55e',
      successForeground: '#14532d',
    },
  },
};

// Sunset theme
export const sunsetTheme: ThemeDefinition = {
  id: 'sunset',
  name: 'Sunset',
  description: 'Warm oranges and purples',
  colors: {
    light: {
      background: '#fef3c7',
      foreground: '#451a03',
      card: '#fed7aa',
      cardForeground: '#451a03',
      popover: '#fed7aa',
      popoverForeground: '#451a03',
      primary: '#f97316',
      primaryForeground: '#fff7ed',
      secondary: '#fb923c',
      secondaryForeground: '#451a03',
      muted: '#fdba74',
      mutedForeground: '#7c2d12',
      accent: '#f59e0b',
      accentForeground: '#451a03',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#fb923c',
      input: '#fb923c',
      ring: '#f97316',
      success: '#16a34a',
      successForeground: '#ffffff',
    },
    dark: {
      background: '#431407',
      foreground: '#fed7aa',
      card: '#7c2d12',
      cardForeground: '#fed7aa',
      popover: '#7c2d12',
      popoverForeground: '#fed7aa',
      primary: '#fb923c',
      primaryForeground: '#431407',
      secondary: '#f97316',
      secondaryForeground: '#fed7aa',
      muted: '#9a3412',
      mutedForeground: '#fdba74',
      accent: '#f59e0b',
      accentForeground: '#431407',
      destructive: '#ef4444',
      destructiveForeground: '#fed7aa',
      border: '#c2410c',
      input: '#c2410c',
      ring: '#fb923c',
      success: '#22c55e',
      successForeground: '#431407',
    },
  },
};

// Theme registry
export const themes: Record<string, ThemeDefinition> = {
  default: defaultTheme,
  bubblegum: bubblegumTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
};

// Get theme by ID
export const getTheme = (themeId: string): ThemeDefinition => {
  return themes[themeId] || defaultTheme;
};

// Get all theme options for selection
export const getThemeOptions = () => {
  return Object.values(themes).map(theme => ({
    value: theme.id,
    label: theme.name,
    description: theme.description,
  }));
};