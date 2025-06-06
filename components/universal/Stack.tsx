import React from 'react';
import { View, ViewProps } from 'react-native';
import { Box, BoxProps } from './Box';
import { SpacingScale } from '@/lib/design-system';

interface StackProps extends BoxProps {
  spacing?: SpacingScale;
  direction?: 'horizontal' | 'vertical';
  divider?: React.ReactNode;
  children?: React.ReactNode;
}

export const Stack = React.forwardRef<View, StackProps>(({
  spacing = 0,
  direction = 'vertical',
  divider,
  children,
  ...props
}, ref) => {
  const childrenArray = React.Children.toArray(children).filter(Boolean);
  
  return (
    <Box
      ref={ref}
      flexDirection={direction === 'horizontal' ? 'row' : 'column'}
      gap={spacing}
      {...props}
    >
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {divider && index < childrenArray.length - 1 && divider}
        </React.Fragment>
      ))}
    </Box>
  );
});

Stack.displayName = 'Stack';

// Convenience components
export const VStack = React.forwardRef<View, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="vertical" {...props} />
));

export const HStack = React.forwardRef<View, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="horizontal" {...props} />
));

VStack.displayName = 'VStack';
HStack.displayName = 'HStack';