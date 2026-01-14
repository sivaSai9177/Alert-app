import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Ionicons } from '@expo/vector-icons';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string | Date;
  icon?: React.ReactNode;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  status?: 'completed' | 'active' | 'pending';
  content?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  variant?: 'default' | 'compact' | 'detailed';
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  showConnectors?: boolean;
  activeIndex?: number;
  style?: ViewStyle;
  testID?: string;
}

export const Timeline = React.forwardRef<View, TimelineProps>(
  (
    {
      items,
      orientation = 'vertical',
      variant = 'default',
      lineStyle = 'solid',
      showConnectors = true,
      activeIndex,
      style,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();

    const variantConfig = {
      compact: {
        iconSize: 24,
        lineWidth: 2,
        spacing: 2,
        titleSize: 'sm' as const,
        descriptionSize: 'xs' as const,
      },
      default: {
        iconSize: 32,
        lineWidth: 2,
        spacing: 3,
        titleSize: 'md' as const,
        descriptionSize: 'sm' as const,
      },
      detailed: {
        iconSize: 40,
        lineWidth: 3,
        spacing: 4,
        titleSize: 'lg' as const,
        descriptionSize: 'md' as const,
      },
    }[variant];

    const getItemStatus = (index: number, item: TimelineItem): TimelineItem['status'] => {
      if (item.status) return item.status;
      if (activeIndex === undefined) return 'completed';
      if (index < activeIndex) return 'completed';
      if (index === activeIndex) return 'active';
      return 'pending';
    };

    const getItemColor = (status: TimelineItem['status']) => {
      switch (status) {
        case 'completed':
          return theme.success || theme.primary;
        case 'active':
          return theme.primary;
        case 'pending':
          return theme.mutedForeground;
        default:
          return theme.foreground;
      }
    };

    const containerStyle: ViewStyle = {
      flexDirection: orientation === 'vertical' ? 'column' : 'row',
      ...style,
    };

    const renderIcon = (item: TimelineItem, status: TimelineItem['status']) => {
      const iconColor = item.iconColor || getItemColor(status);
      const iconContainerStyle: ViewStyle = {
        width: variantConfig.iconSize,
        height: variantConfig.iconSize,
        borderRadius: variantConfig.iconSize / 2,
        backgroundColor: status === 'active' ? iconColor : theme.background,
        borderWidth: 2,
        borderColor: iconColor,
        alignItems: 'center',
        justifyContent: 'center',
      };

      if (item.icon) {
        return <View style={iconContainerStyle}>{item.icon}</View>;
      }

      if (item.iconName) {
        return (
          <View style={iconContainerStyle}>
            <Ionicons
              name={item.iconName}
              size={variantConfig.iconSize * 0.6}
              color={status === 'active' ? theme.background : iconColor}
            />
          </View>
        );
      }

      // Default icons based on status
      const defaultIcons = {
        completed: 'checkmark',
        active: 'ellipse',
        pending: 'ellipse-outline',
      };

      return (
        <View style={iconContainerStyle}>
          <Ionicons
            name={defaultIcons[status] as keyof typeof Ionicons.glyphMap}
            size={variantConfig.iconSize * 0.6}
            color={status === 'active' ? theme.background : iconColor}
          />
        </View>
      );
    };

    const renderConnector = (status: TimelineItem['status'], isLast: boolean) => {
      if (!showConnectors || isLast) return null;

      const lineColor = getItemColor(status);
      const connectorStyle: ViewStyle = {
        position: 'absolute',
        backgroundColor: lineColor,
        ...(orientation === 'vertical'
          ? {
              width: variantConfig.lineWidth,
              top: variantConfig.iconSize,
              bottom: 0,
              left: variantConfig.iconSize / 2 - variantConfig.lineWidth / 2,
            }
          : {
              height: variantConfig.lineWidth,
              left: variantConfig.iconSize,
              right: 0,
              top: variantConfig.iconSize / 2 - variantConfig.lineWidth / 2,
            }),
      };

      if (lineStyle === 'dashed') {
        // Simulate dashed line with multiple small views
        const dashLength = 4;
        const dashGap = 4;
        const isVertical = orientation === 'vertical';
        
        return (
          <View style={connectorStyle}>
            {/* This is a simplified version - in production, you'd want to calculate the exact number of dashes */}
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  backgroundColor: lineColor,
                  ...(isVertical
                    ? {
                        width: variantConfig.lineWidth,
                        height: dashLength,
                        top: i * (dashLength + dashGap),
                      }
                    : {
                        height: variantConfig.lineWidth,
                        width: dashLength,
                        left: i * (dashLength + dashGap),
                      }),
                }}
              />
            ))}
          </View>
        );
      }

      return <View style={connectorStyle} />;
    };

    const formatDate = (date: string | Date) => {
      if (typeof date === 'string') return date;
      return date.toLocaleDateString();
    };

    const renderTimelineItem = (item: TimelineItem, index: number) => {
      const status = getItemStatus(index, item);
      const isLast = index === items.length - 1;

      const itemContainerStyle: ViewStyle = {
        flexDirection: orientation === 'vertical' ? 'row' : 'column',
        alignItems: orientation === 'vertical' ? 'flex-start' : 'center',
        marginBottom: orientation === 'vertical' && !isLast ? spacing(variantConfig.spacing * 2) : 0,
        marginRight: orientation === 'horizontal' && !isLast ? spacing(variantConfig.spacing * 2) : 0,
        position: 'relative',
      };

      const contentContainerStyle: ViewStyle = {
        flex: 1,
        marginLeft: orientation === 'vertical' ? spacing(variantConfig.spacing) : 0,
        marginTop: orientation === 'horizontal' ? spacing(variantConfig.spacing) : 0,
      };

      return (
        <View key={item.id} style={itemContainerStyle}>
          {/* Icon and Connector */}
          <View style={{ position: 'relative' }}>
            {renderIcon(item, status)}
            {renderConnector(status, isLast)}
          </View>

          {/* Content */}
          <View style={contentContainerStyle}>
            {item.date && variant !== 'compact' && (
              <Text
                size="xs"
                colorTheme="mutedForeground"
                style={{ marginBottom: spacing(1) }}
              >
                {formatDate(item.date)}
              </Text>
            )}
            
            <Text
              size={variantConfig.titleSize}
              weight="semibold"
              colorTheme={status === 'pending' ? 'mutedForeground' : 'foreground'}
            >
              {item.title}
            </Text>

            {item.description && variant !== 'compact' && (
              <Text
                size={variantConfig.descriptionSize}
                colorTheme="mutedForeground"
                style={{ marginTop: spacing(1) }}
              >
                {item.description}
              </Text>
            )}

            {item.content && variant === 'detailed' && (
              <View style={{ marginTop: spacing(2) }}>{item.content}</View>
            )}
          </View>
        </View>
      );
    };

    return (
      <View ref={ref} style={containerStyle} testID={testID}>
        {items.map((item, index) => renderTimelineItem(item, index))}
      </View>
    );
  }
);

Timeline.displayName = 'Timeline';

// Timeline Card Component (for more complex timeline items)
export interface TimelineCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  actions?: React.ReactNode;
  style?: ViewStyle;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  title,
  subtitle,
  description,
  tags,
  actions,
  style,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: spacing(3),
    borderWidth: 1,
    borderColor: theme.border,
    ...style,
  };

  return (
    <View style={cardStyle}>
      <Text size="md" weight="semibold">
        {title}
      </Text>
      
      {subtitle && (
        <Text size="sm" colorTheme="mutedForeground" style={{ marginTop: spacing(0.5) }}>
          {subtitle}
        </Text>
      )}

      {description && (
        <Text size="sm" style={{ marginTop: spacing(2) }}>
          {description}
        </Text>
      )}

      {tags && tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing(2) }}>
          {tags.map((tag, index) => (
            <View
              key={index}
              style={{
                backgroundColor: theme.muted,
                paddingHorizontal: spacing(2),
                paddingVertical: spacing(1),
                borderRadius: 4,
                marginRight: spacing(1),
                marginBottom: spacing(1),
              }}
            >
              <Text size="xs" colorTheme="mutedForeground">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {actions && <View style={{ marginTop: spacing(3) }}>{actions}</View>}
    </View>
  );
};