import React, { useState } from 'react';
import { Pressable, View, ViewStyle, Platform } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { Text } from './Text';
import { designSystem } from '@/lib/design-system';
import { useSpacing } from '@/contexts/SpacingContext';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: number;
  style?: ViewStyle;
}

export const Checkbox = React.forwardRef<View, CheckboxProps>(({
  checked = false,
  onCheckedChange,
  disabled = false,
  size = 20,
  style,
}, ref) => {
  const theme = useTheme();
  const { componentSizes } = useSpacing();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  const getBorderColor = () => {
    if (checked) return theme.primary;
    if (isHovered && !disabled) return theme.primary + '80'; // 50% opacity
    return theme.border;
  };

  const getBackgroundColor = () => {
    if (checked) {
      if (isPressed && !disabled) return theme.primary + 'cc'; // 80% opacity
      return theme.primary;
    }
    if (isHovered && !disabled) return theme.primary + '1a'; // 10% opacity
    return 'transparent';
  };

  const webHandlers = Platform.OS === 'web' && !disabled ? {
    onHoverIn: () => setIsHovered(true),
    onHoverOut: () => setIsHovered(false),
    onPressIn: () => setIsPressed(true),
    onPressOut: () => setIsPressed(false),
  } : {};
  
  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      disabled={disabled}
      style={[
        {
          width: size,
          height: size,
          borderRadius: designSystem.borderRadius.sm,
          borderWidth: 2,
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          // Web-specific styles
          ...(Platform.OS === 'web' && {
            transition: 'all 0.2s ease',
            cursor: disabled ? 'not-allowed' : 'pointer',
          } as any),
        },
        style,
      ]}
      {...webHandlers}
    >
      {checked && (
        <Text
          size="xs"
          weight="bold"
          style={{
            color: theme.primaryForeground,
            fontSize: size * 0.7,
            lineHeight: size * 0.7,
          }}
        >
          ✓
        </Text>
      )}
    </Pressable>
  );
});

Checkbox.displayName = 'Checkbox';