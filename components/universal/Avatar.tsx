import React from 'react';
import { View, Image, ImageSourcePropType, ViewStyle, ImageStyle, Pressable } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { Text } from './Text';
import { Box } from './Box';
import { useSpacing } from '@/contexts/SpacingContext';
import { Ionicons } from '@expo/vector-icons';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: AvatarSize;
  rounded?: 'full' | 'md' | 'lg' | 'none';
  showFallback?: boolean;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  bgColorTheme?: 'primary' | 'secondary' | 'accent' | 'muted';
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  onPress?: () => void;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const Avatar = React.forwardRef<View, AvatarProps>(({
  source,
  name = '',
  size = 'md',
  rounded = 'full',
  showFallback = true,
  fallbackIcon = 'person',
  bgColorTheme = 'muted',
  style,
  imageStyle,
  onPress,
}, ref) => {
  const theme = useTheme();
  const { componentSpacing } = useSpacing();
  const [imageError, setImageError] = React.useState(false);

  // Size mapping for avatars based on density
  const sizeMap = {
    xs: Math.round(componentSpacing.avatarSize * 0.6),  // 60% of base
    sm: Math.round(componentSpacing.avatarSize * 0.8),  // 80% of base
    md: componentSpacing.avatarSize,                     // 100% of base
    lg: Math.round(componentSpacing.avatarSize * 1.2),  // 120% of base
    xl: Math.round(componentSpacing.avatarSize * 1.4),  // 140% of base
    '2xl': Math.round(componentSpacing.avatarSize * 1.6), // 160% of base
  };

  const avatarSize = sizeMap[size];
  const fontSize = {
    xs: 10,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 30,
  }[size];

  const iconSize = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
  }[size];

  const borderRadius = {
    full: avatarSize / 2,
    lg: 12,
    md: 8,
    none: 0,
  }[rounded];

  // Theme-aware background colors
  const bgColors = {
    primary: theme.primary,
    secondary: theme.secondary,
    accent: theme.accent,
    muted: theme.muted,
  };

  const textColors = {
    primary: theme.primaryForeground,
    secondary: theme.secondaryForeground,
    accent: theme.accentForeground,
    muted: theme.mutedForeground,
  };

  const backgroundColor = bgColors[bgColorTheme];
  const textColor = textColors[bgColorTheme];

  const showImageFallback = !source || imageError;
  const initials = getInitials(name);

  const content = (
    <Box
      ref={ref}
      style={[
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius,
          backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {!showImageFallback && source ? (
        <Image
          source={source}
          style={[
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius,
            },
            imageStyle,
          ]}
          onError={() => setImageError(true)}
        />
      ) : showFallback ? (
        initials ? (
          <Text
            style={{
              fontSize,
              fontWeight: '600',
              color: textColor,
            }}
          >
            {initials}
          </Text>
        ) : (
          <Ionicons
            name={fallbackIcon}
            size={iconSize}
            color={textColor}
          />
        )
      ) : null}
    </Box>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.7 : 1 }}>
            {content}
          </View>
        )}
      </Pressable>
    );
  }

  return content;
});

Avatar.displayName = 'Avatar';

// Avatar Group Component
export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  spacing?: number;
  style?: ViewStyle;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 3,
  size = 'md',
  spacing = -8,
  style,
}) => {
  const theme = useTheme();
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {visibleChildren.map((child, index) => (
        <View
          key={index}
          style={{
            marginLeft: index === 0 ? 0 : spacing,
            zIndex: visibleChildren.length - index,
          }}
        >
          {React.cloneElement(child as React.ReactElement<AvatarProps>, {
            size,
            style: {
              borderWidth: 2,
              borderColor: theme.background,
            },
          })}
        </View>
      ))}
      {remainingCount > 0 && (
        <Avatar
          size={size}
          name={`+${remainingCount}`}
          bgColorTheme="primary"
          style={{
            marginLeft: spacing,
            borderWidth: 2,
            borderColor: theme.background,
          }}
        />
      )}
    </View>
  );
};

