import React, { useState } from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Ionicons } from '@expo/vector-icons';

export interface RatingProps {
  value: number;
  onValueChange?: (value: number) => void;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  emptyColor?: string;
  icon?: 'star' | 'heart' | 'thumbs-up';
  allowHalf?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  labelFormat?: (value: number, max: number) => string;
  style?: ViewStyle;
  testID?: string;
}

export const Rating = React.forwardRef<View, RatingProps>(
  (
    {
      value,
      onValueChange,
      max = 5,
      size = 'md',
      color,
      emptyColor,
      icon = 'star',
      allowHalf = false,
      readonly = false,
      disabled = false,
      showLabel = false,
      labelFormat = (val, max) => `${val}/${max}`,
      style,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const sizeConfig = {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 40,
    };

    const iconSize = sizeConfig[size];
    const ratingColor = color || theme.warning || theme.primary;
    const emptyRatingColor = emptyColor || theme.muted;

    const iconMap = {
      star: { filled: 'star', empty: 'star-outline' },
      heart: { filled: 'heart', empty: 'heart-outline' },
      'thumbs-up': { filled: 'thumbs-up', empty: 'thumbs-up-outline' },
    };

    const getIconName = (index: number, isHalf: boolean = false): keyof typeof Ionicons.glyphMap => {
      const displayValue = hoverValue !== null ? hoverValue : value;
      
      if (index < Math.floor(displayValue)) {
        return iconMap[icon].filled as keyof typeof Ionicons.glyphMap;
      } else if (isHalf && index === Math.floor(displayValue) && displayValue % 1 >= 0.5) {
        return iconMap[icon].filled as keyof typeof Ionicons.glyphMap;
      } else {
        return iconMap[icon].empty as keyof typeof Ionicons.glyphMap;
      }
    };

    const getIconColor = (index: number) => {
      const displayValue = hoverValue !== null ? hoverValue : value;
      return index < displayValue ? ratingColor : emptyRatingColor;
    };

    const handlePress = (index: number, isHalf: boolean = false) => {
      if (readonly || disabled || !onValueChange) return;

      const newValue = isHalf && allowHalf ? index + 0.5 : index + 1;
      onValueChange(newValue);
    };

    const handleHover = (index: number, isHalf: boolean = false) => {
      if (readonly || disabled || !onValueChange) return;

      const newValue = isHalf && allowHalf ? index + 0.5 : index + 1;
      setHoverValue(newValue);
    };

    const handleHoverEnd = () => {
      setHoverValue(null);
    };

    const containerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      opacity: disabled ? 0.5 : 1,
      ...style,
    };

    const renderStar = (index: number) => {
      const isInteractive = !readonly && !disabled && onValueChange;

      if (allowHalf && isInteractive) {
        return (
          <View key={index} style={{ position: 'relative' }}>
            {/* Left half */}
            <Pressable
              onPress={() => handlePress(index, true)}
              onPressIn={() => handleHover(index, true)}
              onPressOut={handleHoverEnd}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: iconSize / 2,
                height: iconSize,
                zIndex: 2,
              }}
            />
            {/* Right half */}
            <Pressable
              onPress={() => handlePress(index, false)}
              onPressIn={() => handleHover(index, false)}
              onPressOut={handleHoverEnd}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: iconSize / 2,
                height: iconSize,
                zIndex: 2,
              }}
            />
            {/* Icon */}
            <Ionicons
              name={getIconName(index)}
              size={iconSize}
              color={getIconColor(index)}
              style={{ marginHorizontal: spacing(0.5) }}
            />
          </View>
        );
      }

      return (
        <Pressable
          key={index}
          onPress={() => handlePress(index)}
          onPressIn={() => handleHover(index)}
          onPressOut={handleHoverEnd}
          disabled={!isInteractive}
        >
          <Ionicons
            name={getIconName(index)}
            size={iconSize}
            color={getIconColor(index)}
            style={{ marginHorizontal: spacing(0.5) }}
          />
        </Pressable>
      );
    };

    return (
      <View ref={ref} style={containerStyle} testID={testID}>
        {Array.from({ length: max }, (_, index) => renderStar(index))}
        {showLabel && (
          <Text
            size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'}
            colorTheme="mutedForeground"
            style={{ marginLeft: spacing(2) }}
          >
            {labelFormat(value, max)}
          </Text>
        )}
      </View>
    );
  }
);

Rating.displayName = 'Rating';

// Rating Display Component (Read-only with additional info)
export interface RatingDisplayProps {
  value: number;
  max?: number;
  count?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showValue?: boolean;
  showCount?: boolean;
  style?: ViewStyle;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  value,
  max = 5,
  count,
  size = 'sm',
  showValue = true,
  showCount = true,
  style,
}) => {
  const { spacing } = useSpacing();

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Rating value={value} max={max} size={size} readonly />
      {(showValue || showCount) && (
        <Text
          size={size === 'xs' ? 'xs' : 'sm'}
          colorTheme="mutedForeground"
          style={{ marginLeft: spacing(2) }}
        >
          {showValue && value.toFixed(1)}
          {showValue && showCount && count && ' '}
          {showCount && count && `(${count.toLocaleString()})`}
        </Text>
      )}
    </View>
  );
};

// Rating Statistics Component
export interface RatingBreakdown {
  rating: number;
  count: number;
}

export interface RatingStatisticsProps {
  average: number;
  total: number;
  breakdown: RatingBreakdown[];
  max?: number;
  style?: ViewStyle;
}

export const RatingStatistics: React.FC<RatingStatisticsProps> = ({
  average,
  total,
  breakdown,
  max = 5,
  style,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  const maxCount = Math.max(...breakdown.map((b) => b.count));

  return (
    <View style={style}>
      {/* Average Rating */}
      <View style={{ alignItems: 'center', marginBottom: spacing(4) }}>
        <Text size="3xl" weight="bold">
          {average.toFixed(1)}
        </Text>
        <RatingDisplay value={average} max={max} showValue={false} showCount={false} />
        <Text size="sm" colorTheme="mutedForeground" style={{ marginTop: spacing(1) }}>
          {total.toLocaleString()} ratings
        </Text>
      </View>

      {/* Rating Breakdown */}
      <View>
        {breakdown
          .sort((a, b) => b.rating - a.rating)
          .map((item) => (
            <View
              key={item.rating}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing(2),
              }}
            >
              <Text size="sm" style={{ width: 20 }}>
                {item.rating}
              </Text>
              <Ionicons
                name="star"
                size={16}
                color={theme.warning || theme.primary}
                style={{ marginHorizontal: spacing(1) }}
              />
              <View
                style={{
                  flex: 1,
                  height: 8,
                  backgroundColor: theme.muted,
                  borderRadius: 4,
                  marginHorizontal: spacing(2),
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${(item.count / maxCount) * 100}%`,
                    backgroundColor: theme.warning || theme.primary,
                    borderRadius: 4,
                  }}
                />
              </View>
              <Text size="sm" colorTheme="mutedForeground" style={{ width: 50, textAlign: 'right' }}>
                {item.count}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
};