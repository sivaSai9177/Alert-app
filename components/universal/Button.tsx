import React from 'react';
import { Pressable, PressableProps, ActivityIndicator, ViewStyle, TextStyle, View, Platform } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { Text } from './Text';
import { Box } from './Box';
import { BorderRadius, SpacingScale, FontSize } from '@/lib/design-system';
import { useSpacing } from '@/contexts/SpacingContext';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';
type ButtonColorScheme = 'primary' | 'secondary' | 'destructive' | 'accent' | 'muted';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorScheme?: ButtonColorScheme;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  rounded?: BorderRadius;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void; // For web compatibility
}

// Button sizes will be defined dynamically based on spacing density

export const Button = React.forwardRef<View, ButtonProps>(({
  variant = 'solid',
  size = 'md',
  colorScheme = 'primary',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  children,
  rounded = 'md',
  fullWidth = false,
  style,
  textStyle,
  className,
  type,
  onClick,
  onPress,
  disabled,
  ...props
}, ref) => {
  const theme = useTheme();
  const { spacing, componentSpacing, componentSizes } = useSpacing();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const isDisabledState = disabled || isDisabled || isLoading;
  
  // Handle form submission for web
  const handlePress = React.useCallback(() => {
    if (isLoading) return;
    
    if (Platform.OS === "web" && type === "submit") {
      // For web form submission, we need to trigger the form's submit event
      const form = (ref as any)?.current?.closest("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
        return;
      }
    }
    
    // Use onClick for web, onPress for native
    if (onClick) onClick();
    if (onPress) onPress(null as any);
  }, [onClick, onPress, type, ref, isLoading]);

  // Get size configuration from spacing context
  const getButtonSize = () => {
    if (size === 'icon') {
      return { height: 40, minWidth: 40 };
    }
    const validSizes = ['sm', 'md', 'lg', 'xl'] as const;
    const sizeKey = validSizes.includes(size as any) ? size : 'md';
    return componentSizes.button[sizeKey as 'sm' | 'md' | 'lg' | 'xl'];
  };
  
  const buttonSize = getButtonSize();
  
  if (!buttonSize) {
    console.error(`Button: Invalid button size configuration for size "${size}"`);
    return null;
  }
  
  const config = {
    paddingX: size === 'icon' ? 0 : componentSpacing.buttonPadding.x as SpacingScale,
    paddingY: size === 'icon' ? 0 : componentSpacing.buttonPadding.y as SpacingScale,
    fontSize: size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : size === 'xl' ? 'xl' : 'base' as FontSize,
    iconSize: componentSpacing.iconSize,
  };
  
  // Get colors based on variant and color scheme
  const getButtonColors = () => {
    if (isDisabledState) {
      return {
        bg: theme.muted,
        text: theme.mutedForeground,
        border: theme.muted,
      };
    }

    const colors = {
      solid: {
        bg: theme[colorScheme] || theme.primary,
        text: theme[`${colorScheme}Foreground`] || (colorScheme === 'muted' ? theme.mutedForeground : theme.background),
        border: 'transparent',
        hover: {
          bg: (theme[colorScheme] || theme.primary) + 'e6', // 90% opacity
          text: theme[`${colorScheme}Foreground`] || (colorScheme === 'muted' ? theme.mutedForeground : theme.background),
        },
        active: {
          bg: (theme[colorScheme] || theme.primary) + 'cc', // 80% opacity
        },
      },
      outline: {
        bg: 'transparent',
        text: theme[colorScheme],
        border: theme[colorScheme],
        hover: {
          bg: theme[colorScheme] + '1a', // 10% opacity background
          text: theme[colorScheme],
        },
        active: {
          bg: theme[colorScheme] + '33', // 20% opacity
        },
      },
      ghost: {
        bg: 'transparent',
        text: theme[colorScheme],
        border: 'transparent',
        hover: {
          bg: theme[colorScheme] + '1a', // 10% opacity
          text: theme[colorScheme],
        },
        active: {
          bg: theme[colorScheme] + '33', // 20% opacity
        },
      },
      link: {
        bg: 'transparent',
        text: theme[colorScheme],
        border: 'transparent',
        hover: {
          bg: 'transparent',
          text: theme[colorScheme] + 'cc', // Slightly faded on hover
        },
        active: {
          bg: 'transparent',
        },
      },
      // Add 'secondary' as an alias for 'outline' with secondary color scheme
      secondary: {
        bg: 'transparent',
        text: theme.secondary || theme.foreground,
        border: theme.secondary || theme.border,
        hover: {
          bg: (theme.secondary || theme.foreground) + '1a', // 10% opacity background
          text: theme.secondary || theme.foreground,
        },
        active: {
          bg: (theme.secondary || theme.foreground) + '33', // 20% opacity
        },
      },
    };
    
    return colors[variant];
  };
  
  const colors = getButtonColors();
  if (!colors) {
    console.error(`Button: Invalid variant "${variant}"`);
    return null;
  }
  
  const currentBg = isPressed && 'active' in colors && colors.active ? colors.active.bg : (isHovered && 'hover' in colors && colors.hover ? colors.hover.bg : colors.bg);
  const currentText = isHovered && 'hover' in colors && colors.hover ? colors.hover.text : colors.text;
  
  const buttonStyle: ViewStyle = {
    paddingHorizontal: spacing[config.paddingX],
    paddingVertical: spacing[config.paddingY],
    borderRadius: componentSpacing.borderRadius,
    backgroundColor: currentBg,
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: buttonSize.height,
    minWidth: buttonSize.minWidth,
    ...(fullWidth && { width: '100%', minWidth: undefined }),
    ...(size === 'icon' && { width: buttonSize.minWidth }),
    // Web-specific styles
    ...(Platform.OS === 'web' && {
      cursor: isDisabledState ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      userSelect: 'none',
    } as any),
    ...style,
  };
  
  const buttonTextStyle: TextStyle = {
    color: currentText,
    ...(variant === 'link' && {
      textDecorationLine: 'underline',
      textDecorationStyle: 'solid',
      textDecorationColor: currentText,
    }),
    ...textStyle,
  };

  // Add web-specific event handlers
  const webHandlers = Platform.OS === 'web' ? {
    onHoverIn: () => !isDisabledState && setIsHovered(true),
    onHoverOut: () => setIsHovered(false),
    onPressIn: () => !isDisabledState && setIsPressed(true),
    onPressOut: () => setIsPressed(false),
  } : {};
  
  return (
    <Pressable
      ref={ref}
      disabled={isDisabledState}
      android_ripple={
        Platform.OS === 'android' && !isDisabledState
          ? {
              color: 'active' in colors && colors.active ? colors.active.bg : colors.bg + '40', // 25% opacity
              borderless: false,
            }
          : undefined
      }
      onPress={handlePress}
      style={buttonStyle}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabledState }}
      {...webHandlers}
      {...props}
    >
      <Box flexDirection="row" alignItems="center" gap={2}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.text}
            style={{ width: config.iconSize, height: config.iconSize }}
          />
        ) : leftIcon}
        
        {typeof children === 'string' ? (
          <Text
            size={config.fontSize}
            weight="medium"
            style={buttonTextStyle}
          >
            {children}
          </Text>
        ) : (
          children
        )}
        
        {!isLoading && rightIcon}
      </Box>
    </Pressable>
  );
});

Button.displayName = 'Button';