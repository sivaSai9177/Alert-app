import React from 'react';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps, Platform, View, Pressable } from 'react-native';
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
        // Use primary color for accent (works well in both themes)
        return Platform.select({
          ios: '#007AFF', // iOS system blue
          android: theme.primary,
          default: theme.primary,
        });
      case 'secondary':
        // Use secondary color
        return Platform.select({
          ios: '#007AFF', // iOS system blue
          android: theme.secondary,
          default: theme.secondary,
        });
      default:
        // Default to primary
        return Platform.select({
          ios: '#007AFF', // iOS system blue
          android: theme.primary,
          default: theme.primary,
        });
    }
  };

  const trackColor = getTrackColor();

  // Web implementation - custom switch similar to shadcn
  if (Platform.OS === 'web') {
    const webSizeConfig = {
      sm: { width: 36, height: 20, thumbSize: 16 },
      md: { width: 44, height: 24, thumbSize: 20 },
      lg: { width: 52, height: 28, thumbSize: 24 },
    };
    
    const config = webSizeConfig[size];
    
    return (
      <Pressable
        ref={ref as any}
        onPress={() => !disabled && onCheckedChange?.(!checked)}
        disabled={disabled}
        style={[
          {
            width: config.width,
            height: config.height,
            borderRadius: config.height / 2,
            backgroundColor: checked ? trackColor : theme.muted,
            position: 'relative',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          } as any,
          style,
        ]}
        {...props}
      >
        <View
          style={{
            width: config.thumbSize,
            height: config.thumbSize,
            borderRadius: config.thumbSize / 2,
            backgroundColor: theme.card,
            position: 'absolute',
            top: '50%',
            transform: [{ translateY: -config.thumbSize / 2 }],
            left: checked ? config.width - config.thumbSize - 2 : 2,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          } as any}
        />
      </Pressable>
    );
  }

  // Native implementation
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