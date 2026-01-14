import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ViewStyle,
  StyleSheet,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
  animationDuration?: number;
  swipeEnabled?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showHandle?: boolean;
  style?: ViewStyle;
  overlayStyle?: ViewStyle;
  testID?: string;
}

const DRAWER_SIZES = {
  sm: 280,
  md: 360,
  lg: 480,
  full: '100%' as const,
};

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

export const Drawer = React.forwardRef<View, DrawerProps>(
  (
    {
      visible,
      onClose,
      position = 'left',
      size = 'md',
      children,
      animationDuration = 300,
      swipeEnabled = true,
      closeOnBackdrop = true,
      closeOnEscape = true,
      showHandle = true,
      style,
      overlayStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    const insets = useSafeAreaInsets();
    
    const translateValue = useRef(new Animated.Value(0)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    
    const getDrawerSize = () => {
      if (size === 'full') return position === 'left' || position === 'right' ? SCREEN_WIDTH : SCREEN_HEIGHT;
      return DRAWER_SIZES[size];
    };
    
    const drawerSize = getDrawerSize();
    
    const getInitialTranslateValue = () => {
      const baseSize = typeof drawerSize === 'number' ? drawerSize : SCREEN_WIDTH;
      switch (position) {
        case 'left':
          return -baseSize;
        case 'right':
          return baseSize;
        case 'top':
          return -baseSize;
        case 'bottom':
          return baseSize;
        default:
          return -baseSize;
      }
    };
    
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => swipeEnabled,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (!swipeEnabled) return false;
          
          const { dx, dy } = gestureState;
          switch (position) {
            case 'left':
              return dx < -10;
            case 'right':
              return dx > 10;
            case 'top':
              return dy < -10;
            case 'bottom':
              return dy > 10;
            default:
              return false;
          }
        },
        onPanResponderMove: (_, gestureState) => {
          const { dx, dy } = gestureState;
          let value = 0;
          
          switch (position) {
            case 'left':
              value = Math.min(0, dx);
              break;
            case 'right':
              value = Math.max(0, dx);
              break;
            case 'top':
              value = Math.min(0, dy);
              break;
            case 'bottom':
              value = Math.max(0, dy);
              break;
          }
          
          translateValue.setValue(value);
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx, dy, vx, vy } = gestureState;
          const shouldClose = 
            (position === 'left' && (dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY_THRESHOLD)) ||
            (position === 'right' && (dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY_THRESHOLD)) ||
            (position === 'top' && (dy < -SWIPE_THRESHOLD || vy < -SWIPE_VELOCITY_THRESHOLD)) ||
            (position === 'bottom' && (dy > SWIPE_THRESHOLD || vy > SWIPE_VELOCITY_THRESHOLD));
          
          if (shouldClose) {
            handleClose();
          } else {
            Animated.timing(translateValue, {
              toValue: 0,
              duration: animationDuration / 2,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;
    
    const handleClose = useCallback(() => {
      Animated.parallel([
        Animated.timing(translateValue, {
          toValue: getInitialTranslateValue(),
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
      });
    }, [animationDuration, onClose, overlayOpacity, translateValue]);
    
    useEffect(() => {
      if (visible) {
        translateValue.setValue(getInitialTranslateValue());
        Animated.parallel([
          Animated.timing(translateValue, {
            toValue: 0,
            duration: animationDuration,
            useNativeDriver: true,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible, animationDuration, overlayOpacity, translateValue]);
    
    useEffect(() => {
      if (Platform.OS === 'web' && closeOnEscape) {
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && visible) {
            handleClose();
          }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [visible, closeOnEscape, handleClose]);
    
    const getDrawerStyle = (): ViewStyle => {
      const isHorizontal = position === 'left' || position === 'right';
      const baseStyle: ViewStyle = {
        position: 'absolute',
        backgroundColor: theme.card,
        ...Platform.select({
          ios: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          },
          android: {
            elevation: 16,
          },
          default: {
            boxShadow: `0 2px 8px ${theme.foreground}20`,
          },
        }),
      };
      
      switch (position) {
        case 'left':
          return {
            ...baseStyle,
            left: 0,
            top: 0,
            bottom: 0,
            width: drawerSize,
            paddingLeft: insets.left,
          };
        case 'right':
          return {
            ...baseStyle,
            right: 0,
            top: 0,
            bottom: 0,
            width: drawerSize,
            paddingRight: insets.right,
          };
        case 'top':
          return {
            ...baseStyle,
            top: 0,
            left: 0,
            right: 0,
            height: drawerSize,
            paddingTop: insets.top,
          };
        case 'bottom':
          return {
            ...baseStyle,
            bottom: 0,
            left: 0,
            right: 0,
            height: drawerSize,
            paddingBottom: insets.bottom,
          };
      }
    };
    
    const getTransformStyle = (): any => {
      if (position === 'left' || position === 'right') {
        return {
          transform: [{ translateX: translateValue }],
        };
      } else {
        return {
          transform: [{ translateY: translateValue }],
        };
      }
    };
    
    const renderHandle = () => {
      if (!showHandle) return null;
      
      const isHorizontal = position === 'left' || position === 'right';
      const handleStyle: ViewStyle = {
        backgroundColor: theme.mutedForeground,
        opacity: 0.3,
        borderRadius: 2,
        alignSelf: 'center',
        marginVertical: isHorizontal ? 0 : spacing[2],
        marginHorizontal: isHorizontal ? spacing[2] : 0,
        ...(isHorizontal
          ? { width: 4, height: 40 }
          : { width: 40, height: 4 }),
      };
      
      return <View style={handleStyle} />;
    };
    
    if (!visible) return null;
    
    return (
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={handleClose}
        testID={testID}
      >
        <View style={StyleSheet.absoluteFillObject}>
          <TouchableWithoutFeedback
            onPress={closeOnBackdrop ? handleClose : undefined}
            disabled={!closeOnBackdrop}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  opacity: overlayOpacity,
                },
                overlayStyle,
              ]}
            />
          </TouchableWithoutFeedback>
          
          <Animated.View
            ref={ref}
            style={[getDrawerStyle(), getTransformStyle(), style]}
            {...panResponder.panHandlers}
          >
            {(position === 'right' || position === 'bottom') && renderHandle()}
            
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </KeyboardAvoidingView>
            
            {(position === 'left' || position === 'top') && renderHandle()}
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

Drawer.displayName = 'Drawer';

// Helper component for drawer header
export interface DrawerHeaderProps {
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  title,
  onClose,
  children,
  style,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[3],
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        style,
      ]}
    >
      {children || (
        <>
          {title && (
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.foreground }}>
              {title}
            </Text>
          )}
          {onClose && (
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.mutedForeground} />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

// Helper component for drawer content
export interface DrawerContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({ children, style }) => {
  const { spacing } = useSpacing();
  
  return (
    <View style={[{ padding: spacing[4], flex: 1 }, style]}>
      {children}
    </View>
  );
};

// Helper component for drawer footer
export interface DrawerFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({ children, style }) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  
  return (
    <View
      style={[
        {
          padding: spacing[4],
          borderTopWidth: 1,
          borderTopColor: theme.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};