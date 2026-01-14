import React, { useState } from 'react';
import { View, Pressable, ViewStyle, Platform, ScrollView } from 'react-native';
import { Box } from './Box';
import { Text } from './Text';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { SpacingScale } from '@/lib/design-system';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Tabs: React.FC<TabsProps> & {
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
  Content: typeof TabsContent;
} = ({ value, onValueChange, children, style }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <Box style={style}>
        {children}
      </Box>
    </TabsContext.Provider>
  );
};

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
};

interface TabsListProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
}

const TabsList: React.FC<TabsListProps> = ({ children, style, scrollable = false }) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  
  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing[1],
        }}
        style={[{
          backgroundColor: theme.muted,
          borderRadius: componentSpacing.borderRadius,
        }, style]}
      >
        <Box
          p={1}
          flexDirection="row"
          alignItems="center"
          gap={1}
        >
          {children}
        </Box>
      </ScrollView>
    );
  }
  
  return (
    <Box
      bgTheme="muted"
      p={1}
      rounded="lg"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      style={style}
    >
      {children}
    </Box>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, icon, disabled = false, style }) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  const { value: selectedValue, onValueChange } = useTabsContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const isActive = value === selectedValue;
  
  const handlePress = () => {
    if (!disabled) {
      onValueChange(value);
    }
  };

  const getBackgroundColor = () => {
    if (isActive) return theme.background;
    if (isPressed && !disabled) return theme.accent;
    if (isHovered && !disabled) return theme.accent + '80'; // 50% opacity
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return theme.mutedForeground + '80';
    if (isActive) return theme.foreground;
    return theme.mutedForeground;
  };

  const triggerStyle: ViewStyle = {
    paddingHorizontal: spacing[3 as SpacingScale],
    paddingVertical: spacing[1 as SpacingScale],
    borderRadius: componentSpacing.borderRadius,
    backgroundColor: getBackgroundColor(),
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    // Web-specific styles
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      cursor: disabled ? 'not-allowed' : 'pointer',
    } as any),
    // Active shadow
    ...(isActive && {
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      elevation: 2,
    }),
  };

  const webHandlers = Platform.OS === 'web' && !disabled ? {
    onHoverIn: () => setIsHovered(true),
    onHoverOut: () => setIsHovered(false),
    onPressIn: () => setIsPressed(true),
    onPressOut: () => setIsPressed(false),
  } : {};

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[triggerStyle, style]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive, disabled }}
      {...webHandlers}
    >
      <Box flexDirection="column" alignItems="center" gap={1}>
        {icon && (
          <Box style={{ opacity: disabled ? 0.5 : 1 }}>
            {React.isValidElement(icon) ? React.cloneElement(icon, {
              color: getTextColor(),
            } as any) : icon}
          </Box>
        )}
        {typeof children === 'string' ? (
          <Text
            size="sm"
            weight="medium"
            style={{ color: getTextColor() }}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Box>
    </Pressable>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

const TabsContent: React.FC<TabsContentProps> = ({ value, children, style }) => {
  const { value: selectedValue } = useTabsContext();
  const { spacing } = useSpacing();
  
  if (value !== selectedValue) {
    return null;
  }
  
  return (
    <Box mt={2} style={style}>
      {children}
    </Box>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { TabsList, TabsTrigger, TabsContent };