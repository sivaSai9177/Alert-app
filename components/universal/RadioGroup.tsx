import React, { createContext, useContext } from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/theme/enhanced-theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { HStack, VStack } from './Stack';
import { Text } from './Text';
import { SpacingScale } from '@/lib/design-system';

// Radio Group Context
interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

const useRadioGroup = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('useRadioGroup must be used within RadioGroup');
  }
  return context;
};

// Radio Group Props
export interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: SpacingScale;
  disabled?: boolean;
  style?: ViewStyle;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  children,
  orientation = 'vertical',
  spacing = 3,
  disabled = false,
  style,
}) => {
  const contextValue = React.useMemo(
    () => ({ value, onValueChange, disabled }),
    [value, onValueChange, disabled]
  );

  const Container = orientation === 'horizontal' ? HStack : VStack;

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <Container spacing={spacing} style={style}>
        {children}
      </Container>
    </RadioGroupContext.Provider>
  );
};

// Radio Group Item Props
export interface RadioGroupItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  children,
  disabled: itemDisabled = false,
  onPress,
}) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  const { value: groupValue, onValueChange, disabled: groupDisabled } = useRadioGroup();
  
  const isSelected = groupValue === value;
  const isDisabled = groupDisabled || itemDisabled;
  
  const handlePress = () => {
    if (!isDisabled) {
      onValueChange(value);
      onPress?.();
    }
  };
  
  return (
    <Pressable onPress={handlePress} disabled={isDisabled}>
      {({ pressed }) => (
        <HStack 
          spacing={2} 
          alignItems="center"
          style={{
            opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1,
          }}
        >
          {/* Radio Button */}
          <View
            style={{
              width: componentSpacing.checkboxSize.md,
              height: componentSpacing.checkboxSize.md,
              borderRadius: componentSpacing.checkboxSize.md / 2,
              borderWidth: 2,
              borderColor: isDisabled 
                ? theme.border 
                : isSelected 
                  ? theme.primary 
                  : theme.input,
              backgroundColor: isDisabled
                ? theme.muted
                : theme.background,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isSelected && (
              <View
                style={{
                  width: componentSpacing.checkboxSize.md * 0.4,
                  height: componentSpacing.checkboxSize.md * 0.4,
                  borderRadius: (componentSpacing.checkboxSize.md * 0.4) / 2,
                  backgroundColor: isDisabled
                    ? theme.mutedForeground
                    : theme.primary,
                }}
              />
            )}
          </View>
          
          {/* Label */}
          {typeof children === 'string' ? (
            <Text
              colorTheme={isDisabled ? 'mutedForeground' : 'foreground'}
              onPress={!isDisabled ? handlePress : undefined}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </HStack>
      )}
    </Pressable>
  );
};

// Simple Radio component for standalone use
export interface RadioProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Radio: React.FC<RadioProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'md',
}) => {
  const theme = useTheme();
  const { componentSpacing } = useSpacing();
  
  const sizeMap = {
    sm: componentSpacing.checkboxSize.sm,
    md: componentSpacing.checkboxSize.md,
    lg: componentSpacing.checkboxSize.lg,
  };
  
  const buttonSize = sizeMap[size];
  
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      {({ pressed }) => (
        <View
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            borderWidth: 2,
            borderColor: disabled 
              ? theme.border 
              : value 
                ? theme.primary 
                : theme.input,
            backgroundColor: disabled
              ? theme.muted
              : theme.background,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
          }}
        >
          {value && (
            <View
              style={{
                width: buttonSize * 0.4,
                height: buttonSize * 0.4,
                borderRadius: (buttonSize * 0.4) / 2,
                backgroundColor: disabled
                  ? theme.mutedForeground
                  : theme.primary,
              }}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};