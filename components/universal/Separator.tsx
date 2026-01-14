import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/lib/theme/enhanced-theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { SpacingScale } from '@/lib/design-system';

export interface SeparatorProps extends ViewProps {
  // Orientation
  orientation?: 'horizontal' | 'vertical';
  
  // Spacing
  my?: SpacingScale; // margin top/bottom for horizontal
  mx?: SpacingScale; // margin left/right for vertical
  
  // Styling
  thickness?: number;
  colorTheme?: 'border' | 'muted' | 'primary' | 'secondary';
  opacity?: number;
  
  // Decorative
  decorative?: boolean;
  
  // Layout
  flex?: boolean;
}

export const Separator = React.forwardRef<View, SeparatorProps>(({
  orientation = 'horizontal',
  my,
  mx,
  thickness = 1,
  colorTheme = 'border',
  opacity = 1,
  decorative = true,
  flex = false,
  style,
  ...props
}, ref) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  
  const isHorizontal = orientation === 'horizontal';
  
  // Calculate margins based on orientation
  const marginVertical = isHorizontal && my !== undefined ? spacing[my] : 0;
  const marginHorizontal = !isHorizontal && mx !== undefined ? spacing[mx] : 0;
  
  // Build style object
  const separatorStyle: ViewProps['style'] = {
    // Dimensions
    width: isHorizontal ? '100%' : thickness,
    height: isHorizontal ? thickness : '100%',
    
    // Margins
    ...(marginVertical > 0 && {
      marginTop: marginVertical,
      marginBottom: marginVertical,
    }),
    ...(marginHorizontal > 0 && {
      marginLeft: marginHorizontal,
      marginRight: marginHorizontal,
    }),
    
    // Color
    backgroundColor: theme[colorTheme] || theme.border,
    opacity,
    
    // Flex
    ...(flex && { flex: 1 }),
  };
  
  return (
    <View
      ref={ref}
      style={[separatorStyle, style]}
      accessibilityRole={decorative ? 'none' : 'separator'}
      aria-hidden={decorative}
      {...props}
    />
  );
});

Separator.displayName = 'Separator';

// Convenience components
export const HSeparator = React.forwardRef<View, Omit<SeparatorProps, 'orientation'>>((props, ref) => (
  <Separator ref={ref} orientation="horizontal" {...props} />
));

export const VSeparator = React.forwardRef<View, Omit<SeparatorProps, 'orientation'>>((props, ref) => (
  <Separator ref={ref} orientation="vertical" {...props} />
));

HSeparator.displayName = 'HSeparator';
VSeparator.displayName = 'VSeparator';