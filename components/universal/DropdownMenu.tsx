import { useSpacing } from "@/contexts/SpacingContext";
import { designSystem } from "@/lib/design-system";
import { useTheme } from "@/lib/theme/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Box } from "./Box";
import { VStack } from "./Stack";
import { Text as UniversalText } from "./Text";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactElement;
  disabled?: boolean;
}

export interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  minWidth?: number;
}

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
  shortcut?: string;
}

export interface DropdownMenuCheckboxItemProps extends DropdownMenuItemProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export interface DropdownMenuRadioItemProps extends DropdownMenuItemProps {
  value: string;
}

export interface DropdownMenuLabelProps {
  children: React.ReactNode;
}

export interface DropdownMenuSeparatorProps {
  style?: any;
}

export interface DropdownMenuGroupProps {
  children: React.ReactNode;
}

export interface DropdownMenuRadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

// Dropdown Context
const DropdownMenuContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerLayout: { x: number; y: number; width: number; height: number } | null;
  setTriggerLayout: (layout: { x: number; y: number; width: number; height: number } | null) => void;
} | null>(null);

const DropdownMenuRadioContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

const useDropdownMenuContext = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(
      "DropdownMenu components must be used within a DropdownMenu"
    );
  }
  return context;
};

// Main DropdownMenu Component
export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset trigger layout when closing
      setTimeout(() => setTriggerLayout(null), 300);
    }
  };

  const updateTriggerLayout = (layout: { x: number; y: number; width: number; height: number } | null) => {
    setTriggerLayout(layout);
  };

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange, triggerLayout, setTriggerLayout: updateTriggerLayout }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

// DropdownMenu Trigger
export function DropdownMenuTrigger({
  asChild,
  children,
  disabled,
}: DropdownMenuTriggerProps) {
  const context = useDropdownMenuContext();
  const triggerRef = useRef<View>(null);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  const handlePress = () => {
    if (disabled) return;

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      // Update trigger layout through context method
      context.setTriggerLayout({ x, y, width, height });
      context.onOpenChange(true);
    });
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onPress: handlePress,
      disabled,
      onPointerEnter: Platform.OS === 'web' && !disabled ? () => setIsHovered(true) : undefined,
      onPointerLeave: Platform.OS === 'web' && !disabled ? () => setIsHovered(false) : undefined,
      style: ({ pressed }: any) => [
        typeof (children as any).props.style === 'function' 
          ? (children as any).props.style({ pressed }) 
          : (children as any).props.style,
        (pressed || isHovered) && !disabled && {
          backgroundColor: theme.accent,
        },
      ] as any,
    } as any);
  }

  return (
    <Pressable
      ref={triggerRef}
      onPress={handlePress}
      disabled={disabled}
      onPointerEnter={Platform.OS === 'web' && !disabled ? () => setIsHovered(true) : undefined}
      onPointerLeave={Platform.OS === 'web' && !disabled ? () => setIsHovered(false) : undefined}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        backgroundColor: pressed || isHovered ? theme.accent : 'transparent',
        borderRadius: 4,
        ...(Platform.OS === 'web' && {
          transition: 'all 0.15s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
        } as any),
      })}
    >
      {children}
    </Pressable>
  );
}

// DropdownMenu Portal
export function DropdownMenuPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

// DropdownMenu Content
export function DropdownMenuContent({
  children,
  align = "start",
  sideOffset = 8,
  minWidth = 200,
}: DropdownMenuContentProps) {
  const { open, onOpenChange, triggerLayout } = useDropdownMenuContext();
  const theme = useTheme();
  const { spacing } = useSpacing();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  if (!triggerLayout) return null;

  // Calculate position
  let left = triggerLayout.x;
  let top = triggerLayout.y + triggerLayout.height + sideOffset;

  // Align adjustments
  if (align === "center") {
    left = triggerLayout.x + triggerLayout.width / 2 - minWidth / 2;
  } else if (align === "end") {
    left = triggerLayout.x + triggerLayout.width - minWidth;
  }

  // Ensure menu stays within screen bounds
  const maxLeft = screenWidth - minWidth - spacing[4];
  const maxTop = screenHeight - 300; // Approximate max height

  left = Math.max(spacing[4], Math.min(left, maxLeft));
  top = Math.min(top, maxTop);

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={() => onOpenChange(false)}
    >
      <TouchableWithoutFeedback onPress={() => onOpenChange(false)}>
        <View style={{ flex: 1 }}>
          <Animated.View
            style={{
              position: "absolute",
              left,
              top,
              minWidth,
              backgroundColor: theme.popover,
              borderRadius: designSystem.borderRadius.md,
              borderWidth: 1,
              borderColor: theme.border,
              ...designSystem.shadows.md,
              padding: spacing[1],
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 300 }}
            >
              {children}
            </ScrollView>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// DropdownMenu Item
export function DropdownMenuItem({
  children,
  onPress,
  disabled,
  destructive,
  icon,
  shortcut,
}: DropdownMenuItemProps) {
  const { onOpenChange } = useDropdownMenuContext();
  const theme = useTheme();
  const { spacing } = useSpacing();
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
      onOpenChange(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      onPointerEnter={Platform.OS === 'web' && !disabled ? () => setIsHovered(true) : undefined}
      onPointerLeave={Platform.OS === 'web' && !disabled ? () => setIsHovered(false) : undefined}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1.5],
        borderRadius: designSystem.borderRadius.sm,
        backgroundColor: pressed || isHovered ? theme.accent : 'transparent',
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        ...(Platform.OS === 'web' && {
          transition: 'backgroundColor 0.15s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
        } as any),
      })}
    >
      {icon && <Box mr={2}>{icon}</Box>}

      <UniversalText
        size="sm"
        colorTheme={destructive ? "destructive" : "popoverForeground"}
        style={{ flex: 1 }}
      >
        {children}
      </UniversalText>

      {shortcut && (
        <UniversalText
          size="xs"
          colorTheme="mutedForeground"
          style={{ marginLeft: spacing[4] }}
        >
          {shortcut}
        </UniversalText>
      )}
    </Pressable>
  );
}

// DropdownMenu Checkbox Item
export function DropdownMenuCheckboxItem({
  children,
  checked,
  onCheckedChange,
  disabled,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
    props.onPress?.();
  };

  return (
    <DropdownMenuItem
      {...props}
      onPress={handlePress}
      disabled={disabled}
      icon={
        <Box width={16} height={16} alignItems="center" justifyContent="center">
          {checked && (
            <Ionicons
              name="checkmark"
              size={14}
              color={useTheme().foreground}
            />
          )}
        </Box>
      }
    >
      {children}
    </DropdownMenuItem>
  );
}

// DropdownMenu Radio Group
export function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
}: DropdownMenuRadioGroupProps) {
  return (
    <DropdownMenuRadioContext.Provider value={{ value, onValueChange }}>
      {children}
    </DropdownMenuRadioContext.Provider>
  );
}

// DropdownMenu Radio Item
export function DropdownMenuRadioItem({
  children,
  value,
  disabled,
  ...props
}: DropdownMenuRadioItemProps) {
  const radioContext = React.useContext(DropdownMenuRadioContext);
  const isSelected = radioContext?.value === value;

  const handlePress = () => {
    if (!disabled && radioContext?.onValueChange) {
      radioContext.onValueChange(value);
    }
    props.onPress?.();
  };

  return (
    <DropdownMenuItem
      {...props}
      onPress={handlePress}
      disabled={disabled}
      icon={
        <Box width={16} height={16} alignItems="center" justifyContent="center">
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isSelected
                ? useTheme().foreground
                : "transparent",
            }}
          />
        </Box>
      }
    >
      {children}
    </DropdownMenuItem>
  );
}

// DropdownMenu Label
export function DropdownMenuLabel({ children }: DropdownMenuLabelProps) {
  const { spacing } = useSpacing();

  return (
    <Box px={2} py={1.5}>
      <UniversalText size="xs" weight="semibold" colorTheme="mutedForeground">
        {children}
      </UniversalText>
    </Box>
  );
}

// DropdownMenu Separator
export function DropdownMenuSeparator({ style }: DropdownMenuSeparatorProps) {
  const theme = useTheme();
  const { spacing } = useSpacing();

  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: theme.border,
          marginVertical: spacing[1],
          marginHorizontal: -spacing[1],
        },
        style,
      ]}
    />
  );
}

// DropdownMenu Group
export function DropdownMenuGroup({ children }: DropdownMenuGroupProps) {
  return <VStack spacing={0}>{children}</VStack>;
}

// DropdownMenu Sub (not implemented for mobile)
export const DropdownMenuSub = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.warn("DropdownMenuSub is not supported on mobile platforms");
  return null;
};

export const DropdownMenuSubTrigger = DropdownMenuItem;
export const DropdownMenuSubContent = DropdownMenuContent;

// DropdownMenu Shortcut (convenience component)
export function DropdownMenuShortcut({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UniversalText size="xs" colorTheme="mutedForeground">
      {children}
    </UniversalText>
  );
}
