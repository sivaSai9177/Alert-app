import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  SectionList,
  Animated,
  PanResponder,
  Platform,
  ViewStyle,
  TextStyle,
  ListRenderItem,
  SectionListData,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';

// List Item Component
export interface ListItemProps {
  title: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  variant?: 'default' | 'compact' | 'large';
  showDivider?: boolean;
  swipeActions?: SwipeAction[];
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  testID?: string;
}

export interface SwipeAction {
  key: string;
  label: string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
  onPress: () => void;
}

const SWIPE_THRESHOLD = 80;
const SWIPE_FULL_THRESHOLD = 200;

// Memoized swipe action component for better performance
const SwipeActionButton = React.memo(({ 
  action, 
  theme, 
  spacing, 
  onPress 
}: { 
  action: SwipeAction;
  theme: any;
  spacing: any;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      width: 80,
      backgroundColor: action.backgroundColor || theme.destructive,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {action.icon && (
      <Ionicons
        name={action.icon as any}
        size={24}
        color={action.color || theme.destructiveForeground}
      />
    )}
    <Text
      style={{
        color: action.color || theme.destructiveForeground,
        fontSize: 12,
        marginTop: spacing[1],
      }}
    >
      {action.label}
    </Text>
  </TouchableOpacity>
));

SwipeActionButton.displayName = 'SwipeActionButton';

export const ListItem = React.memo(React.forwardRef<View, ListItemProps>(
  (
    {
      title,
      description,
      leftIcon,
      rightIcon,
      onPress,
      onLongPress,
      disabled = false,
      selected = false,
      variant = 'default',
      showDivider = true,
      swipeActions = [],
      style,
      titleStyle,
      descriptionStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    const swipeAnim = useRef(new Animated.Value(0)).current;
    const [isSwipeOpen, setIsSwipeOpen] = React.useState(false);

    const paddingMap = useMemo(() => ({
      compact: spacing[2],
      default: spacing[3],
      large: spacing[4],
    }), [spacing]);

    const itemPadding = paddingMap[variant];

    // Memoize closeSwipe callback
    const closeSwipe = useCallback(() => {
      Animated.timing(swipeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setIsSwipeOpen(false);
    }, [swipeAnim]);

    // Memoize openSwipe callback
    const openSwipe = useCallback(() => {
      const actionWidth = swipeActions.length * 80;
      Animated.timing(swipeAnim, {
        toValue: -actionWidth,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setIsSwipeOpen(true);
    }, [swipeActions.length, swipeAnim]);

    // Memoize panResponder for better performance
    const panResponder = useMemo(() => 
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Platform.OS !== 'web' && Math.abs(gestureState.dx) > 10 && swipeActions.length > 0;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0 && swipeActions.length > 0) {
            swipeAnim.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -SWIPE_FULL_THRESHOLD) {
            // Full swipe - trigger first action
            if (swipeActions[0]) {
              swipeActions[0].onPress();
              closeSwipe();
            }
          } else if (gestureState.dx < -SWIPE_THRESHOLD) {
            // Partial swipe - show actions
            openSwipe();
          } else {
            // Not enough swipe - close
            closeSwipe();
          }
        },
      }),
    [swipeActions, swipeAnim, closeSwipe, openSwipe]
    );

    const handlePress = () => {
      if (isSwipeOpen) {
        closeSwipe();
      } else if (onPress && !disabled) {
        onPress();
      }
    };

    const itemStyle: ViewStyle = {
      backgroundColor: selected ? theme.accent : theme.card,
      opacity: disabled ? 0.5 : 1,
    };

    const titleTextStyle: TextStyle = {
      fontSize: variant === 'compact' ? 14 : variant === 'large' ? 18 : 16,
      fontWeight: '500',
      color: theme.foreground,
    };

    const descriptionTextStyle: TextStyle = {
      fontSize: variant === 'compact' ? 12 : variant === 'large' ? 16 : 14,
      color: theme.mutedForeground,
      marginTop: spacing[0.5],
    };

    // Memoize renderSwipeActions for better performance
    const renderSwipeActions = useCallback(() => {
      if (swipeActions.length === 0 || Platform.OS === 'web') return null;

      return (
        <View style={[StyleSheet.absoluteFillObject, { flexDirection: 'row', justifyContent: 'flex-end' }]}>
          {swipeActions.map((action) => (
            <SwipeActionButton
              key={action.key}
              action={action}
              theme={theme}
              spacing={spacing}
              onPress={() => {
                action.onPress();
                closeSwipe();
              }}
            />
          ))}
        </View>
      );
    }, [swipeActions, theme, spacing, closeSwipe]);

    return (
      <View ref={ref} testID={testID}>
        {renderSwipeActions()}
        <Animated.View
          style={{
            transform: [{ translateX: swipeAnim }],
            backgroundColor: theme.background,
          }}
          {...panResponder.panHandlers}
        >
          <TouchableHighlight
            onPress={handlePress}
            onLongPress={onLongPress}
            disabled={disabled}
            underlayColor={theme.accent}
            style={[itemStyle, style]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: itemPadding,
              }}
            >
              {leftIcon && (
                <View style={{ marginRight: spacing[3] }}>
                  {leftIcon}
                </View>
              )}
              
              <View style={{ flex: 1 }}>
                <Text style={[titleTextStyle, titleStyle]}>{title}</Text>
                {description && (
                  <Text style={[descriptionTextStyle, descriptionStyle]}>
                    {description}
                  </Text>
                )}
              </View>
              
              {rightIcon && (
                <View style={{ marginLeft: spacing[3] }}>
                  {rightIcon}
                </View>
              )}
            </View>
          </TouchableHighlight>
        </Animated.View>
        
        {showDivider && (
          <View
            style={{
              height: 1,
              backgroundColor: theme.border,
              marginLeft: leftIcon ? itemPadding + 40 + spacing[3] : itemPadding,
            }}
          />
        )}
      </View>
    );
  }
), (prevProps, nextProps) => {
  // Custom comparison for better performance
  return prevProps.title === nextProps.title &&
         prevProps.description === nextProps.description &&
         prevProps.selected === nextProps.selected &&
         prevProps.disabled === nextProps.disabled &&
         prevProps.variant === nextProps.variant &&
         prevProps.swipeActions === nextProps.swipeActions;
});

ListItem.displayName = 'ListItem';

// List Container Component
export interface ListProps<T = any> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  ItemSeparatorComponent?: React.ComponentType<any>;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  horizontal?: boolean;
  numColumns?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  testID?: string;
}

export const List = React.forwardRef<FlatList, ListProps>(
  (
    {
      data,
      renderItem,
      keyExtractor,
      ItemSeparatorComponent,
      ListHeaderComponent,
      ListFooterComponent,
      ListEmptyComponent,
      onRefresh,
      refreshing,
      onEndReached,
      onEndReachedThreshold = 0.5,
      horizontal = false,
      numColumns,
      style,
      contentContainerStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <FlatList
        ref={ref}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        horizontal={horizontal}
        numColumns={numColumns}
        style={[{ backgroundColor: theme.background }, style]}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={!horizontal}
        showsHorizontalScrollIndicator={horizontal}
        testID={testID}
      />
    );
  }
);

List.displayName = 'List';

// Section List Component
export interface SectionListProps<T = any> {
  sections: SectionListData<T>[];
  renderItem: ListRenderItem<T>;
  renderSectionHeader?: (info: { section: SectionListData<T> }) => React.ReactElement | null;
  renderSectionFooter?: (info: { section: SectionListData<T> }) => React.ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  ItemSeparatorComponent?: React.ComponentType<any>;
  SectionSeparatorComponent?: React.ComponentType<any>;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  stickySectionHeadersEnabled?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  testID?: string;
}

export const SectionListComponent = React.forwardRef<SectionList, SectionListProps>(
  (
    {
      sections,
      renderItem,
      renderSectionHeader,
      renderSectionFooter,
      keyExtractor,
      ItemSeparatorComponent,
      SectionSeparatorComponent,
      ListHeaderComponent,
      ListFooterComponent,
      ListEmptyComponent,
      onRefresh,
      refreshing,
      onEndReached,
      onEndReachedThreshold = 0.5,
      stickySectionHeadersEnabled = true,
      style,
      contentContainerStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();

    const defaultRenderSectionHeader = ({ section }: { section: SectionListData<any> }) => (
      <View
        style={{
          backgroundColor: theme.muted,
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[2],
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.mutedForeground,
            textTransform: 'uppercase',
          }}
        >
          {section.title || section.key}
        </Text>
      </View>
    );

    return (
      <SectionList
        ref={ref}
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader || defaultRenderSectionHeader}
        renderSectionFooter={renderSectionFooter}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparatorComponent}
        SectionSeparatorComponent={SectionSeparatorComponent}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        stickySectionHeadersEnabled={stickySectionHeadersEnabled}
        style={[{ backgroundColor: theme.background }, style]}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator
        testID={testID}
      />
    );
  }
);

SectionListComponent.displayName = 'SectionList';

// Simple List Component for static content
export interface SimpleListProps {
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'large';
  showDividers?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const SimpleList: React.FC<SimpleListProps> = ({
  children,
  variant = 'default',
  showDividers = true,
  style,
  testID,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  return (
    <ScrollView
      style={[{ backgroundColor: theme.background }, style]}
      showsVerticalScrollIndicator
      testID={testID}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            variant,
            showDivider: showDividers && index < React.Children.count(children) - 1,
          });
        }
        return child;
      })}
    </ScrollView>
  );
};