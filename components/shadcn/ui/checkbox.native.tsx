import * as React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/core/utils";
import { useTheme } from "@/lib/theme/theme-provider";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Checkbox = React.forwardRef<View, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, size = "md", ...props }, ref) => {
    const theme = useTheme();
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4", 
      lg: "h-5 w-5"
    };

    const iconSizes = {
      sm: 12,
      md: 16,
      lg: 20
    };

    return (
      <TouchableOpacity
        ref={ref}
        disabled={disabled}
        onPress={() => onCheckedChange?.(!checked)}
        className={cn(
          "shrink-0 rounded-sm border-2 border-input bg-background",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          checked && "bg-primary border-primary",
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: checked ? theme.primary : 'transparent',
          borderColor: checked ? theme.primary : theme.border,
        }}
        {...props}
      >
        {checked && (
          <Ionicons 
            name="checkmark" 
            size={iconSizes[size]} 
            color={theme.primaryForeground}
          />
        )}
      </TouchableOpacity>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };