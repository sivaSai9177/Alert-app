import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { Text } from './Text';
import { Box } from './Box';
import { useSpacing } from '@/contexts/SpacingContext';
import { SpacingScale } from '@/lib/design-system';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'destructive' | 'outline';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  style?: ViewStyle;
  dot?: boolean;
  onPress?: () => void;
}

// Theme-aware color mapping
const getBadgeColors = (variant: BadgeVariant, theme: any) => {
  // Default fallback colors
  const defaultColors = {
    background: '#e4e4e7',
    text: '#71717a',
    border: 'transparent',
  };
  
  // Provide fallback colors if theme is not available
  if (!theme) {
    return defaultColors;
  }
  
  const colorMap = {
    default: {
      background: theme.muted || '#f4f4f5',
      text: theme.mutedForeground || '#71717a',
      border: 'transparent',
    },
    primary: {
      background: theme.primary || '#3b82f6',
      text: theme.primaryForeground || '#ffffff',
      border: 'transparent',
    },
    secondary: {
      background: theme.secondary || '#e4e4e7',
      text: theme.secondaryForeground || '#18181b',
      border: 'transparent',
    },
    success: {
      background: (theme.success || '#22c55e') + '1a', // 10% opacity
      text: theme.success || '#22c55e',
      border: (theme.success || '#22c55e') + '33', // 20% opacity
    },
    warning: {
      background: '#f59e0b' + '1a',
      text: '#f59e0b',
      border: '#f59e0b' + '33',
    },
    error: {
      background: (theme.destructive || '#ef4444') + '1a',
      text: theme.destructive || '#ef4444',
      border: (theme.destructive || '#ef4444') + '33',
    },
    destructive: {
      background: theme.destructive || '#ef4444',
      text: theme.destructiveForeground || '#ffffff',
      border: 'transparent',
    },
    outline: {
      background: 'transparent',
      text: theme.foreground || '#18181b',
      border: theme.border || '#e4e4e7',
    },
  };
  
  // Return the variant colors or default if variant doesn't exist
  return colorMap[variant] || defaultColors;
};

export const Badge = React.forwardRef<View, BadgeProps>(({
  variant = 'default',
  size = 'md',
  children,
  rounded = 'md',
  style,
  dot = false,
  onPress,
}, ref) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  const colors = getBadgeColors(variant, theme) || {
    background: '#e4e4e7',
    text: '#71717a',
    border: 'transparent',
  };

  // Dynamic sizing based on spacing density
  const sizeConfig = {
    xs: {
      paddingH: 1.5 as SpacingScale,
      paddingV: 0.5 as SpacingScale,
      fontSize: 'xs' as const,
      dotSize: 6,
    },
    sm: {
      paddingH: 2 as SpacingScale,
      paddingV: 0.5 as SpacingScale,
      fontSize: 'sm' as const,
      dotSize: 8,
    },
    md: {
      paddingH: 2.5 as SpacingScale,
      paddingV: 1 as SpacingScale,
      fontSize: 'sm' as const,
      dotSize: 10,
    },
    lg: {
      paddingH: 3 as SpacingScale,
      paddingV: 1.5 as SpacingScale,
      fontSize: 'md' as const,
      dotSize: 12,
    },
  };

  const config = sizeConfig[size];
  
  const borderRadius = {
    sm: 4,
    md: 6,
    lg: 8,
    full: 999,
  }[rounded];

  const content = (
    <Box
      ref={ref}
      px={config.paddingH}
      py={config.paddingV}
      style={[
        {
          backgroundColor: colors.background,
          borderRadius,
          borderWidth: variant === 'outline' || ['success', 'warning', 'error'].includes(variant) ? 1 : 0,
          borderColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={{
            width: config.dotSize,
            height: config.dotSize,
            borderRadius: config.dotSize / 2,
            backgroundColor: colors.text,
            marginRight: spacing[1],
          }}
        />
      )}
      <Text
        size={config.fontSize}
        weight="medium"
        style={{ color: colors.text }}
      >
        {children}
      </Text>
    </Box>
  );

  if (onPress) {
    const Pressable = require('react-native').Pressable;
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.7 : 1 }}>
            {content}
          </View>
        )}
      </Pressable>
    );
  }

  return content;
});

Badge.displayName = 'Badge';