import React, { useState } from 'react';
import { TextInput, TextInputProps, ViewStyle, TextStyle, Platform } from 'react-native';
import { Box } from './Box';
import { Text } from './Text';
import { useTheme } from '@/lib/theme/theme-provider';
import { BorderRadius, SpacingScale } from '@/lib/design-system';
import { useSpacing } from '@/contexts/SpacingContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  rounded?: BorderRadius;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  isDisabled?: boolean;
  isRequired?: boolean;
  containerStyle?: ViewStyle;
  name?: string; // For web form autofill
  id?: string; // For web form autofill
}

// Input sizes will be defined dynamically based on spacing density

export const Input = React.forwardRef<TextInput, InputProps>(({
  label,
  error,
  success,
  hint,
  size = 'md',
  rounded = 'md',
  leftElement,
  rightElement,
  isDisabled = false,
  isRequired = false,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const theme = useTheme();
  const { spacing, componentSpacing, componentSizes, typographyScale } = useSpacing();
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get size configuration from spacing context
  const inputSize = componentSizes.input[size];
  const config = {
    paddingX: componentSpacing.inputPadding.x as SpacingScale,
    paddingY: componentSpacing.inputPadding.y as SpacingScale,
    fontSize: typographyScale[size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'],
    height: inputSize.height,
  };
  
  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  const getBorderColor = () => {
    if (error) return theme.destructive;
    if (success) return theme.success || theme.accent;
    if (isFocused) return theme.primary;
    if (isHovered && !isDisabled) return theme.primary + '80'; // 50% opacity
    return theme.border;
  };

  const inputContainerStyle: ViewStyle = {
    borderWidth: 1,
    borderColor: getBorderColor(),
    borderRadius: componentSpacing.borderRadius,
    backgroundColor: isDisabled ? theme.muted : theme.card,
    height: config.height,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[config.paddingX],
    // Web-specific styles
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      cursor: isDisabled ? 'not-allowed' : 'text',
    } as any),
  };
  
  // Ensure we use the correct text color - cardForeground for input text
  const textColor = theme.cardForeground || theme.foreground;
  
  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: config.fontSize,
    color: textColor,
    paddingVertical: spacing[config.paddingY],
    // Platform-specific fixes
    ...(Platform.OS === 'android' && {
      textAlignVertical: 'center',
    }),
    // Web-specific styles to disable autofill outline
    ...(Platform.OS === 'web' && {
      outline: 'none',
      boxShadow: 'none',
      WebkitBoxShadow: 'none',
    } as any),
  };
  
  return (
    <Box style={containerStyle}>
      {label && (
        <Box mb={2} flexDirection="row">
          <Text size="sm" weight="medium" colorTheme="foreground">
            {label}
          </Text>
          {isRequired && (
            <Text size="sm" colorTheme="destructive" ml={1}>
              *
            </Text>
          )}
        </Box>
      )}
      
      <Box
        style={inputContainerStyle}
        {...(Platform.OS === 'web' ? {
          onMouseEnter: () => !isDisabled && setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        } as any : {})}
      >
        {leftElement && <Box mr={2}>{leftElement}</Box>}
        
        <TextInput
          ref={ref}
          style={[inputStyle, style]}
          placeholderTextColor={theme.mutedForeground}
          editable={!isDisabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={theme.primary}
          underlineColorAndroid="transparent"
          {...props}
          {...(Platform.OS === 'web' && {
            autoComplete: props.autoComplete,
            name: props.autoComplete, // Web browsers use name attribute for autofill
            id: props.autoComplete, // Some browsers also use id
            className: 'universal-input', // Add class for CSS targeting
          })}
        />
        
        {rightElement && <Box ml={2}>{rightElement}</Box>}
      </Box>
      
      {(error || hint) && (
        <Box mt={1}>
          {error ? (
            <Text size="sm" colorTheme="destructive">
              {error}
            </Text>
          ) : hint ? (
            <Text size="sm" colorTheme="mutedForeground">
              {hint}
            </Text>
          ) : null}
        </Box>
      )}
    </Box>
  );
});

Input.displayName = 'Input';