import React, { useRef } from 'react';
import { Animated, ScrollViewProps, View, Platform } from 'react-native';
import { SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, BoxProps } from './Box';
import { ScrollHeader } from './ScrollHeader';
import { useTheme } from '@/lib/theme/theme-provider';
import { designSystem } from '@/lib/design-system';

interface ScrollContainerProps extends Omit<BoxProps, 'maxWidth'> {
  safe?: boolean;
  scrollProps?: ScrollViewProps;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
  headerTitle?: string;
  headerChildren?: React.ReactNode;
  children?: React.ReactNode;
}

export const ScrollContainer = React.forwardRef<any, ScrollContainerProps>(({
  safe = true,
  scrollProps = {},
  maxWidth = 'full',
  centered = true,
  headerTitle,
  headerChildren,
  children,
  style,
  ...props
}, ref) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const maxWidthValue = {
    sm: designSystem.breakpoints.sm,
    md: designSystem.breakpoints.md,
    lg: designSystem.breakpoints.lg,
    xl: designSystem.breakpoints.xl,
    '2xl': designSystem.breakpoints['2xl'],
    full: '100%' as const,
  }[maxWidth];

  const headerHeight = Platform.select({
    ios: 44,
    android: 56,
    default: 56,
  });

  const totalHeaderHeight = headerTitle ? headerHeight + insets.top : 0;
  
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
  
  const scrollContent = (
    <View style={{ flex: 1 }}>
      {headerTitle && (
        <ScrollHeader 
          title={headerTitle} 
          scrollY={scrollY}
          children={headerChildren}
        />
      )}
      <Animated.ScrollView
        ref={ref}
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingTop: totalHeaderHeight,
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        {...scrollProps}
      >
        {containerContent}
      </Animated.ScrollView>
    </View>
  );
  
  if (safe) {
    return (
      <SafeAreaView
        style={[{ flex: 1, backgroundColor: theme.background }, style]}
        edges={headerTitle ? ['left', 'right', 'bottom'] : undefined}
      >
        {scrollContent}
      </SafeAreaView>
    );
  }
  
  return scrollContent;
});

ScrollContainer.displayName = 'ScrollContainer';