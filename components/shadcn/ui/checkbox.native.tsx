import * as React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "@/lib/core/utils";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Checkbox = React.forwardRef<View, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, size = "md", ...props }, ref) => {
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
          backgroundColor: checked ? undefined : 'transparent',
          borderColor: checked ? undefined : '#e5e7eb',
        }}
        {...props}
      >
        {checked && (
          <Check 
            size={iconSizes[size]} 
            color={checked ? "white" : "transparent"}
            strokeWidth={3}
          />
        )}
      </TouchableOpacity>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };