import * as React from "react";
import { Switch as RNSwitch, SwitchProps as RNSwitchProps, View, Platform } from "react-native";
import { useTheme } from "@/lib/theme/theme-provider";

export interface SwitchProps extends Omit<RNSwitchProps, 'value' | 'onValueChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<RNSwitch, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View style={{ 
        opacity: disabled ? 0.5 : 1,
      }}>
        <RNSwitch
          ref={ref}
          value={checked}
          onValueChange={onCheckedChange}
          disabled={disabled}
          trackColor={{
            false: theme.border || '#e2e8f0',
            true: theme.primary || '#6366f1',
          }}
          thumbColor={
            Platform.OS === 'ios' 
              ? undefined 
              : checked 
                ? theme.primaryForeground || '#ffffff'
                : theme.muted || '#f1f5f9'
          }
          ios_backgroundColor={theme.border || '#e2e8f0'}
          {...props}
        />
      </View>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };