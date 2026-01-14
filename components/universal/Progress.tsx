import React from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { Box } from './Box';
import { Text } from './Text';
import { useSpacing } from '@/contexts/SpacingContext';

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface ProgressProps {
  value: number; // 0-100
  max?: number;
  size?: ProgressSize;
  variant?: ProgressVariant;
  showValue?: boolean;
  animated?: boolean;
  indeterminate?: boolean;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  fillStyle?: ViewStyle;
}

// Theme-aware color mapping
const getProgressColors = (variant: ProgressVariant, theme: any) => {
  const colorMap = {
    default: {
      track: theme.muted,
      fill: theme.mutedForeground,
    },
    primary: {
      track: theme.primary + '33', // 20% opacity
      fill: theme.primary,
    },
    success: {
      track: theme.success + '33',
      fill: theme.success,
    },
    warning: {
      track: '#f59e0b' + '33',
      fill: '#f59e0b',
    },
    error: {
      track: theme.destructive + '33',
      fill: theme.destructive,
    },
  };
  
  return colorMap[variant];
};

export const Progress = React.forwardRef<View, ProgressProps>(({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showValue = false,
  animated = true,
  indeterminate = false,
  style,
  trackStyle,
  fillStyle,
}, ref) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  const colors = getProgressColors(variant, theme);
  
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const indeterminateAnimation = React.useRef(new Animated.Value(0)).current;
  
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Size configuration
  const sizeConfig = {
    xs: { height: 2, fontSize: 'xs' as const },
    sm: { height: 4, fontSize: 'sm' as const },
    md: { height: 8, fontSize: 'sm' as const },
    lg: { height: 12, fontSize: 'md' as const },
  };

  const config = sizeConfig[size];

  // Animate progress value changes
  React.useEffect(() => {
    if (animated && !indeterminate) {
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else if (!indeterminate) {
      animatedValue.setValue(percentage);
    }
  }, [percentage, animated, indeterminate]);

  // Indeterminate animation
  React.useEffect(() => {
    if (indeterminate) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(indeterminateAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(indeterminateAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [indeterminate]);

  const widthInterpolation = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const indeterminateTranslation = indeterminateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', '100%'],
  });

  return (
    <View ref={ref} style={style}>
      <View
        style={[
          {
            height: config.height,
            backgroundColor: colors.track,
            borderRadius: config.height / 2,
            overflow: 'hidden',
            width: '100%',
          },
          trackStyle,
        ]}
      >
        {indeterminate ? (
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '30%',
                backgroundColor: colors.fill,
                borderRadius: config.height / 2,
                transform: [{ translateX: indeterminateTranslation }],
              },
              fillStyle,
            ]}
          />
        ) : (
          <Animated.View
            style={[
              {
                height: '100%',
                backgroundColor: colors.fill,
                borderRadius: config.height / 2,
                width: widthInterpolation,
              },
              fillStyle,
            ]}
          />
        )}
      </View>
      
      {showValue && !indeterminate && (
        <Box mt={1}>
          <Text size={config.fontSize} colorTheme="mutedForeground">
            {Math.round(percentage)}%
          </Text>
        </Box>
      )}
    </View>
  );
});

Progress.displayName = 'Progress';

// Circular Progress Component
export interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showValue?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export const CircularProgress = React.forwardRef<View, CircularProgressProps>(({
  value,
  size = 60,
  strokeWidth = 4,
  variant = 'primary',
  showValue = true,
  animated = true,
  style,
}, ref) => {
  const theme = useTheme();
  const colors = getProgressColors(variant, theme);
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max(value, 0), 100);

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      animatedValue.setValue(percentage);
    }
  }, [percentage, animated]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View
      ref={ref}
      style={[
        {
          width: size,
          height: size,
          transform: [{ rotate: '-90deg' }],
        },
        style,
      ]}
    >
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.fill}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      
      {showValue && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{ rotate: '90deg' }],
          }}
        >
          <Text size="sm" weight="semibold">
            {Math.round(percentage)}%
          </Text>
        </View>
      )}
    </View>
  );
});

CircularProgress.displayName = 'CircularProgress';

// Note: For circular progress, we'll need to conditionally import SVG
const Svg = require('react-native-svg').Svg;
const Circle = require('react-native-svg').Circle;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);