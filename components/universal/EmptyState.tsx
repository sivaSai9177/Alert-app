import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text, Heading3 } from './Text';
import { Button } from './Button';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Ionicons } from '@expo/vector-icons';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  variant?: 'default' | 'compact' | 'large';
  style?: ViewStyle;
  testID?: string;
}

export const EmptyState = React.forwardRef<View, EmptyStateProps>(
  (
    {
      title = 'No data found',
      description,
      icon,
      iconName = 'folder-open-outline',
      iconSize,
      action,
      secondaryAction,
      variant = 'default',
      style,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();

    const sizeConfig = {
      compact: {
        iconSize: 48,
        spacing: 2,
        titleSize: 'md' as const,
        descriptionSize: 'sm' as const,
      },
      default: {
        iconSize: 64,
        spacing: 3,
        titleSize: 'lg' as const,
        descriptionSize: 'md' as const,
      },
      large: {
        iconSize: 80,
        spacing: 4,
        titleSize: 'xl' as const,
        descriptionSize: 'md' as const,
      },
    }[variant];

    const containerStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing(6),
      ...style,
    };

    const iconContainerStyle: ViewStyle = {
      marginBottom: spacing(sizeConfig.spacing),
    };

    const textContainerStyle: ViewStyle = {
      alignItems: 'center',
      marginBottom: action || secondaryAction ? spacing(sizeConfig.spacing) : 0,
    };

    const actionContainerStyle: ViewStyle = {
      flexDirection: 'row',
      gap: spacing(2),
    };

    const renderIcon = () => {
      if (icon) {
        return icon;
      }

      return (
        <View
          style={{
            width: sizeConfig.iconSize + spacing(4),
            height: sizeConfig.iconSize + spacing(4),
            borderRadius: (sizeConfig.iconSize + spacing(4)) / 2,
            backgroundColor: theme.muted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={iconName}
            size={iconSize || sizeConfig.iconSize}
            color={theme.mutedForeground}
          />
        </View>
      );
    };

    return (
      <View ref={ref} style={containerStyle} testID={testID}>
        <View style={iconContainerStyle}>{renderIcon()}</View>

        <View style={textContainerStyle}>
          <Heading3
            size={sizeConfig.titleSize}
            colorTheme="foreground"
            style={{ marginBottom: spacing(1), textAlign: 'center' }}
          >
            {title}
          </Heading3>
          {description && (
            <Text
              size={sizeConfig.descriptionSize}
              colorTheme="mutedForeground"
              style={{ textAlign: 'center', maxWidth: 300 }}
            >
              {description}
            </Text>
          )}
        </View>

        {(action || secondaryAction) && (
          <View style={actionContainerStyle}>
            {secondaryAction && (
              <Button
                variant="outline"
                size={variant === 'compact' ? 'sm' : 'md'}
                onPress={secondaryAction.onPress}
              >
                {secondaryAction.label}
              </Button>
            )}
            {action && (
              <Button
                variant="solid"
                size={variant === 'compact' ? 'sm' : 'md'}
                onPress={action.onPress}
              >
                {action.label}
              </Button>
            )}
          </View>
        )}
      </View>
    );
  }
);

EmptyState.displayName = 'EmptyState';

// Pre-configured empty states
export const NoDataEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'iconName'>> = (props) => (
  <EmptyState
    title="No data found"
    description="There's no data to display at the moment."
    iconName="folder-open-outline"
    {...props}
  />
);

export const NoResultsEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'iconName'>> = (props) => (
  <EmptyState
    title="No results found"
    description="Try adjusting your search or filters to find what you're looking for."
    iconName="search-outline"
    {...props}
  />
);

export const ErrorEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'iconName'>> = (props) => (
  <EmptyState
    title="Something went wrong"
    description="We couldn't load the data. Please try again."
    iconName="alert-circle-outline"
    action={{ label: 'Retry', onPress: () => {} }}
    {...props}
  />
);

export const OfflineEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'iconName'>> = (props) => (
  <EmptyState
    title="No internet connection"
    description="Please check your connection and try again."
    iconName="wifi-outline"
    action={{ label: 'Retry', onPress: () => {} }}
    {...props}
  />
);

export const NoAccessEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'iconName'>> = (props) => (
  <EmptyState
    title="Access denied"
    description="You don't have permission to view this content."
    iconName="lock-closed-outline"
    {...props}
  />
);