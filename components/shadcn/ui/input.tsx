import * as React from "react";
import { TextInput, TextInputProps, View, Text, Animated } from "react-native";
import { cn } from "@/lib/core/utils";
import { useTheme } from "@/lib/theme/theme-provider";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, label, error, success, hint, ...props }, ref) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    
    // Animation values
    const borderColorAnim = React.useRef(new Animated.Value(0)).current;
    const shakeAnim = React.useRef(new Animated.Value(0)).current;
    const successAnim = React.useRef(new Animated.Value(0)).current;
    
    // Animate border color on focus/error/success
    React.useEffect(() => {
      if (error) {
        // Shake animation for errors
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
        
        Animated.timing(borderColorAnim, {
          toValue: 2, // Error state
          duration: 200,
          useNativeDriver: false,
        }).start();
      } else if (success) {
        // Success pulse animation
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        
        Animated.timing(borderColorAnim, {
          toValue: 1, // Success state
          duration: 200,
          useNativeDriver: false,
        }).start();
      } else if (isFocused) {
        Animated.timing(borderColorAnim, {
          toValue: 0, // Focus state
          duration: 200,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.timing(borderColorAnim, {
          toValue: 0, // Default state
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }, [error, success, isFocused]);
    
    // Border color interpolation
    const borderColor = borderColorAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [
        isFocused ? theme.primary : theme.border, // Focus: primary, Default: border
        '#10b981', // Success: green
        theme.destructive || '#ef4444', // Error: destructive
      ],
    });
    
    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };
    
    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };
    
    const handleChangeText = (text: string) => {
      setHasValue(text.length > 0);
      props.onChangeText?.(text);
    };
    
    // Validation state icons
    const getValidationIcon = () => {
      if (error) return "❌";
      if (success) return "✅";
      return null;
    };
    
    return (
      <View className="w-full">
        {label && (
          <Animated.Text 
            className={cn(
              "text-sm font-medium mb-1.5 transition-colors duration-200",
              error ? "text-red-600" : success ? "text-green-600" : "text-foreground"
            )}
          >
            {label}
          </Animated.Text>
        )}
        
        <Animated.View
          style={{
            transform: [{ translateX: shakeAnim }],
          }}
        >
          <Animated.View
            style={{
              borderColor,
              borderWidth: isFocused || error || success ? 2 : 1,
              borderRadius: 6,
              backgroundColor: theme.background,
            }}
            className={cn(
              "flex-row items-center transition-all duration-200",
              error && "bg-red-50",
              success && "bg-green-50"
            )}
          >
            <TextInput
              ref={ref}
              className={cn(
                "flex-1 h-10 px-3 py-2 text-sm",
                "disabled:opacity-50",
                className
              )}
              placeholderTextColor={theme.mutedForeground}
              style={{
                color: theme.foreground,
                outlineWidth: 0, // Remove web outline
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChangeText={handleChangeText}
              {...props}
            />
            
            {/* Validation Icon */}
            {(error || success) && (
              <Animated.View
                style={{
                  opacity: successAnim,
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {getValidationIcon()}
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>
        
        {/* Error Message */}
        {error && (
          <Animated.Text 
            className="text-xs text-red-600 mt-1 font-medium"
            style={{
              opacity: borderColorAnim.interpolate({
                inputRange: [0, 2],
                outputRange: [0, 1],
              }),
            }}
          >
            {error}
          </Animated.Text>
        )}
        
        {/* Success Message */}
        {success && !error && (
          <Animated.Text 
            className="text-xs text-green-600 mt-1 font-medium"
            style={{ opacity: successAnim }}
          >
            ✓ Looks good!
          </Animated.Text>
        )}
        
        {/* Hint Message */}
        {hint && !error && !success && (
          <Text className="text-xs text-muted-foreground mt-1">
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

export { Input };