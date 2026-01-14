import React from 'react';
import { View, Pressable, ViewStyle, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/lib/theme/enhanced-theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { HStack } from './Stack';
import { Text } from './Text';
import { UniversalLink } from './Link';
import { Ionicons } from '@expo/vector-icons';
import { SpacingScale } from '@/lib/design-system';

// Breadcrumb Props
export interface BreadcrumbProps {
  children: React.ReactNode;
  separator?: React.ReactNode;
  style?: ViewStyle;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  children,
  separator,
  style,
}) => {
  const theme = useTheme();
  const { componentSpacing } = useSpacing();
  
  const items = React.Children.toArray(children);
  const defaultSeparator = (
    <Ionicons
      name="chevron-forward"
      size={16}
      color={theme.mutedForeground}
    />
  );
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 0 }}
    >
      <HStack spacing={2} alignItems="center" style={style}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item}
            {index < items.length - 1 && (
              <View>{separator || defaultSeparator}</View>
            )}
          </React.Fragment>
        ))}
      </HStack>
    </ScrollView>
  );
};

// Breadcrumb Item Props
export interface BreadcrumbItemProps {
  children: React.ReactNode;
  href?: string;
  onPress?: () => void;
  disabled?: boolean;
  current?: boolean;
}

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  children,
  href,
  onPress,
  disabled = false,
  current = false,
}) => {
  const theme = useTheme();
  
  // If it's a link
  if (href && !disabled && !current) {
    return (
      <UniversalLink href={href as any} variant="ghost">
        <Text
          size="sm"
          colorTheme="foreground"
        >
          {children}
        </Text>
      </UniversalLink>
    );
  }
  
  // If it has onPress
  if (onPress && !disabled && !current) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <Text
            size="sm"
            colorTheme="foreground"
            style={{
              opacity: pressed ? 0.7 : 1,
            }}
          >
            {children}
          </Text>
        )}
      </Pressable>
    );
  }
  
  // Static item (current or disabled)
  return (
    <Text
      size="sm"
      colorTheme={current ? 'foreground' : 'mutedForeground'}
      weight={current ? 'medium' : 'normal'}
      style={{
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </Text>
  );
};

// Breadcrumb Ellipsis
export const BreadcrumbEllipsis: React.FC = () => {
  const theme = useTheme();
  const { componentSpacing } = useSpacing();
  
  return (
    <View style={{ paddingHorizontal: 4 }}>
      <Ionicons
        name="ellipsis-horizontal"
        size={componentSpacing.iconSize.sm}
        color={theme.mutedForeground}
      />
    </View>
  );
};

// Convenience component for common breadcrumb patterns
export interface SimpleBreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    onPress?: () => void;
    current?: boolean;
  }>;
  separator?: React.ReactNode;
  showHome?: boolean;
  homeLabel?: string;
  homeHref?: string;
  onHomePress?: () => void;
  maxItems?: number;
  style?: ViewStyle;
}

export const SimpleBreadcrumb: React.FC<SimpleBreadcrumbProps> = ({
  items,
  separator,
  showHome = true,
  homeLabel = 'Home',
  homeHref = '/',
  onHomePress,
  maxItems,
  style,
}) => {
  const theme = useTheme();
  const { componentSpacing } = useSpacing();
  
  // Add home item if needed
  const allItems = showHome
    ? [{ label: homeLabel, href: homeHref, onPress: onHomePress }, ...items]
    : items;
  
  // Handle max items with ellipsis
  let displayItems = allItems;
  let showEllipsis = false;
  
  if (maxItems && allItems.length > maxItems) {
    const firstItem = allItems[0];
    const lastItems = allItems.slice(-(maxItems - 2));
    displayItems = [firstItem, { label: '...', isEllipsis: true }, ...lastItems];
    showEllipsis = true;
  }
  
  return (
    <Breadcrumb separator={separator} style={style}>
      {displayItems.map((item, index) => {
        if ('isEllipsis' in item && item.isEllipsis) {
          return <BreadcrumbEllipsis key={`ellipsis-${index}`} />;
        }
        
        const isLast = index === displayItems.length - 1;
        return (
          <BreadcrumbItem
            key={item.label}
            href={item.href}
            onPress={item.onPress}
            current={item.current || isLast}
          >
            {item.label}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

// Breadcrumb with icons
export interface IconBreadcrumbItemProps extends BreadcrumbItemProps {
  icon?: string;
}

export const IconBreadcrumbItem: React.FC<IconBreadcrumbItemProps> = ({
  icon,
  children,
  ...props
}) => {
  const theme = useTheme();
  const { componentSpacing } = useSpacing();
  
  return (
    <BreadcrumbItem {...props}>
      <HStack spacing={1} alignItems="center">
        {icon && (
          <Ionicons
            name={icon as any}
            size={componentSpacing.iconSize.sm}
            color={props.current ? theme.foreground : theme.mutedForeground}
          />
        )}
        {children}
      </HStack>
    </BreadcrumbItem>
  );
};