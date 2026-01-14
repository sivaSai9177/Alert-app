import * as React from "react"
import { Platform, TouchableOpacity, View } from "react-native"
import { Ionicons } from '@expo/vector-icons';

// Define types first
export interface CheckboxNativeProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Platform-specific implementation
let CheckboxComponent: React.ComponentType<any>;

if (Platform.OS === 'web') {
  // Web implementation using Radix UI
  const CheckboxPrimitive = require("@radix-ui/react-checkbox");
  const { cn } = require("@/lib/core/utils");

  CheckboxComponent = React.forwardRef<
    React.ComponentRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
  >(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Ionicons name="checkmark" size={14} color="currentColor" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ));
} else {
  // Mobile implementation using React Native components
  CheckboxComponent = React.forwardRef<any, CheckboxNativeProps>(
    ({ className, checked = false, onCheckedChange, disabled = false, size = "md", ...props }, ref) => {
      const sizeMap = {
        sm: { dimension: 14, iconSize: 10, borderRadius: 2 },
        md: { dimension: 16, iconSize: 12, borderRadius: 3 }, 
        lg: { dimension: 20, iconSize: 16, borderRadius: 4 }
      };

      const { dimension, iconSize, borderRadius } = sizeMap[size];

      return (
        <TouchableOpacity
          ref={ref}
          disabled={disabled}
          onPress={() => onCheckedChange?.(!checked)}
          style={{
            width: dimension,
            height: dimension,
            borderRadius,
            borderWidth: 1.5,
            borderColor: checked ? '#1f2937' : '#d1d5db',
            backgroundColor: checked ? '#1f2937' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : 1,
            // Add shadow for depth like shadcn
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
            elevation: 1,
          }}
          activeOpacity={0.7}
          {...props}
        >
          {checked && (
            <Ionicons 
              name="checkmark" 
              size={iconSize} 
              color="white"
            />
          )}
        </TouchableOpacity>
      );
    }
  );
}

CheckboxComponent.displayName = "Checkbox";

export const Checkbox = CheckboxComponent;
