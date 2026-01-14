import React, { createContext, useContext, useState } from 'react';
import { View, Pressable, ViewStyle, LayoutAnimation, Platform } from 'react-native';
import { useTheme } from '@/lib/theme/enhanced-theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { VStack, HStack } from './Stack';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { SpacingScale } from '@/lib/design-system';

// Accordion Context
interface AccordionContextValue {
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within Accordion');
  }
  return context;
};

// Accordion Props
export interface AccordionProps {
  type?: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  collapsible?: boolean;
  style?: ViewStyle;
}

export const Accordion: React.FC<AccordionProps> = ({
  type = 'single',
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  collapsible = true,
  style,
}) => {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue || (type === 'single' ? '' : [])
  );
  
  const value = controlledValue ?? internalValue;
  
  const handleValueChange = (newValue: string | string[]) => {
    if (!controlledValue) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };
  
  const contextValue = React.useMemo(
    () => ({ value, onValueChange: handleValueChange, type }),
    [value, type]
  );
  
  return (
    <AccordionContext.Provider value={contextValue}>
      <VStack spacing={2} style={style}>
        {children}
      </VStack>
    </AccordionContext.Provider>
  );
};

// Accordion Item Context
interface AccordionItemContextValue {
  isExpanded: boolean;
  itemValue: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('useAccordionItem must be used within AccordionItem');
  }
  return context;
};

// Accordion Item Props
export interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value: itemValue,
  children,
  disabled = false,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { value, type } = useAccordion();
  
  const isExpanded = type === 'single' 
    ? value === itemValue 
    : Array.isArray(value) && value.includes(itemValue);
  
  const contextValue = React.useMemo(
    () => ({ isExpanded, itemValue }),
    [isExpanded, itemValue]
  );
  
  return (
    <AccordionItemContext.Provider value={contextValue}>
      <View
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: spacing[2],
          backgroundColor: theme.card,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {children}
      </View>
    </AccordionItemContext.Provider>
  );
};

// Accordion Trigger Props
export interface AccordionTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  asChild = false,
}) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  const { value, onValueChange, type } = useAccordion();
  const { isExpanded, itemValue } = useAccordionItem();
  
  const handlePress = () => {
    // Animate on iOS and Android, not on web
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    
    if (type === 'single') {
      onValueChange(isExpanded ? '' : itemValue);
    } else {
      const currentValue = value as string[];
      if (isExpanded) {
        onValueChange(currentValue.filter(v => v !== itemValue));
      } else {
        onValueChange([...currentValue, itemValue]);
      }
    }
  };
  
  const content = (
    <HStack
      p={4}
      spacing={3}
      alignItems="center"
      justifyContent="space-between"
    >
      <View style={{ flex: 1 }}>
        {typeof children === 'string' ? (
          <Text weight="medium">{children}</Text>
        ) : (
          children
        )}
      </View>
      <View
        style={{
          transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
        }}
      >
        <Ionicons
          name="chevron-down"
          size={componentSpacing.iconSize.md}
          color={theme.mutedForeground}
        />
      </View>
    </HStack>
  );
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onPress: handlePress,
      children: content,
    });
  }
  
  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.7 : 1 }}>
          {content}
        </View>
      )}
    </Pressable>
  );
};

// Accordion Content Props
export interface AccordionContentProps {
  children: React.ReactNode;
  forceMount?: boolean;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  forceMount = false,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { isExpanded } = useAccordionItem();
  
  if (!isExpanded && !forceMount) {
    return null;
  }
  
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        display: isExpanded ? 'flex' : 'none',
      }}
    >
      {children}
    </View>
  );
};

// Pre-styled Accordion variants
export interface SimpleAccordionProps {
  items: Array<{
    value: string;
    title: string;
    content: React.ReactNode;
    disabled?: boolean;
  }>;
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  style?: ViewStyle;
}

export const SimpleAccordion: React.FC<SimpleAccordionProps> = ({
  items,
  type = 'single',
  defaultValue,
  style,
}) => {
  return (
    <Accordion type={type} defaultValue={defaultValue} style={style}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value} disabled={item.disabled}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};