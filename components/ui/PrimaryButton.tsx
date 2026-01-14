import React from 'react';
import { Button } from '@/components/universal';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: any;
}

/**
 * Legacy compatibility wrapper for PrimaryButton.
 * This component now uses the universal Button component internally.
 * Consider using Button directly for new code.
 */
export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className,
  style,
}: PrimaryButtonProps) {
  // Map old variant prop to new Button props
  const mapVariantToButton = (): { variant: 'solid' | 'outline' | 'ghost', colorScheme: 'primary' | 'secondary' | 'destructive' | 'accent' | 'muted' } => {
    switch (variant) {
      case 'primary':
        return { variant: 'solid', colorScheme: 'primary' };
      case 'secondary':
        return { variant: 'solid', colorScheme: 'secondary' };
      case 'outline':
        return { variant: 'outline', colorScheme: 'primary' };
      case 'ghost':
        return { variant: 'ghost', colorScheme: 'primary' };
      default:
        return { variant: 'solid', colorScheme: 'primary' };
    }
  };

  const { variant: buttonVariant, colorScheme } = mapVariantToButton();

  return (
    <Button
      variant={buttonVariant}
      colorScheme={colorScheme}
      size={size}
      isDisabled={disabled}
      isLoading={loading}
      onPress={onPress}
      fullWidth={false}
      style={style}
      className={className}
    >
      {title}
    </Button>
  );
}