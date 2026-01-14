import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface CollapsibleProps {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  showArrow?: boolean;
  animationDuration?: number;
  animationType?: 'spring' | 'linear' | 'easeInEaseOut';
  disabled?: boolean;
  variant?: 'default' | 'bordered' | 'ghost';
  style?: ViewStyle;
  triggerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  testID?: string;
}

export const Collapsible = React.forwardRef<View, CollapsibleProps>(
  (
    {
      children,
      title,
      defaultOpen = false,
      open: controlledOpen,
      onOpenChange,
      trigger,
      showArrow = true,
      animationDuration = 300,
      animationType = 'spring',
      disabled = false,
      variant = 'default',
      style,
      triggerStyle,
      contentStyle,
      titleStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    
    const [isOpen, setIsOpen] = useState(controlledOpen ?? defaultOpen);
    const animatedHeight = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
    const animatedRotation = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
    const [contentHeight, setContentHeight] = useState(0);
    
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : isOpen;

    useEffect(() => {
      const layoutAnimConfig = {
        duration: animationDuration,
        update: {
          type: animationType === 'spring' 
            ? LayoutAnimation.Types.spring 
            : animationType === 'linear' 
            ? LayoutAnimation.Types.linear 
            : LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleY,
        },
      };

      if (Platform.OS === 'android') {
        LayoutAnimation.configureNext(layoutAnimConfig);
      }

      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: open ? 1 : 0,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(animatedRotation, {
          toValue: open ? 1 : 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }, [open, animationDuration, animatedHeight, animatedRotation]);

    const handleToggle = useCallback(() => {
      if (disabled) return;
      
      const newValue = !open;
      if (!isControlled) {
        setIsOpen(newValue);
      }
      onOpenChange?.(newValue);
    }, [disabled, open, isControlled, onOpenChange]);

    const getVariantStyles = (): ViewStyle => {
      switch (variant) {
        case 'bordered':
          return {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            overflow: 'hidden',
          };
        case 'ghost':
          return {};
        default:
          return {
            backgroundColor: theme.card,
            borderRadius: 8,
            overflow: 'hidden',
          };
      }
    };

    const rotation = animatedRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg'],
    });

    const renderDefaultTrigger = () => (
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing[3],
            backgroundColor: variant === 'ghost' ? 'transparent' : theme.card,
          },
          triggerStyle,
        ]}
      >
        <Text
          style={[
            {
              fontSize: 16,
              fontWeight: '500',
              color: disabled ? theme.mutedForeground : theme.foreground,
              flex: 1,
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {showArrow && (
          <Animated.View
            style={{
              transform: [{ rotate: rotation }],
              marginLeft: spacing[2],
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={disabled ? theme.mutedForeground : theme.foreground}
            />
          </Animated.View>
        )}
      </View>
    );

    return (
      <View ref={ref} style={[getVariantStyles(), style]} testID={testID}>
        <TouchableOpacity
          onPress={handleToggle}
          disabled={disabled}
          activeOpacity={0.7}
        >
          {trigger || renderDefaultTrigger()}
        </TouchableOpacity>
        
        <Animated.View
          style={{
            height: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, contentHeight || 0],
            }),
            opacity: animatedHeight,
            overflow: 'hidden',
          }}
        >
          <View
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setContentHeight(height);
            }}
            style={[
              {
                position: contentHeight ? 'relative' : 'absolute',
                padding: variant === 'ghost' ? 0 : spacing[3],
                paddingTop: variant === 'ghost' ? spacing[2] : 0,
              },
              contentStyle,
            ]}
          >
            {children}
          </View>
        </Animated.View>
      </View>
    );
  }
);

Collapsible.displayName = 'Collapsible';

// Collapsible Group Component
export interface CollapsibleGroupProps {
  children: React.ReactElement<CollapsibleProps>[];
  accordion?: boolean;
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  style?: ViewStyle;
  testID?: string;
}

export const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({
  children,
  accordion = false,
  defaultValue = [],
  value: controlledValue,
  onValueChange,
  style,
  testID,
}) => {
  const [openItems, setOpenItems] = useState<string[]>(controlledValue ?? defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : openItems;

  const handleItemToggle = useCallback((index: string, isOpen: boolean) => {
    let newValue: string[];
    
    if (accordion) {
      newValue = isOpen ? [index] : [];
    } else {
      if (isOpen) {
        newValue = [...value, index];
      } else {
        newValue = value.filter(item => item !== index);
      }
    }
    
    if (!isControlled) {
      setOpenItems(newValue);
    }
    onValueChange?.(newValue);
  }, [accordion, value, isControlled, onValueChange]);

  return (
    <View style={style} testID={testID}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        
        const itemKey = child.key || index.toString();
        const isOpen = value.includes(itemKey);
        
        return React.cloneElement(child, {
          ...child.props,
          open: isOpen,
          onOpenChange: (open: boolean) => {
            handleItemToggle(itemKey, open);
            child.props.onOpenChange?.(open);
          },
        });
      })}
    </View>
  );
};

// Collapsible Section Helper Component
export interface CollapsibleSectionProps extends Omit<CollapsibleProps, 'trigger'> {
  icon?: string;
  badge?: string | number;
  subtitle?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  icon,
  badge,
  subtitle,
  title,
  children,
  ...props
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  const customTrigger = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[3],
      }}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={24}
          color={theme.primary}
          style={{ marginRight: spacing[3] }}
        />
      )}
      
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.foreground,
              flex: 1,
            }}
          >
            {title}
          </Text>
          {badge !== undefined && (
            <View
              style={{
                backgroundColor: theme.primary,
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[0.5],
                borderRadius: 12,
                marginLeft: spacing[2],
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: theme.primaryForeground,
                }}
              >
                {badge}
              </Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              color: theme.mutedForeground,
              marginTop: spacing[0.5],
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {props.showArrow !== false && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.foreground}
          style={{ marginLeft: spacing[2] }}
        />
      )}
    </View>
  );

  return (
    <Collapsible {...props} title={title} trigger={customTrigger}>
      {children}
    </Collapsible>
  );
};