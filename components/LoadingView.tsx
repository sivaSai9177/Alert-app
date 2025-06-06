import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Box, Text } from '@/components/universal';
import { useTheme } from '@/lib/theme/theme-provider';
import { SpacingScale } from '@/lib/design-system';

interface LoadingViewProps {
  message?: string;
  color?: string;
  backgroundColor?: string;
}

export function LoadingView({ 
  message = 'Loading...', 
  color,
  backgroundColor
}: LoadingViewProps) {
  const theme = useTheme();
  const indicatorColor = color || theme.primary;
  const bgColor = backgroundColor || theme.background;

  return (
    <Box 
      flex={1} 
      justifyContent="center" 
      alignItems="center"
      style={{ backgroundColor: bgColor }}
    >
      <ActivityIndicator size="large" color={indicatorColor} />
      {message && (
        <Text 
          size="base" 
          colorTheme="mutedForeground" 
          align="center"
          mt={3 as SpacingScale}
        >
          {message}
        </Text>
      )}
    </Box>
  );
}