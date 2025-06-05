import React from 'react';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps, Platform } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';

interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'primary' | 'accent' | 'secondary';
}

export const Switch = React.forwardRef<RNSwitch, SwitchProps>(({
  checked = false,
  onCheckedChange,
  disabled = false,
  size = 'md',
  colorScheme = 'primary',
  style,
  ...props
}, ref) => {
  const theme = useTheme();
  
  // Size configurations
  const sizeConfig = {
    sm: Platform.select({
      ios: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
      android: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
      default: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
    }),
    md: {},
    lg: Platform.select({
      ios: { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] },
      android: { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] },
      default: { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] },
    }),
  };
  
  // Get color based on colorScheme - use more vibrant colors
  const getTrackColor = () => {
    switch (colorScheme) {
      case 'accent':
        // Use a vibrant pink/purple for accent
        return Platform.select({
          ios: '#FF1493', // DeepPink for iOS
          android: theme.accent,
          default: theme.accent,
        });
      case 'secondary':
        // Use a vibrant blue for secondary
        return Platform.select({
          ios: '#007AFF', // iOS system blue
          android: theme.secondary,
          default: theme.secondary,
        });
      default:
        return Platform.select({
          ios: '#34C759', // iOS system green
          android: theme.primary,
          default: theme.primary,
        });
    }
  };

  const trackColor = getTrackColor();

  return (
    <RNSwitch
      ref={ref}
      value={checked}
      onValueChange={onCheckedChange}
      disabled={disabled}
      trackColor={{
        false: Platform.select({
          ios: '#E5E5EA', // iOS system gray
          android: theme.border,
          default: theme.border,
        }),
        true: trackColor,
      }}
      thumbColor={Platform.select({
        ios: '#FFFFFF', // Always white on iOS
        android: checked ? theme.background : '#FAFAFA',
        default: theme.background,
      })}
      ios_backgroundColor={Platform.select({
        ios: '#E5E5EA', // iOS system gray for background
        default: theme.border,
      })}
      style={[sizeConfig[size], style]}
      {...props}
    />
  );
});

Switch.displayName = 'Switch';