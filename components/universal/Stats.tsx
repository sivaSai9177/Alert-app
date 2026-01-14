import React from 'react';
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Box } from './Box';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  iconColor?: string;
  variant?: 'default' | 'compact' | 'large';
  colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
  testID?: string;
}

export const StatCard = React.forwardRef<View, StatCardProps>(
  (
    {
      label,
      value,
      change,
      changeLabel,
      trend,
      icon,
      iconColor,
      variant = 'default',
      colorScheme = 'primary',
      style,
      labelStyle,
      valueStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();

    const sizeMap = {
      compact: {
        padding: spacing[3],
        iconSize: 20,
        valueSize: 20,
        labelSize: 12,
        changeSize: 11,
      },
      default: {
        padding: spacing[4],
        iconSize: 24,
        valueSize: 28,
        labelSize: 14,
        changeSize: 12,
      },
      large: {
        padding: spacing[5],
        iconSize: 32,
        valueSize: 36,
        labelSize: 16,
        changeSize: 14,
      },
    };

    const colorMap = {
      primary: theme.primary,
      secondary: theme.secondary,
      success: theme.success,
      warning: theme.warning,
      danger: theme.destructive,
      info: theme.info || theme.primary,
    };

    const sizes = sizeMap[variant];
    const accentColor = colorMap[colorScheme];

    const getTrendIcon = () => {
      if (!trend && !change) return null;
      
      const actualTrend = trend || (change && change > 0 ? 'up' : 'down');
      const trendIcon = actualTrend === 'up' ? 'trending-up' : actualTrend === 'down' ? 'trending-down' : 'remove';
      const trendColor = actualTrend === 'up' ? theme.success : actualTrend === 'down' ? theme.destructive : theme.mutedForeground;
      
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing[2] }}>
          <Ionicons name={trendIcon as any} size={16} color={trendColor} />
          {change !== undefined && (
            <Text
              style={{
                color: trendColor,
                fontSize: sizes.changeSize,
                fontWeight: '500',
                marginLeft: spacing[1],
              }}
            >
              {change > 0 ? '+' : ''}{change}%
            </Text>
          )}
          {changeLabel && (
            <Text
              style={{
                color: theme.mutedForeground,
                fontSize: sizes.changeSize,
                marginLeft: spacing[1],
              }}
            >
              {changeLabel}
            </Text>
          )}
        </View>
      );
    };

    return (
      <Card
        ref={ref}
        p={0}
        style={[{ overflow: 'hidden' }, style]}
        testID={testID}
      >
        <View style={{ padding: sizes.padding }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  {
                    fontSize: sizes.labelSize,
                    color: theme.mutedForeground,
                    marginBottom: spacing[1],
                  },
                  labelStyle,
                ]}
              >
                {label}
              </Text>
              <Text
                style={[
                  {
                    fontSize: sizes.valueSize,
                    fontWeight: 'bold',
                    color: theme.foreground,
                  },
                  valueStyle,
                ]}
              >
                {value}
              </Text>
              {getTrendIcon()}
            </View>
            
            {icon && (
              <View
                style={{
                  width: sizes.iconSize * 2,
                  height: sizes.iconSize * 2,
                  borderRadius: sizes.iconSize,
                  backgroundColor: `${iconColor || accentColor}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: spacing[3],
                }}
              >
                <Ionicons
                  name={icon as any}
                  size={sizes.iconSize}
                  color={iconColor || accentColor}
                />
              </View>
            )}
          </View>
        </View>
        
        {/* Accent bar at bottom */}
        <View
          style={{
            height: 3,
            backgroundColor: accentColor,
          }}
        />
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

// Stats Grid Component
export interface StatsGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  style?: ViewStyle;
  testID?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  columns = 2,
  gap,
  style,
  testID,
}) => {
  const { spacing } = useSpacing();
  const actualGap = gap ?? spacing[3];

  const childrenArray = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  
  for (let i = 0; i < childrenArray.length; i += columns) {
    rows.push(childrenArray.slice(i, i + columns));
  }

  return (
    <View style={style} testID={testID}>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: 'row',
            marginBottom: rowIndex < rows.length - 1 ? actualGap : 0,
          }}
        >
          {row.map((child, colIndex) => (
            <View
              key={colIndex}
              style={{
                flex: 1,
                marginRight: colIndex < row.length - 1 ? actualGap : 0,
              }}
            >
              {child}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// Stat List Component
export interface StatListProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: string;
    color?: string;
  }>;
  variant?: 'default' | 'compact';
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
  testID?: string;
}

export const StatList: React.FC<StatListProps> = ({
  stats,
  variant = 'default',
  orientation = 'horizontal',
  style,
  testID,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  const isCompact = variant === 'compact';
  const isHorizontal = orientation === 'horizontal';

  return (
    <ScrollView
      horizontal={isHorizontal}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={style}
      testID={testID}
    >
      <View
        style={{
          flexDirection: isHorizontal ? 'row' : 'column',
        }}
      >
        {stats.map((stat, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: isCompact ? spacing[2] : spacing[3],
              paddingHorizontal: isCompact ? spacing[3] : spacing[4],
              marginRight: isHorizontal && index < stats.length - 1 ? spacing[2] : 0,
              marginBottom: !isHorizontal && index < stats.length - 1 ? spacing[2] : 0,
              backgroundColor: theme.card,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {stat.icon && (
              <View
                style={{
                  marginRight: spacing[2],
                }}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={isCompact ? 18 : 24}
                  color={stat.color || theme.primary}
                />
              </View>
            )}
            <View>
              <Text
                style={{
                  fontSize: isCompact ? 11 : 12,
                  color: theme.mutedForeground,
                }}
              >
                {stat.label}
              </Text>
              <Text
                style={{
                  fontSize: isCompact ? 16 : 20,
                  fontWeight: 'bold',
                  color: theme.foreground,
                  marginTop: spacing[0.5],
                }}
              >
                {stat.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Mini Stat Component
export interface MiniStatProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

export const MiniStat: React.FC<MiniStatProps> = ({
  label,
  value,
  icon,
  color,
  style,
  testID,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing[2],
        },
        style,
      ]}
      testID={testID}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={16}
          color={color || theme.primary}
          style={{ marginRight: spacing[2] }}
        />
      )}
      <Text
        style={{
          fontSize: 12,
          color: theme.mutedForeground,
          marginRight: spacing[1],
        }}
      >
        {label}:
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: color || theme.foreground,
        }}
      >
        {value}
      </Text>
    </View>
  );
};