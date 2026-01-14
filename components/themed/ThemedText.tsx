import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { cn } from '@/lib/core/utils';

export interface ThemedTextProps extends RNTextProps {
  variant?: 'default' | 'muted' | 'primary' | 'destructive' | 'card';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

export function ThemedText({
  variant = 'default',
  size = 'base',
  weight = 'normal',
  style,
  className,
  children,
  ...props
}: ThemedTextProps) {
  const theme = useTheme();

  const getColor = () => {
    switch (variant) {
      case 'muted':
        return theme.mutedForeground;
      case 'primary':
        return theme.primary;
      case 'destructive':
        return theme.destructive;
      case 'card':
        return theme.cardForeground;
      default:
        return theme.foreground;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'xs':
        return 12;
      case 'sm':
        return 14;
      case 'base':
        return 16;
      case 'lg':
        return 18;
      case 'xl':
        return 20;
      case '2xl':
        return 24;
      case '3xl':
        return 30;
      default:
        return 16;
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'medium':
        return '500';
      case 'semibold':
        return '600';
      case 'bold':
        return '700';
      default:
        return '400';
    }
  };

  return (
    <RNText
      className={cn(className)}
      style={[
        {
          color: getColor(),
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Convenience components
export const Heading = (props: ThemedTextProps) => (
  <ThemedText weight="bold" size="2xl" {...props} />
);

export const Subheading = (props: ThemedTextProps) => (
  <ThemedText weight="semibold" size="lg" {...props} />
);

export const MutedText = (props: ThemedTextProps) => (
  <ThemedText variant="muted" {...props} />
);

export const Label = (props: ThemedTextProps) => (
  <ThemedText weight="medium" size="sm" {...props} />
);