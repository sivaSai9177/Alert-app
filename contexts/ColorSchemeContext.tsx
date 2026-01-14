import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark';

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme-preference';

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useRNColorScheme() || 'light';
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemColorScheme);

  useEffect(() => {
    // Load saved preference
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setColorSchemeState(savedTheme);
        updateAppearance(savedTheme);
      }
    });
  }, []);

  const updateAppearance = (scheme: ColorScheme) => {
    // Update the system appearance if possible
    if (Appearance.setColorScheme) {
      Appearance.setColorScheme(scheme);
    }
    
    // Update web document class
    if (typeof document !== 'undefined') {
      if (scheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
    updateAppearance(scheme);
  };

  const toggleColorScheme = () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
  };

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme, toggleColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context.colorScheme;
}

export function useColorSchemeContext() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorSchemeContext must be used within a ColorSchemeProvider');
  }
  return context;
}