import * as React from "react";
import { Pressable, Text, PressableProps, Platform, View, ActivityIndicator } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/core/utils";
import { useTheme } from "@/lib/theme/theme-provider";
import "@/app/global.css";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:bg-muted disabled:text-muted-foreground",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:bg-muted disabled:text-muted-foreground disabled:border-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:bg-muted disabled:text-muted-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground disabled:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline disabled:text-muted-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<PressableProps, "className">,
    VariantProps<typeof buttonVariants> {
  className?: string;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void; // For web compatibility
  loading?: boolean;
}

const Button = React.forwardRef<View, ButtonProps>(
  ({ className, variant, size, children, disabled, onPress, onClick, type, loading, ...props }, ref) => {
    const theme = useTheme();
    
    // Handle form submission for web
    const handlePress = React.useCallback(() => {
      if (loading) return;
      
      if (Platform.OS === "web" && type === "submit") {
        // For web form submission, we need to trigger the form's submit event
        const form = (ref as any)?.current?.closest("form");
        if (form) {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
          return;
        }
      }
      
      // Use onClick for web, onPress for native
      if (onClick) onClick();
      if (onPress) onPress(null as any);
    }, [onClick, onPress, type, ref, loading]);

    // Get button colors based on variant and theme
    const getButtonStyle = () => {
      const baseStyle: any = {
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      };

      // Apply disabled styles
      if (disabled || loading) {
        baseStyle.backgroundColor = theme.muted || '#e5e7eb';
        if (variant === "outline") {
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = theme.muted || '#e5e7eb';
        }
        return baseStyle;
      }

      switch (variant) {
        case "default":
          baseStyle.backgroundColor = theme.primary;
          break;
        case "destructive":
          baseStyle.backgroundColor = theme.destructive;
          break;
        case "outline":
          baseStyle.backgroundColor = 'transparent';
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = theme.border;
          break;
        case "secondary":
          baseStyle.backgroundColor = theme.secondary;
          break;
        case "ghost":
          baseStyle.backgroundColor = 'transparent';
          break;
        case "link":
          baseStyle.backgroundColor = 'transparent';
          break;
      }

      if (size === "sm") {
        baseStyle.paddingHorizontal = 12;
        baseStyle.paddingVertical = 6;
      } else if (size === "lg") {
        baseStyle.paddingHorizontal = 24;
        baseStyle.paddingVertical = 14;
      }

      return baseStyle;
    };

    const getTextColor = () => {
      if (disabled || loading) return theme.mutedForeground || '#9ca3af';
      
      switch (variant) {
        case "default":
          // For default variant, text should be light on dark background
          return theme.primaryForeground || '#ffffff';
        case "destructive":
          return theme.destructiveForeground || '#ffffff';
        case "outline":
          return theme.foreground || '#111827';
        case "secondary":
          return theme.secondaryForeground || '#111827';
        case "ghost":
          return theme.foreground || '#111827';
        case "link":
          return theme.primary || '#6366f1';
        default:
          return theme.primaryForeground || '#ffffff';
      }
    };

    return (
      <Pressable
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, className })
        )}
        disabled={disabled || loading}
        onPress={handlePress}
        style={({ pressed }) => [
          getButtonStyle(),
          { opacity: pressed && !disabled && !loading ? 0.7 : 1 }
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={getTextColor()} 
          />
        ) : (
          <Text
            className={cn(
              "text-sm font-medium",
              variant === "link" && "underline"
            )}
            style={{
              color: getTextColor(),
              fontSize: size === "sm" ? 14 : size === "lg" ? 18 : 16,
            }}
          >
            {children}
          </Text>
        )}
      </Pressable>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };