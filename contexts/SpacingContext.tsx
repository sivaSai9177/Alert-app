import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SpacingDensity, 
  spacingTheme, 
  getSpacing,
  SpacingScale 
} from '@/lib/design-system/spacing-theme';

interface SpacingContextType {
  density: SpacingDensity;
  setDensity: (density: SpacingDensity) => void;
  spacing: Record<SpacingScale, number>;
  componentSpacing: typeof spacingTheme.componentSpacing[SpacingDensity];
  typographyScale: typeof spacingTheme.typographyScale[SpacingDensity];
  componentSizes: typeof spacingTheme.componentSizes[SpacingDensity];
}

const SpacingContext = createContext<SpacingContextType | undefined>(undefined);

const STORAGE_KEY = '@app/spacing-density';

export function SpacingProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<SpacingDensity>('medium');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved density preference
  useEffect(() => {
    loadDensityPreference();
  }, []);

  // Listen for screen size changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      // Only auto-adjust if no preference is saved
      AsyncStorage.getItem(STORAGE_KEY).then(saved => {
        if (!saved) {
          const autoDensity = spacingTheme.getAutoDensity();
          setDensityState(autoDensity);
        }
      });
    });

    return () => subscription?.remove();
  }, []);

  const loadDensityPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDensityState(saved as SpacingDensity);
      } else {
        // Auto-detect based on screen size
        const autoDensity = spacingTheme.getAutoDensity();
        setDensityState(autoDensity);
      }
    } catch (error) {
      console.error('Failed to load spacing density preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setDensity = async (newDensity: SpacingDensity) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newDensity);
      setDensityState(newDensity);
    } catch (error) {
      console.error('Failed to save spacing density preference:', error);
    }
  };

  // Always provide a value, even while loading
  const currentDensity = isLoaded ? density : 'medium';
  const value: SpacingContextType = {
    density: currentDensity,
    setDensity,
    spacing: getSpacing(currentDensity),
    componentSpacing: spacingTheme.componentSpacing[currentDensity],
    typographyScale: spacingTheme.typographyScale[currentDensity],
    componentSizes: spacingTheme.componentSizes[currentDensity],
  };

  return (
    <SpacingContext.Provider value={value}>
      {children}
    </SpacingContext.Provider>
  );
}

export function useSpacing() {
  const context = useContext(SpacingContext);
  if (!context) {
    throw new Error('useSpacing must be used within a SpacingProvider');
  }
  return context;
}

// Hook for responsive values based on density
export function useResponsive<T>(values: { compact: T; medium: T; large: T }): T {
  const { density } = useSpacing();
  return values[density];
}