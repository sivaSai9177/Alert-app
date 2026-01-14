import React from 'react';
import { Pressable, Platform, View } from 'react-native';
import { Box, Text, VStack, HStack } from '@/components/universal';
import { useSpacing } from '@/contexts/SpacingContext';
import { SpacingDensity } from '@/lib/design-system/spacing-theme';
import { useTheme } from '@/lib/theme/theme-provider';

export function SpacingDensitySelector() {
  const { density, setDensity } = useSpacing();
  const theme = useTheme();

  const densityOptions: { 
    value: SpacingDensity; 
    label: string; 
    description: string;
    barHeights: number[];
  }[] = [
    { 
      value: 'compact', 
      label: 'Compact', 
      description: 'Smaller spacing for more content',
      barHeights: [12, 16, 12],
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      description: 'Default spacing for most devices',
      barHeights: [10, 18, 10],
    },
    { 
      value: 'large', 
      label: 'Large', 
      description: 'Larger spacing for better readability',
      barHeights: [8, 20, 8],
    },
  ];

  return (
    <VStack spacing={3}>
      <Text size="base" weight="medium" colorTheme="foreground">
        Display Density
      </Text>
      
      {/* Native-friendly tab implementation */}
      <HStack 
        bgTheme="muted" 
        p={1} 
        rounded="lg" 
        spacing={1}
        style={{ width: '100%' }}
      >
        {densityOptions.map((option) => {
          const isActive = density === option.value;
          
          return (
            <Pressable
              key={option.value}
              onPress={() => setDensity(option.value)}
              style={{ flex: 1 }}
            >
              <Box
                p={2}
                rounded="md"
                bgTheme={isActive ? "background" : undefined}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 44,
                  ...(isActive && {
                    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                    elevation: 2,
                  }),
                  ...(Platform.OS === 'web' && {
                    transition: 'all 0.2s ease',
                  } as any),
                }}
              >
                <VStack spacing={1} alignItems="center">
                  {/* Visual density indicator using bars */}
                  <HStack spacing={1} alignItems="flex-end" style={{ height: 24 }}>
                    {option.barHeights.map((height, index) => (
                      <View
                        key={index}
                        style={{
                          width: 4,
                          height,
                          backgroundColor: isActive ? theme.foreground : theme.mutedForeground,
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </HStack>
                  <Text
                    size="sm"
                    weight="medium"
                    colorTheme={isActive ? "foreground" : "mutedForeground"}
                  >
                    {option.label}
                  </Text>
                </VStack>
              </Box>
            </Pressable>
          );
        })}
      </HStack>
      
      {/* Description for active density */}
      {densityOptions.map((option) => {
        if (density === option.value) {
          return (
            <Box key={option.value} p={3} bgTheme="muted" rounded="md">
              <Text size="sm" colorTheme="foreground" weight="medium" mb={1}>
                {option.label} View
              </Text>
              <Text size="sm" colorTheme="mutedForeground">
                {option.description}
              </Text>
            </Box>
          );
        }
        return null;
      })}
      
      <Text size="sm" colorTheme="mutedForeground" mt={2}>
        Adjusts spacing, text sizes, and component dimensions throughout the app
      </Text>
    </VStack>
  );
}