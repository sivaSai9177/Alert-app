import React, { createContext, useContext, useState } from 'react';
import { View, Pressable, ViewStyle, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/lib/theme/enhanced-theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { HStack, VStack } from './Stack';
import { Text } from './Text';
import { Card } from './Card';
import { Ionicons } from '@expo/vector-icons';
import { SpacingScale } from '@/lib/design-system';

// Navigation Menu Context
interface NavigationMenuContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null);

const useNavigationMenu = () => {
  const context = useContext(NavigationMenuContext);
  if (!context) {
    throw new Error('useNavigationMenu must be used within NavigationMenu');
  }
  return context;
};

// Navigation Menu Props
export interface NavigationMenuProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'horizontal',
  style,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const value = controlledValue ?? internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (!controlledValue) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };
  
  const contextValue = React.useMemo(
    () => ({ value, onValueChange: handleValueChange }),
    [value]
  );
  
  const Container = orientation === 'horizontal' ? HStack : VStack;
  
  return (
    <NavigationMenuContext.Provider value={contextValue}>
      <View style={style}>
        <ScrollView
          horizontal={orientation === 'horizontal'}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <Container spacing={1}>
            {children}
          </Container>
        </ScrollView>
      </View>
    </NavigationMenuContext.Provider>
  );
};

// Navigation Menu Item Props
export interface NavigationMenuItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  onPress?: () => void;
}

export const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  value: itemValue,
  children,
  disabled = false,
  active: controlledActive,
  onPress,
}) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  const { value, onValueChange } = useNavigationMenu();
  
  const isActive = controlledActive ?? value === itemValue;
  
  const handlePress = () => {
    if (!disabled) {
      onValueChange(itemValue);
      onPress?.();
    }
  };
  
  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      {({ pressed }) => (
        <View
          style={{
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[2],
            borderRadius: componentSpacing.borderRadius.md,
            backgroundColor: isActive 
              ? theme.accent 
              : pressed 
                ? theme.muted 
                : 'transparent',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {typeof children === 'string' ? (
            <Text
              size="sm"
              weight={isActive ? 'medium' : 'normal'}
              colorTheme={isActive ? 'accentForeground' : 'foreground'}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </Pressable>
  );
};

// Navigation Menu Content Props
export interface NavigationMenuContentProps {
  value: string;
  children: React.ReactNode;
  forceMount?: boolean;
}

export const NavigationMenuContent: React.FC<NavigationMenuContentProps> = ({
  value: contentValue,
  children,
  forceMount = false,
}) => {
  const { value } = useNavigationMenu();
  const isActive = value === contentValue;
  
  if (!isActive && !forceMount) {
    return null;
  }
  
  return (
    <View
      style={{
        display: isActive ? 'flex' : 'none',
      }}
    >
      {children}
    </View>
  );
};

// Navigation Menu Link
export interface NavigationMenuLinkProps {
  href?: string;
  onPress?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
}

export const NavigationMenuLink: React.FC<NavigationMenuLinkProps> = ({
  href,
  onPress,
  children,
  disabled = false,
  active = false,
}) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  
  const handlePress = () => {
    if (!disabled) {
      onPress?.();
      // Handle href navigation if needed
    }
  };
  
  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      {({ pressed }) => (
        <View
          style={{
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[2],
            borderRadius: componentSpacing.borderRadius.md,
            backgroundColor: active 
              ? theme.accent 
              : pressed 
                ? theme.muted 
                : 'transparent',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {typeof children === 'string' ? (
            <Text
              size="sm"
              weight={active ? 'medium' : 'normal'}
              colorTheme={active ? 'accentForeground' : 'foreground'}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </Pressable>
  );
};

// Simple Navigation Menu
export interface SimpleNavigationMenuItem {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface SimpleNavigationMenuProps {
  items: SimpleNavigationMenuItem[];
  defaultValue?: string;
  orientation?: 'horizontal' | 'vertical';
  showContent?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  onItemPress?: (value: string) => void;
}

export const SimpleNavigationMenu: React.FC<SimpleNavigationMenuProps> = ({
  items,
  defaultValue,
  orientation = 'horizontal',
  showContent = true,
  style,
  contentStyle,
  onItemPress,
}) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  const [activeValue, setActiveValue] = useState(defaultValue || items[0]?.value || '');
  
  return (
    <VStack spacing={3}>
      <NavigationMenu
        value={activeValue}
        onValueChange={setActiveValue}
        orientation={orientation}
        style={style}
      >
        {items.map((item) => (
          <NavigationMenuItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            onPress={() => onItemPress?.(item.value)}
          >
            <HStack spacing={2} alignItems="center">
              {item.icon && (
                <Ionicons
                  name={item.icon as any}
                  size={componentSpacing.iconSize.sm}
                  color={
                    activeValue === item.value
                      ? theme.accentForeground
                      : theme.foreground
                  }
                />
              )}
              <Text>{item.label}</Text>
            </HStack>
          </NavigationMenuItem>
        ))}
      </NavigationMenu>
      
      {showContent && (
        <View style={contentStyle}>
          {items.map((item) => (
            item.content && (
              <NavigationMenuContent key={item.value} value={item.value}>
                {item.content}
              </NavigationMenuContent>
            )
          ))}
        </View>
      )}
    </VStack>
  );
};