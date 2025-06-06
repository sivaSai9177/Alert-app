import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from '@/contexts/ColorSchemeContext';

// Convert CSS HSL values to RGB hex colors
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

// Theme colors matching shadcn CSS variables
export const lightTheme = {
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
};

export const darkTheme = {
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
};

export type Theme = typeof lightTheme;

const ThemeContext = createContext<Theme>(lightTheme);

export function useTheme() {
  return useContext(ThemeContext);
}

export function ShadcnThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => {
    return colorScheme === 'dark' ? darkTheme : lightTheme;
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}