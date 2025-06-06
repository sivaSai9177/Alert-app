import React, { useRef, useState, useEffect } from 'react';
import { Animated, Platform, StyleSheet, View, Text as RNText } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Box } from './Box';
import { Text } from './Text';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';

interface ScrollHeaderProps {
  title: string;
  scrollY: Animated.Value;
  children?: React.ReactNode;
}

export function ScrollHeader({ title, scrollY, children }: ScrollHeaderProps) {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const insets = useSafeAreaInsets();
  const [showBorder, setShowBorder] = useState(false);

  // Threshold for when to show the header
  const HEADER_THRESHOLD = 50;

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setShowBorder(value > HEADER_THRESHOLD);
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY]);

  // Animated values for header appearance
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_THRESHOLD, HEADER_THRESHOLD + 20],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_THRESHOLD, HEADER_THRESHOLD + 20],
    outputRange: [20, 20, 0],
    extrapolate: 'clamp',
  });

  const headerHeight = Platform.select({
    ios: 44,
    android: 56,
    default: 56,
  });

  const totalHeaderHeight = headerHeight + insets.top;

  if (Platform.OS === 'web') {
    // Web implementation with backdrop filter
    return (
      <Animated.View
        style={[
          styles.header,
          {
            height: totalHeaderHeight,
            paddingTop: insets.top,
            backgroundColor: theme.background + 'E6', // 90% opacity
            borderBottomWidth: showBorder ? StyleSheet.hairlineWidth : 0,
            borderBottomColor: theme.border,
            opacity: headerOpacity,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          } as any,
        ]}
      >
        <View style={styles.headerContent}>
          <Animated.Text
            style={[
              styles.headerTitle,
              {
                color: theme.foreground,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            {title}
          </Animated.Text>
          {children}
        </View>
      </Animated.View>
    );
  }

  // Native implementation with BlurView
  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: totalHeaderHeight,
          opacity: headerOpacity,
        },
      ]}
    >
      <BlurView
        intensity={100}
        tint={theme.background === '#ffffff' ? 'light' : 'dark'}
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderBottomWidth: showBorder ? StyleSheet.hairlineWidth : 0,
            borderBottomColor: theme.border,
          },
        ]}
      />
      <View style={[styles.headerContent, { paddingTop: insets.top }]}>
        <Animated.Text
          style={[
            styles.headerTitle,
            {
              color: theme.foreground,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          {title}
        </Animated.Text>
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});