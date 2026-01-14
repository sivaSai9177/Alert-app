import * as React from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/core/utils";
import { useTheme } from "@/lib/theme/theme-provider";

const toastVariants = cva(
  "flex-row items-start justify-between p-4 rounded-lg shadow-lg mb-2 mx-4 max-w-sm w-full border",
  {
    variants: {
      variant: {
        default: "bg-background border-border text-foreground",
        destructive: "bg-destructive/10 border-destructive/20 text-destructive-foreground",
        success: "bg-green-50 border-green-200 text-green-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const toastTitleVariants = cva(
  "font-semibold text-sm mb-1",
  {
    variants: {
      variant: {
        default: "text-foreground",
        destructive: "text-destructive",
        success: "text-green-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const toastDescriptionVariants = cva(
  "text-sm",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        destructive: "text-destructive/90",
        success: "text-green-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
  id: string;
  title?: string;
  description?: string;
  onClose: (id: string) => void;
  className?: string;
}

const Toast = React.forwardRef<View, ToastProps>(
  ({ id, title, description, variant = "default", onClose, className, ...props }, ref) => {
    const theme = useTheme();
    return (
      <View
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <View className="flex-1">
          {title && (
            <Text className={toastTitleVariants({ variant })}>
              {title}
            </Text>
          )}
          {description && (
            <Text className={toastDescriptionVariants({ variant })}>
              {description}
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => onClose(id)}
          className="ml-2 p-1 hover:bg-accent rounded"
          accessibilityLabel="Close toast"
          accessibilityRole="button"
        >
          {({ pressed }) => (
            <Ionicons 
              name="close" 
              size={16} 
              color={theme.mutedForeground} 
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
      </View>
    );
  }
);

Toast.displayName = "Toast";

// Toast Context and Provider
interface ToastContextType {
  toast: (options: {
    title?: string;
    description?: string;
    variant?: "default" | "destructive" | "success";
    duration?: number;
  }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
  className?: string;
}

export function ToastProvider({ children, className }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<(ToastProps & { 
    createdAt: number; 
    duration: number;
  })[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = React.useCallback((options: {
    title?: string;
    description?: string;
    variant?: "default" | "destructive" | "success";
    duration?: number;
  }) => {
    const id = Math.random().toString(36).substring(2, 11);
    const duration = options.duration ?? 5000;
    
    const newToast = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant ?? "default",
      createdAt: Date.now(),
      duration,
      onClose: dismiss,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, [dismiss]);

  // Auto-cleanup stale toasts
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setToasts(prev => prev.filter(toast => 
        toast.duration <= 0 || (now - toast.createdAt) < toast.duration
      ));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const contextValue = React.useMemo(() => ({
    toast,
    dismiss,
  }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View 
        className={cn(
          "absolute bottom-20 left-0 right-0 z-50 items-center pointer-events-none",
          Platform.OS === "web" && "fixed",
          className
        )}
        style={{ pointerEvents: "box-none" }}
      >
        {toasts.map((toastProps) => (
          <View 
            key={toastProps.id} 
            className="pointer-events-auto"
            style={{ pointerEvents: "auto" }}
          >
            <Toast {...toastProps} />
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export { Toast, toastVariants };