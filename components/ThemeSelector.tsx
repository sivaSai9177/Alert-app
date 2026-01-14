import React, { useTransition, useMemo, useCallback } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useThemeContext } from '@/lib/theme/enhanced-theme-provider';
import { getThemeOptions } from '@/lib/theme/theme-registry';
import {
  VStack,
  HStack,
  Text,
  Card,
  Badge,
  Select,
} from '@/components/universal';
import { SpacingScale } from '@/lib/design-system';

interface ColorSwatchProps {
  color: string;
  label: string;
}

// Memoize ColorSwatch component for better performance
const ColorSwatch = React.memo<ColorSwatchProps>(({ color, label }) => {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
        }}
      />
      <Text size="xs" colorTheme="mutedForeground" style={{ marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );
});

ColorSwatch.displayName = 'ColorSwatch';

export const ThemeSelector: React.FC = () => {
  const { themeId, setThemeId, colorScheme, availableThemes } = useThemeContext();
  const themeOptions = getThemeOptions();
  const [isPending, startTransition] = useTransition();
  
  // Memoize theme switching handler
  const handleThemeChange = useCallback((newThemeId: string) => {
    startTransition(() => {
      setThemeId(newThemeId);
    });
  }, [setThemeId]);

  return (
    <VStack spacing={4 as SpacingScale}>
      <Text size="base" weight="semibold">
        Choose Theme
      </Text>
      
      <VStack spacing={3 as SpacingScale}>
        {themeOptions.map((option) => {
          const theme = availableThemes[option.value];
          const colors = colorScheme === 'dark' ? theme.colors.dark : theme.colors.light;
          const isSelected = themeId === option.value;
          
          return (
            <Pressable
              key={option.value}
              onPress={() => handleThemeChange(option.value)}
            >
              <Card
                borderWidth={2}
                borderTheme="border"
                p={4 as SpacingScale}
                style={{
                  borderColor: isSelected ? colors.primary : colors.border,
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                <VStack spacing={3 as SpacingScale}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack spacing={1 as SpacingScale}>
                      <HStack spacing={2 as SpacingScale} alignItems="center">
                        <Text weight="semibold">{option.label}</Text>
                        {isSelected && (
                          <Badge variant="primary" size="xs">
                            {isPending ? (
                              <HStack spacing={1 as SpacingScale} alignItems="center">
                                <ActivityIndicator size="small" color="white" />
                                <Text size="xs">Applying...</Text>
                              </HStack>
                            ) : (
                              'Active'
                            )}
                          </Badge>
                        )}
                      </HStack>
                      <Text size="sm" colorTheme="mutedForeground">
                        {option.description}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  {/* Color Preview */}
                  <HStack spacing={2 as SpacingScale}>
                    <ColorSwatch color={colors.primary} label="Primary" />
                    <ColorSwatch color={colors.secondary} label="Secondary" />
                    <ColorSwatch color={colors.accent} label="Accent" />
                    <ColorSwatch color={colors.destructive} label="Error" />
                    <ColorSwatch color={colors.success} label="Success" />
                  </HStack>
                </VStack>
              </Card>
            </Pressable>
          );
        })}
      </VStack>
    </VStack>
  );
};

// Compact Theme Selector for quick switching
export const CompactThemeSelector: React.FC = () => {
  const { themeId, setThemeId } = useThemeContext();
  const themeOptions = useMemo(() => getThemeOptions(), []);
  const [isPending, startTransition] = useTransition();
  
  const handleThemeChange = useCallback((value: string) => {
    startTransition(() => {
      setThemeId(value);
    });
  }, [setThemeId]);

  return (
    <Select
      value={themeId}
      onValueChange={handleThemeChange}
      options={themeOptions}
      placeholder="Select theme"
      disabled={isPending}
    />
  );
};

