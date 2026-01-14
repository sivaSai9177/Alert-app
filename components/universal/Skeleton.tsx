import React from 'react';
import { View, ViewStyle, Animated, Easing } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { Box } from './Box';
import { useSpacing } from '@/contexts/SpacingContext';
import { SpacingScale } from '@/lib/design-system';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animated?: boolean;
  style?: ViewStyle;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  lines?: number; // For text skeleton
  spacing?: SpacingScale; // Space between lines
}

export const Skeleton = React.forwardRef<View, SkeletonProps>(({
  width,
  height,
  rounded = 'md',
  animated = true,
  style,
  variant = 'default',
  lines = 1,
  spacing = 2,
}, ref) => {
  const theme = useTheme();
  const { spacing: spacingValues } = useSpacing();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  // Theme-aware colors
  const baseColor = theme.muted;
  const highlightColor = theme.accent;

  // Variant-based dimensions
  const getVariantDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: width || '100%', height: height || 16 };
      case 'circular':
        const size = width || height || 40;
        return { width: size, height: size };
      case 'rectangular':
        return { width: width || '100%', height: height || 100 };
      default:
        return { width: width || '100%', height: height || 20 };
    }
  };

  const dimensions = getVariantDimensions();

  const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    full: variant === 'circular' ? 999 : 999,
  }[rounded];

  // Animation setup
  React.useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderSkeleton = (key?: number) => (
    <Animated.View
      key={key}
      style={[
        {
          backgroundColor: baseColor,
          borderRadius,
          opacity: animated ? opacity : 0.5,
          width: dimensions.width,
          height: dimensions.height,
        },
        style,
      ]}
    />
  );

  if (variant === 'text' && lines > 1) {
    return (
      <View ref={ref}>
        {Array.from({ length: lines }, (_, i) => (
          <View key={i} style={{ marginBottom: i < lines - 1 ? spacingValues[spacing] : 0 }}>
            {renderSkeleton(i)}
          </View>
        ))}
      </View>
    );
  }

  return renderSkeleton();
});

Skeleton.displayName = 'Skeleton';

// Skeleton Container for complex loading states
export interface SkeletonContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  fade?: boolean;
}

export const SkeletonContainer: React.FC<SkeletonContainerProps> = ({
  isLoading,
  children,
  skeleton,
  fade = true,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(isLoading ? 0 : 1)).current;

  React.useEffect(() => {
    if (fade) {
      Animated.timing(fadeAnim, {
        toValue: isLoading ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, fade]);

  if (isLoading && skeleton) {
    return <>{skeleton}</>;
  }

  if (fade) {
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        {children}
      </Animated.View>
    );
  }

  return <>{children}</>;
};

// Pre-built skeleton templates
export const SkeletonTemplates = {
  Card: () => (
    <Box p={4} rounded="lg" bgTheme="card">
      <Skeleton variant="rectangular" height={200} rounded="md" />
      <Box mt={3}>
        <Skeleton variant="text" width="60%" />
        <Box mt={2}>
          <Skeleton variant="text" lines={3} spacing={2} />
        </Box>
      </Box>
    </Box>
  ),
  
  ListItem: () => (
    <Box p={4} flexDirection="row" alignItems="center">
      <Skeleton variant="circular" width={40} height={40} />
      <Box ml={3} flex={1}>
        <Skeleton variant="text" width="70%" />
        <Box mt={1}>
          <Skeleton variant="text" width="40%" height={12} />
        </Box>
      </Box>
    </Box>
  ),
  
  Profile: () => (
    <Box alignItems="center" p={4}>
      <Skeleton variant="circular" width={80} height={80} />
      <Box mt={3} width="100%" alignItems="center">
        <Skeleton variant="text" width="50%" height={20} />
        <Box mt={2}>
          <Skeleton variant="text" width="70%" height={14} />
        </Box>
      </Box>
    </Box>
  ),
};