import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, ScrollViewProps } from 'react-native';
import { Box, BoxProps } from './Box';
import { useTheme } from '@/lib/theme/theme-provider';
import { designSystem } from '@/lib/design-system';

interface ContainerProps extends Omit<BoxProps, 'maxWidth'> {
  safe?: boolean;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
  children?: React.ReactNode;
}

export const Container = React.forwardRef<any, ContainerProps>(({
  safe = true,
  scroll = false,
  scrollProps = {},
  maxWidth = 'full',
  centered = true,
  children,
  style,
  ...props
}, ref) => {
  const theme = useTheme();
  
  const maxWidthValue = {
    sm: designSystem.breakpoints.sm,
    md: designSystem.breakpoints.md,
    lg: designSystem.breakpoints.lg,
    xl: designSystem.breakpoints.xl,
    '2xl': designSystem.breakpoints['2xl'],
    full: '100%' as const,
  }[maxWidth];
  
  const containerContent = (
    <Box
      flex={1}
      width="100%"
      maxWidth={maxWidthValue}
      alignSelf={centered ? 'center' : undefined}
      {...props}
    >
      {children}
    </Box>
  );
  
  const scrollContent = scroll ? (
    <ScrollView
      ref={ref}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {containerContent}
    </ScrollView>
  ) : (
    containerContent
  );
  
  if (safe) {
    return (
      <SafeAreaView
        ref={!scroll ? ref : undefined}
        style={[{ flex: 1, backgroundColor: theme.background }, style]}
      >
        {scrollContent}
      </SafeAreaView>
    );
  }
  
  return scrollContent;
});

Container.displayName = 'Container';