import React from 'react';
import { 
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Link as ExpoLink, Href } from 'expo-router';
import { useTheme } from '@/lib/theme/theme-provider';
import { Text, TextProps } from './Text';

export interface UniversalLinkProps extends Omit<PressableProps, 'onPress' | 'style'> {
  href: Href;
  onPress?: () => void;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  underlayColor?: string;
  hoverStyle?: ViewStyle;
  pressStyle?: ViewStyle;
  disabled?: boolean;
  asChild?: boolean;
  replace?: boolean;
  push?: boolean;
  children?: React.ReactNode;
  textProps?: TextProps;
  variant?: 'default' | 'primary' | 'destructive' | 'ghost';
  style?: ViewStyle | ((state: PressableStateCallbackType) => ViewStyle);
}

export const UniversalLink = React.forwardRef<any, UniversalLinkProps>(({
  href,
  onPress,
  onHoverIn,
  onHoverOut,
  onPressIn,
  onPressOut,
  underlayColor,
  hoverStyle,
  pressStyle,
  disabled = false,
  asChild = false,
  replace = false,
  push = false,
  children,
  style,
  textProps = {},
  variant = 'primary',
  ...props
}, ref) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  // Get variant colors with hover states using theme colors
  const variantColors = React.useMemo(() => {
    return {
      default: {
        text: theme.foreground,
        hoverText: theme.primary,
        underline: 'none' as const,
      },
      primary: {
        text: theme.primary, // Use theme primary instead of hardcoded blue
        hoverText: theme.primary + 'dd', // Slightly darker on hover (87% opacity)
        underline: 'underline' as const,
      },
      destructive: {
        text: theme.destructive,
        hoverText: theme.destructive + 'dd', // Slightly darker on hover
        underline: 'underline' as const,
      },
      ghost: {
        text: theme.mutedForeground,
        hoverText: theme.foreground,
        underline: 'none' as const,
      },
    };
  }, [theme]);

  const currentVariant = variantColors[variant];

  const handleHoverIn = () => {
    setIsHovered(true);
    onHoverIn?.();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    onHoverOut?.();
  };

  const handlePressIn = () => {
    setIsPressed(true);
    onPressIn?.();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    onPressOut?.();
  };

  const combinedStyle = React.useMemo(() => {
    const styles = [
      style,
      isHovered && hoverStyle,
      isPressed && pressStyle,
    ].filter(Boolean);
    
    return styles.length > 0 ? StyleSheet.flatten(styles) : undefined;
  }, [style, isHovered, hoverStyle, isPressed, pressStyle]);

  const linkTextStyle: TextStyle = {
    color: isPressed ? currentVariant.hoverText : (isHovered ? currentVariant.hoverText : currentVariant.text),
    textDecorationLine: isHovered ? currentVariant.underline : 'none',
    opacity: disabled ? 0.5 : (isPressed ? 0.8 : 1),
  };

  // If asChild is true, render children directly in the link
  if (asChild) {
    return (
      <ExpoLink
        href={href}
        replace={replace}
        push={push}
        asChild
        disabled={disabled}
        onPress={onPress}
        {...(Platform.OS === 'web' && {
          onMouseEnter: handleHoverIn,
          onMouseLeave: handleHoverOut,
        })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {Platform.OS === 'web' ? (
          <Pressable
            ref={ref}
            disabled={disabled}
            style={combinedStyle}
            {...props}
          >
            {children}
          </Pressable>
        ) : (
          <Pressable
            ref={ref}
            disabled={disabled}
            style={({ pressed }) => [
              combinedStyle,
              { opacity: pressed ? 0.7 : 1 }
            ] as ViewStyle}
            {...props}
          >
            {children}
          </Pressable>
        )}
      </ExpoLink>
    );
  }

  // Default behavior - render text as link
  const content = typeof children === 'string' ? (
    <Text 
      {...textProps}
      style={StyleSheet.flatten([textProps.style, linkTextStyle])}
    >
      {children}
    </Text>
  ) : children;

  if (Platform.OS === 'web') {
    return (
      <ExpoLink
        href={href}
        replace={replace}
        push={push}
        asChild
        disabled={disabled}
        onPress={onPress}
      >
        <Pressable
          ref={ref}
          disabled={disabled}
          style={combinedStyle}
          onHoverIn={handleHoverIn}
          onHoverOut={handleHoverOut}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...props}
        >
          {content}
        </Pressable>
      </ExpoLink>
    );
  }

  return (
    <ExpoLink
      href={href}
      replace={replace}
      push={push}
      asChild
      disabled={disabled}
      onPress={onPress}
    >
      <Pressable
        ref={ref}
        disabled={disabled}
        style={({ pressed }) => [
          combinedStyle,
          { opacity: pressed ? 0.7 : 1 }
        ] as ViewStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {content}
      </Pressable>
    </ExpoLink>
  );
});

UniversalLink.displayName = 'UniversalLink';

// Convenience component for inline text links
export const TextLink: React.FC<UniversalLinkProps & { size?: TextProps['size']; weight?: TextProps['weight'] }> = ({
  children,
  size = 'sm',
  weight = 'medium',
  ...props
}) => {
  return (
    <UniversalLink
      {...props}
      textProps={{ size, weight }}
    >
      {children}
    </UniversalLink>
  );
};