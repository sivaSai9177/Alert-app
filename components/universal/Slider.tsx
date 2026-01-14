import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  Platform,
  AccessibilityInfo,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  thumbSize?: number;
  trackHeight?: number;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  marks?: boolean | number[];
  markLabels?: Record<number, string>;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  thumbStyle?: ViewStyle;
  activeTrackStyle?: ViewStyle;
  testID?: string;
}

export const Slider = React.forwardRef<View, SliderProps>(
  (
    {
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      thumbSize = 20,
      trackHeight = 4,
      showValue = false,
      valueFormat = (v) => v.toString(),
      marks = false,
      markLabels,
      style,
      trackStyle,
      thumbStyle,
      activeTrackStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    const [sliderWidth, setSliderWidth] = useState(0);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [isDragging, setIsDragging] = useState(false);

    // Calculate position from value
    const getPositionFromValue = useCallback(
      (val: number) => {
        const clampedValue = Math.max(min, Math.min(max, val));
        return ((clampedValue - min) / (max - min)) * sliderWidth;
      },
      [min, max, sliderWidth]
    );

    // Calculate value from position
    const getValueFromPosition = useCallback(
      (position: number) => {
        const percentage = Math.max(0, Math.min(1, position / sliderWidth));
        const rawValue = percentage * (max - min) + min;
        
        // Snap to step
        if (step > 0) {
          const steps = Math.round((rawValue - min) / step);
          return Math.max(min, Math.min(max, min + steps * step));
        }
        
        return rawValue;
      },
      [min, max, step, sliderWidth]
    );

    // Update animated value when value changes
    useEffect(() => {
      if (sliderWidth > 0) {
        animatedValue.setValue(getPositionFromValue(value));
      }
    }, [value, sliderWidth, getPositionFromValue, animatedValue]);

    // Pan responder for touch handling
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: () => {
          setIsDragging(true);
        },
        onPanResponderMove: (_, gestureState) => {
          const position = Math.max(0, Math.min(sliderWidth, gestureState.moveX));
          const newValue = getValueFromPosition(position);
          onValueChange(newValue);
          animatedValue.setValue(position);
        },
        onPanResponderRelease: () => {
          setIsDragging(false);
        },
      })
    ).current;

    const handleLayout = (event: LayoutChangeEvent) => {
      setSliderWidth(event.nativeEvent.layout.width);
    };

    const handleTrackPress = (event: any) => {
      if (disabled || sliderWidth === 0) return;
      
      const position = event.nativeEvent.locationX;
      const newValue = getValueFromPosition(position);
      onValueChange(newValue);
      
      Animated.timing(animatedValue, {
        toValue: getPositionFromValue(newValue),
        duration: 150,
        useNativeDriver: false,
      }).start();
    };

    // Generate mark positions
    const getMarkPositions = () => {
      if (!marks || sliderWidth === 0) return [];
      
      if (Array.isArray(marks)) {
        return marks.map((mark) => ({
          value: mark,
          position: getPositionFromValue(mark),
          label: markLabels?.[mark],
        }));
      }
      
      // Auto-generate marks
      const markCount = 5;
      const markStep = (max - min) / (markCount - 1);
      const positions = [];
      
      for (let i = 0; i < markCount; i++) {
        const markValue = min + i * markStep;
        positions.push({
          value: markValue,
          position: getPositionFromValue(markValue),
          label: markLabels?.[markValue],
        });
      }
      
      return positions;
    };

    const containerStyle: ViewStyle = {
      paddingVertical: spacing(3),
      opacity: disabled ? 0.5 : 1,
      ...style,
    };

    const defaultTrackStyle: ViewStyle = {
      height: trackHeight,
      backgroundColor: theme.muted,
      borderRadius: trackHeight / 2,
      overflow: 'hidden',
      ...trackStyle,
    };

    const defaultActiveTrackStyle: ViewStyle = {
      height: trackHeight,
      backgroundColor: theme.primary,
      position: 'absolute',
      left: 0,
      ...activeTrackStyle,
    };

    const defaultThumbStyle: ViewStyle = {
      width: thumbSize,
      height: thumbSize,
      borderRadius: thumbSize / 2,
      backgroundColor: theme.primary,
      borderWidth: 2,
      borderColor: theme.background,
      position: 'absolute',
      top: -((thumbSize - trackHeight) / 2),
      boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
      elevation: 3,
      transform: isDragging ? [{ scale: 1.2 }] : [{ scale: 1 }],
      ...thumbStyle,
    };

    const markStyle: ViewStyle = {
      position: 'absolute',
      width: 2,
      height: trackHeight + 4,
      backgroundColor: theme.mutedForeground,
      top: -2,
    };

    const markLabelStyle: TextStyle = {
      position: 'absolute',
      top: trackHeight + spacing(2),
      fontSize: 12,
      color: theme.mutedForeground,
    };

    const valueStyle: TextStyle = {
      position: 'absolute',
      top: -(thumbSize + spacing(4)),
      backgroundColor: theme.foreground,
      color: theme.background,
      paddingHorizontal: spacing(2),
      paddingVertical: spacing(1),
      borderRadius: 4,
      fontSize: 12,
      minWidth: 40,
      textAlign: 'center',
    };

    return (
      <View ref={ref} style={containerStyle} testID={testID}>
        {showValue && isDragging && (
          <Animated.View
            style={[
              valueStyle,
              {
                transform: [
                  {
                    translateX: Animated.add(
                      animatedValue,
                      new Animated.Value(-20)
                    ),
                  },
                ],
              },
            ]}
          >
            <Text style={{ color: theme.background }}>
              {valueFormat(value)}
            </Text>
          </Animated.View>
        )}
        
        <View
          style={defaultTrackStyle}
          onLayout={handleLayout}
          onTouchEnd={handleTrackPress}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[
              defaultActiveTrackStyle,
              {
                width: animatedValue,
              },
            ]}
          />
          
          {getMarkPositions().map((mark, index) => (
            <React.Fragment key={index}>
              <View
                style={[
                  markStyle,
                  {
                    left: mark.position - 1,
                  },
                ]}
              />
              {mark.label && (
                <Text
                  style={[
                    markLabelStyle,
                    {
                      left: mark.position,
                      transform: [{ translateX: -20 }],
                    },
                  ]}
                >
                  {mark.label}
                </Text>
              )}
            </React.Fragment>
          ))}
          
          <Animated.View
            style={[
              defaultThumbStyle,
              {
                transform: [
                  {
                    translateX: Animated.add(
                      animatedValue,
                      new Animated.Value(-thumbSize / 2)
                    ),
                  },
                  {
                    scale: isDragging ? 1.2 : 1,
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    );
  }
);

Slider.displayName = 'Slider';

// Range Slider Component
export interface RangeSliderProps {
  values: [number, number];
  onValuesChange: (values: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  thumbSize?: number;
  trackHeight?: number;
  showValues?: boolean;
  valueFormat?: (value: number) => string;
  minDistance?: number;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  thumbStyle?: ViewStyle;
  activeTrackStyle?: ViewStyle;
  testID?: string;
}

export const RangeSlider = React.forwardRef<View, RangeSliderProps>(
  (
    {
      values,
      onValuesChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      thumbSize = 20,
      trackHeight = 4,
      showValues = false,
      valueFormat = (v) => v.toString(),
      minDistance = 0,
      style,
      trackStyle,
      thumbStyle,
      activeTrackStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    const [sliderWidth, setSliderWidth] = useState(0);
    const animatedLow = useRef(new Animated.Value(0)).current;
    const animatedHigh = useRef(new Animated.Value(0)).current;
    const [activeDrag, setActiveDrag] = useState<'low' | 'high' | null>(null);

    // Calculate position from value
    const getPositionFromValue = useCallback(
      (val: number) => {
        const clampedValue = Math.max(min, Math.min(max, val));
        return ((clampedValue - min) / (max - min)) * sliderWidth;
      },
      [min, max, sliderWidth]
    );

    // Calculate value from position
    const getValueFromPosition = useCallback(
      (position: number) => {
        const percentage = Math.max(0, Math.min(1, position / sliderWidth));
        const rawValue = percentage * (max - min) + min;
        
        // Snap to step
        if (step > 0) {
          const steps = Math.round((rawValue - min) / step);
          return Math.max(min, Math.min(max, min + steps * step));
        }
        
        return rawValue;
      },
      [min, max, step, sliderWidth]
    );

    // Update animated values when values change
    useEffect(() => {
      if (sliderWidth > 0) {
        animatedLow.setValue(getPositionFromValue(values[0]));
        animatedHigh.setValue(getPositionFromValue(values[1]));
      }
    }, [values, sliderWidth, getPositionFromValue, animatedLow, animatedHigh]);

    // Create pan responders for both thumbs
    const createPanResponder = (isLow: boolean) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: () => {
          setActiveDrag(isLow ? 'low' : 'high');
        },
        onPanResponderMove: (_, gestureState) => {
          const position = Math.max(0, Math.min(sliderWidth, gestureState.moveX));
          const newValue = getValueFromPosition(position);
          
          if (isLow) {
            const maxValue = values[1] - minDistance;
            const clampedValue = Math.min(newValue, maxValue);
            onValuesChange([clampedValue, values[1]]);
            animatedLow.setValue(getPositionFromValue(clampedValue));
          } else {
            const minValue = values[0] + minDistance;
            const clampedValue = Math.max(newValue, minValue);
            onValuesChange([values[0], clampedValue]);
            animatedHigh.setValue(getPositionFromValue(clampedValue));
          }
        },
        onPanResponderRelease: () => {
          setActiveDrag(null);
        },
      });

    const lowPanResponder = useRef(createPanResponder(true)).current;
    const highPanResponder = useRef(createPanResponder(false)).current;

    const handleLayout = (event: LayoutChangeEvent) => {
      setSliderWidth(event.nativeEvent.layout.width);
    };

    const containerStyle: ViewStyle = {
      paddingVertical: spacing(3),
      opacity: disabled ? 0.5 : 1,
      ...style,
    };

    const defaultTrackStyle: ViewStyle = {
      height: trackHeight,
      backgroundColor: theme.muted,
      borderRadius: trackHeight / 2,
      overflow: 'visible',
      ...trackStyle,
    };

    const defaultActiveTrackStyle: ViewStyle = {
      height: trackHeight,
      backgroundColor: theme.primary,
      position: 'absolute',
      ...activeTrackStyle,
    };

    const defaultThumbStyle: ViewStyle = {
      width: thumbSize,
      height: thumbSize,
      borderRadius: thumbSize / 2,
      backgroundColor: theme.primary,
      borderWidth: 2,
      borderColor: theme.background,
      position: 'absolute',
      top: -((thumbSize - trackHeight) / 2),
      boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
      elevation: 3,
      zIndex: 2,
      ...thumbStyle,
    };

    return (
      <View ref={ref} style={containerStyle} testID={testID}>
        {showValues && activeDrag === 'low' && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -(thumbSize + spacing(4)),
                backgroundColor: theme.foreground,
                color: theme.background,
                paddingHorizontal: spacing(2),
                paddingVertical: spacing(1),
                borderRadius: 4,
                transform: [
                  {
                    translateX: Animated.add(
                      animatedLow,
                      new Animated.Value(-20)
                    ),
                  },
                ],
              },
            ]}
          >
            <Text style={{ color: theme.background, fontSize: 12 }}>
              {valueFormat(values[0])}
            </Text>
          </Animated.View>
        )}
        
        {showValues && activeDrag === 'high' && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -(thumbSize + spacing(4)),
                backgroundColor: theme.foreground,
                color: theme.background,
                paddingHorizontal: spacing(2),
                paddingVertical: spacing(1),
                borderRadius: 4,
                transform: [
                  {
                    translateX: Animated.add(
                      animatedHigh,
                      new Animated.Value(-20)
                    ),
                  },
                ],
              },
            ]}
          >
            <Text style={{ color: theme.background, fontSize: 12 }}>
              {valueFormat(values[1])}
            </Text>
          </Animated.View>
        )}
        
        <View style={defaultTrackStyle} onLayout={handleLayout}>
          <Animated.View
            style={[
              defaultActiveTrackStyle,
              {
                left: animatedLow,
                width: Animated.subtract(animatedHigh, animatedLow),
              },
            ]}
          />
          
          <Animated.View
            style={[
              defaultThumbStyle,
              {
                transform: [
                  {
                    translateX: Animated.add(
                      animatedLow,
                      new Animated.Value(-thumbSize / 2)
                    ),
                  },
                  {
                    scale: activeDrag === 'low' ? 1.2 : 1,
                  },
                ],
              },
            ]}
            {...lowPanResponder.panHandlers}
          />
          
          <Animated.View
            style={[
              defaultThumbStyle,
              {
                transform: [
                  {
                    translateX: Animated.add(
                      animatedHigh,
                      new Animated.Value(-thumbSize / 2)
                    ),
                  },
                  {
                    scale: activeDrag === 'high' ? 1.2 : 1,
                  },
                ],
              },
            ]}
            {...highPanResponder.panHandlers}
          />
        </View>
      </View>
    );
  }
);

RangeSlider.displayName = 'RangeSlider';