import React from 'react';
import { Box, HStack, Text, Switch } from '@/components/universal';
import { useColorScheme, useColorSchemeContext } from '@/contexts/ColorSchemeContext';
import { SpacingScale } from '@/lib/design-system';

export function DarkModeToggle() {
  const colorScheme = useColorScheme();
  const { toggleColorScheme } = useColorSchemeContext();

  return (
    <Box 
      flexDirection="row"
      alignItems="center" 
      justifyContent="space-between"
    >
      <Box flexDirection="row" alignItems="center" gap={2 as SpacingScale}>
        <Text size="2xl">
          {colorScheme === 'dark' ? '🌙' : '☀️'}
        </Text>
        <Text 
          size="base" 
          weight="medium"
          colorTheme="foreground"
        >
          Dark Mode
        </Text>
      </Box>
      <Switch
        checked={colorScheme === 'dark'}
        onCheckedChange={toggleColorScheme}
        colorScheme="accent"
      />
    </Box>
  );
}