import React from 'react';
import { View, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { Text } from './Text';
import { Box } from './Box';
import { HStack, VStack } from './Stack';
import { Ionicons } from '@expo/vector-icons';
import { useSpacing } from '@/contexts/SpacingContext';
import { SpacingScale } from '@/lib/design-system';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'default';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const variantIcons: Record<AlertVariant, keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  error: 'close-circle',
  default: 'information-circle',
};

// Theme-aware color mapping
const getAlertColors = (variant: AlertVariant, theme: any) => {
  const colorMap = {
    info: {
      background: theme.primary + '1a', // 10% opacity
      border: theme.primary + '33', // 20% opacity
      icon: theme.primary,
      text: theme.foreground,
    },
    success: {
      background: theme.success + '1a',
      border: theme.success + '33',
      icon: theme.success,
      text: theme.foreground,
    },
    warning: {
      background: '#f59e0b' + '1a', // amber
      border: '#f59e0b' + '33',
      icon: '#f59e0b',
      text: theme.foreground,
    },
    error: {
      background: theme.destructive + '1a',
      border: theme.destructive + '33',
      icon: theme.destructive,
      text: theme.foreground,
    },
    default: {
      background: theme.muted,
      border: theme.border,
      icon: theme.mutedForeground,
      text: theme.foreground,
    },
  };
  
  return colorMap[variant];
};

export const Alert = React.forwardRef<View, AlertProps>(({
  variant = 'default',
  title,
  description,
  icon,
  showIcon = true,
  onClose,
  action,
  style,
  children,
}, ref) => {
  const theme = useTheme();
  const { componentSpacing } = useSpacing();
  const colors = getAlertColors(variant, theme);

  const iconElement = icon || (showIcon && (
    <Ionicons 
      name={variantIcons[variant]} 
      size={componentSpacing.iconSize} 
      color={colors.icon}
    />
  ));

  return (
    <Box
      ref={ref}
      p={4 as SpacingScale}
      rounded="md"
      style={[
        {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <HStack spacing={3 as SpacingScale} alignItems="flex-start">
        {iconElement && (
          <Box pt={0.5 as SpacingScale}>
            {iconElement}
          </Box>
        )}
        
        <VStack spacing={1 as SpacingScale} flex={1}>
          {title && (
            <Text 
              weight="semibold" 
              size="base"
              style={{ color: colors.text }}
            >
              {title}
            </Text>
          )}
          
          {description && (
            <Text 
              size="sm" 
              style={{ color: colors.text, opacity: 0.9 }}
            >
              {description}
            </Text>
          )}
          
          {children}
          
          {action && (
            <Box mt={2 as SpacingScale}>
              {action}
            </Box>
          )}
        </VStack>
        
        {onClose && (
          <Pressable
            onPress={onClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            {({ pressed }) => (
              <Ionicons 
                name="close" 
                size={Math.round(componentSpacing.iconSize * 0.8)} 
                color={colors.icon}
                style={{ opacity: pressed ? 0.7 : 1 }}
              />
            )}
          </Pressable>
        )}
      </HStack>
    </Box>
  );
});

Alert.displayName = 'Alert';

// AlertTitle component for use with Alert
export const AlertTitle: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  return (
    <Text weight="semibold" size="base" style={style}>
      {children}
    </Text>
  );
};

// AlertDescription component for use with Alert
export const AlertDescription: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  return (
    <Text size="sm" colorTheme="mutedForeground" style={style}>
      {children}
    </Text>
  );
};