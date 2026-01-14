import React from 'react';
import {
  View,
  Animated,
  Platform,
  ViewStyle,
  Pressable,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { Text } from './Text';
import { Box } from './Box';
import { HStack } from './Stack';
import { Ionicons } from '@expo/vector-icons';
import { useSpacing } from '@/contexts/SpacingContext';
import { SpacingScale } from '@/lib/design-system';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface ToastConfig {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  onClose?: () => void;
  icon?: React.ReactNode;
  position?: ToastPosition;
}

interface ToastProps extends ToastConfig {
  onHide: () => void;
}

// Theme-aware color mapping
const getToastColors = (variant: ToastVariant, theme: any) => {
  const colorMap = {
    default: {
      background: theme.card,
      border: theme.border,
      text: theme.foreground,
      description: theme.mutedForeground,
      icon: theme.foreground,
    },
    success: {
      background: theme.success + '1a',
      border: theme.success,
      text: theme.foreground,
      description: theme.mutedForeground,
      icon: theme.success,
    },
    error: {
      background: theme.destructive + '1a',
      border: theme.destructive,
      text: theme.foreground,
      description: theme.mutedForeground,
      icon: theme.destructive,
    },
    warning: {
      background: '#f59e0b' + '1a',
      border: '#f59e0b',
      text: theme.foreground,
      description: theme.mutedForeground,
      icon: '#f59e0b',
    },
    info: {
      background: theme.primary + '1a',
      border: theme.primary,
      text: theme.foreground,
      description: theme.mutedForeground,
      icon: theme.primary,
    },
  };
  
  return colorMap[variant];
};

const variantIcons: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  default: 'information-circle-outline',
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
};

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'default',
  duration = 4000,
  action,
  onClose,
  onHide,
  icon,
  position = 'bottom',
}) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  const colors = getToastColors(variant, theme);
  
  const translateY = React.useRef(new Animated.Value(100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position.includes('top') ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
      onClose?.();
    });
  };

  const iconElement = icon || (
    <Ionicons
      name={variantIcons[variant]}
      size={componentSpacing.iconSize.lg}
      color={colors.icon}
    />
  );

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      <Box
        p={4 as SpacingScale}
        m={3 as SpacingScale}
        rounded="md"
        style={{
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
          elevation: 3,
          minWidth: 300,
          maxWidth: 400,
        }}
      >
        <HStack spacing={3 as SpacingScale} alignItems="flex-start">
          {iconElement}
          
          <Box flex={1}>
            {title && (
              <Text
                weight="semibold"
                size="md"
                style={{ color: colors.text }}
              >
                {title}
              </Text>
            )}
            
            {description && (
              <Text
                size="sm"
                style={{
                  color: colors.description,
                  marginTop: title ? spacing[0.5] : 0,
                }}
              >
                {description}
              </Text>
            )}
            
            {action && (
              <Pressable
                onPress={action.onPress}
                style={{ marginTop: spacing[2] }}
              >
                {({ pressed }) => (
                  <Text
                    size="sm"
                    weight="medium"
                    style={{
                      color: colors.icon,
                      opacity: pressed ? 0.7 : 1,
                    }}
                  >
                    {action.label}
                  </Text>
                )}
              </Pressable>
            )}
          </Box>
          
          {onClose && (
            <Pressable
              onPress={handleClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              {({ pressed }) => (
                <Ionicons
                  name="close"
                  size={componentSpacing.iconSize.md}
                  color={colors.icon}
                  style={{ opacity: pressed ? 0.7 : 1 }}
                />
              )}
            </Pressable>
          )}
        </HStack>
      </Box>
    </Animated.View>
  );
};

// Toast Context
interface ToastContextType {
  show: (config: ToastConfig) => void;
  hide: (id?: string) => void;
  hideAll: () => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 3,
}) => {
  const [toasts, setToasts] = React.useState<(ToastConfig & { id: string })[]>([]);

  const show = React.useCallback((config: ToastConfig) => {
    const id = config.id || Math.random().toString(36).substr(2, 9);
    const newToast = { ...config, id };

    setToasts(prev => {
      const updated = [...prev, newToast];
      // Limit number of toasts
      if (updated.length > maxToasts) {
        return updated.slice(-maxToasts);
      }
      return updated;
    });
  }, [maxToasts]);

  const hide = React.useCallback((id?: string) => {
    if (id) {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    } else {
      // Hide the oldest toast
      setToasts(prev => prev.slice(1));
    }
  }, []);

  const hideAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  const value = React.useMemo(() => ({
    show,
    hide,
    hideAll,
  }), [show, hide, hideAll]);

  const getPositionStyle = (position: ToastPosition): ViewStyle => {
    const base: ViewStyle = {
      position: 'absolute',
      zIndex: 9999,
    };

    switch (position) {
      case 'top':
        return { ...base, top: 0, left: 0, right: 0, alignItems: 'center' };
      case 'bottom':
        return { ...base, bottom: 0, left: 0, right: 0, alignItems: 'center' };
      case 'top-right':
        return { ...base, top: 0, right: 0 };
      case 'top-left':
        return { ...base, top: 0, left: 0 };
      case 'bottom-right':
        return { ...base, bottom: 0, right: 0 };
      case 'bottom-left':
        return { ...base, bottom: 0, left: 0 };
      default:
        return { ...base, bottom: 0, left: 0, right: 0, alignItems: 'center' };
    }
  };

  // Group toasts by position
  const toastsByPosition = React.useMemo(() => {
    return toasts.reduce((acc, toast) => {
      const position = toast.position || 'bottom';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(toast);
      return acc;
    }, {} as Record<ToastPosition, typeof toasts>);
  }, [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <View
          key={position}
          style={getPositionStyle(position as ToastPosition)}
          pointerEvents="box-none"
        >
          {positionToasts.map(toast => (
            <Toast
              key={toast.id}
              {...toast}
              onHide={() => hide(toast.id)}
            />
          ))}
        </View>
      ))}
    </ToastContext.Provider>
  );
};

// Convenience methods
export const toast = {
  success: (title: string, description?: string, config?: Partial<ToastConfig>) => {
    const context = React.useContext(ToastContext);
    context?.show({ ...config, title, description, variant: 'success' });
  },
  error: (title: string, description?: string, config?: Partial<ToastConfig>) => {
    const context = React.useContext(ToastContext);
    context?.show({ ...config, title, description, variant: 'error' });
  },
  warning: (title: string, description?: string, config?: Partial<ToastConfig>) => {
    const context = React.useContext(ToastContext);
    context?.show({ ...config, title, description, variant: 'warning' });
  },
  info: (title: string, description?: string, config?: Partial<ToastConfig>) => {
    const context = React.useContext(ToastContext);
    context?.show({ ...config, title, description, variant: 'info' });
  },
};