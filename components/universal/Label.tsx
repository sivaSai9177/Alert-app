import React from 'react';
import { View, ViewStyle, Pressable, TextStyle } from 'react-native';
import { useTheme } from '@/lib/theme/enhanced-theme-provider';
import { Text, TextProps } from './Text';
import { useSpacing } from '@/contexts/SpacingContext';

export interface LabelProps extends Omit<TextProps, 'children' | 'style'> {
  children: React.ReactNode;
  htmlFor?: string; // For accessibility and form association
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Label = React.forwardRef<View, LabelProps>(({
  children,
  htmlFor,
  required = false,
  disabled = false,
  error = false,
  hint,
  onPress,
  size = 'sm',
  weight = 'medium',
  colorTheme,
  style,
  ...textProps
}, ref) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  // Determine text color based on state
  const getTextColor = () => {
    if (error) return theme.destructive;
    if (disabled) return theme.mutedForeground;
    if (colorTheme) return undefined; // Use colorTheme prop
    return theme.foreground;
  };

  const textColor = getTextColor();

  const labelContent = (
    <View ref={ref} style={style}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          size={size}
          weight={weight}
          colorTheme={colorTheme}
          style={[
            textColor ? { color: textColor } : {},
            disabled && { opacity: 0.6 },
          ]}
          {...textProps}
        >
          {children}
        </Text>
        {required && (
          <Text
            size={size}
            style={{
              color: theme.destructive,
              marginLeft: spacing[0.5],
            }}
          >
            *
          </Text>
        )}
      </View>
      
      {hint && (
        <Text
          size="xs"
          colorTheme="mutedForeground"
          style={{ marginTop: spacing[0.5] }}
        >
          {hint}
        </Text>
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.7 : 1 }}>
            {labelContent}
          </View>
        )}
      </Pressable>
    );
  }

  return labelContent;
});

Label.displayName = 'Label';

// FormField component that combines Label with spacing
export interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  labelProps?: Omit<LabelProps, 'children'>;
  style?: ViewStyle;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  required = false,
  error,
  hint,
  labelProps,
  style,
}) => {
  const { spacing } = useSpacing();
  const theme = useTheme();

  return (
    <View style={style}>
      <Label
        required={required}
        error={!!error}
        hint={hint}
        {...labelProps}
      >
        {label}
      </Label>
      
      <View style={{ marginTop: spacing[1.5] }}>
        {children}
      </View>
      
      {error && (
        <Text
          size="xs"
          style={{
            color: theme.destructive,
            marginTop: spacing[1],
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

FormField.displayName = 'FormField';