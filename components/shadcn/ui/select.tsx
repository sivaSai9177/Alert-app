import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import { cn } from "@/lib/core/utils";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const Select = React.forwardRef<View, SelectProps>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = "Select an option",
      label,
      error,
      disabled = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <View ref={ref} className="w-full">
        {label && (
          <Text className="text-sm font-medium text-foreground mb-1.5">
            {label}
          </Text>
        )}
        <TouchableOpacity
          onPress={() => !disabled && setIsOpen(true)}
          className={cn(
            "flex flex-row items-center justify-between h-10 w-full rounded-md border border-input bg-background px-3 py-2",
            disabled && "opacity-50",
            error && "border-destructive"
          )}
          disabled={disabled}
        >
          <Text
            className={cn(
              "text-sm",
              selectedOption ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <ChevronDown size={16} color="#9ca3af" />
        </TouchableOpacity>
        {error && (
          <Text className="text-xs text-destructive mt-1">{error}</Text>
        )}

        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-center items-center"
            onPress={() => setIsOpen(false)}
          >
            <View className="bg-background rounded-lg p-4 w-[90%] max-h-[80%]">
              <Text className="text-lg font-semibold mb-4">
                {label || "Select an option"}
              </Text>
              <ScrollView className="max-h-96">
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      onValueChange?.(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "p-3 rounded-md",
                      value === option.value && "bg-accent"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm",
                        value === option.value
                          ? "text-accent-foreground font-medium"
                          : "text-foreground"
                      )}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }
);

Select.displayName = "Select";

export { Select, type SelectOption };