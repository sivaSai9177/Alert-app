import * as React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";
import { cn } from "@/lib/core/utils";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, label, error, success, hint, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };
    
    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };
    
    return (
      <View className="w-full">
        {label && (
          <Text 
            className={cn(
              "text-sm font-medium mb-1.5",
              error ? "text-destructive" : "text-foreground"
            )}
            style={{
              color: error ? '#ef4444' : '#1f2937'
            }}
          >
            {label}
          </Text>
        )}
        
        <View
          className={cn(
            "border rounded-md bg-background",
            error && "border-destructive",
            success && "border-green-500",
            !error && !success && (isFocused ? "border-primary" : "border-input")
          )}
          style={{
            borderColor: error ? '#ef4444' : 
                        success ? '#10b981' :
                        isFocused ? '#1f2937' : '#e5e7eb',
            backgroundColor: '#ffffff',
            ...(isFocused && { borderWidth: 2 }), // Only add border width on focus, not as a class
          }}
        >
          <TextInput
            ref={ref}
            className={cn(
              "h-10 px-3 py-2 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "disabled:opacity-50",
              className
            )}
            style={{
              color: '#1f2937'
            }}
            placeholderTextColor="#6b7280"
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </View>
        
        {/* Error message */}
        {error && (
          <Text className="text-xs text-destructive mt-1" style={{ color: '#ef4444' }}>
            {error}
          </Text>
        )}
        
        {/* Hint text */}
        {hint && !error && (
          <Text className="text-xs text-muted-foreground mt-1" style={{ color: '#6b7280' }}>
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

export { Input };