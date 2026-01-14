import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box } from './Box';
import { VStack } from './Stack';
import { Text as UniversalText } from './Text';
import { useTheme } from '@/lib/theme/theme-provider';
import { designSystem } from '@/lib/design-system';
import { useSpacing } from '@/contexts/SpacingContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactElement;
  onPress?: () => void;
}

export interface DialogContentProps {
  children: React.ReactNode;
  showCloseButton?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  disableScroll?: boolean;
  isLoading?: boolean;
}

export interface DialogHeaderProps {
  children: React.ReactNode;
}

export interface DialogFooterProps {
  children: React.ReactNode;
}

export interface DialogTitleProps {
  children: React.ReactNode;
}

export interface DialogDescriptionProps {
  children: React.ReactNode;
}

// Dialog Context
const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

const useDialogContext = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
};

// Main Dialog Component
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

// Dialog Trigger
export function DialogTrigger({ asChild, children, onPress }: DialogTriggerProps) {
  const { onOpenChange } = useDialogContext();
  
  const handlePress = () => {
    onPress?.();
    onOpenChange(true);
  };
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onPress: handlePress,
    } as any);
  }
  
  return (
    <Pressable onPress={handlePress}>
      {children}
    </Pressable>
  );
}

// Dialog Portal (for web compatibility)
export function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Dialog Overlay
function DialogOverlay({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Dynamic overlay color based on theme
  const isDark = theme.background === '#000000' || theme.background === '#0a0a0a';
  const overlayColor = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';
  
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: overlayColor,
          opacity: fadeAnim,
        }}
      />
    </TouchableWithoutFeedback>
  );
}

// Dialog Content
export function DialogContent({
  children,
  showCloseButton = true,
  maxWidth = 500,
  maxHeight = screenHeight * 0.8,
  disableScroll = false,
  isLoading = false,
}: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext();
  const theme = useTheme();
  const { spacing } = useSpacing();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);
  
  const ContentWrapper = disableScroll ? View : ScrollView;
  
  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={() => onOpenChange(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <DialogOverlay onPress={() => onOpenChange(false)} />
          
          <Animated.View
            style={{
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
              width: Math.min(screenWidth - spacing[8], maxWidth),
              maxHeight,
              backgroundColor: theme.card,
              borderRadius: designSystem.borderRadius.lg,
              ...designSystem.shadows.lg,
              padding: spacing[6],
              margin: spacing[4],
            }}
          >
            {showCloseButton && (
              <Pressable
                onPress={() => onOpenChange(false)}
                style={({ pressed }) => ({
                  position: 'absolute',
                  right: spacing[4],
                  top: spacing[4],
                  zIndex: 1,
                  padding: spacing[2],
                  opacity: pressed ? 0.7 : 1,
                  ...(Platform.OS === 'web' && {
                    cursor: 'pointer',
                  }),
                })}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={theme.mutedForeground}
                />
              </Pressable>
            )}
            
            <ContentWrapper
              showsVerticalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              {isLoading ? (
                <View style={{ padding: spacing[8], alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <UniversalText
                    size="sm"
                    colorTheme="mutedForeground"
                    style={{ marginTop: spacing[3] }}
                  >
                    Loading...
                  </UniversalText>
                </View>
              ) : (
                children
              )}
            </ContentWrapper>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Dialog Close Button
export function DialogClose({ children }: { children: React.ReactNode }) {
  const { onOpenChange } = useDialogContext();
  
  return (
    <Pressable onPress={() => onOpenChange(false)}>
      {children}
    </Pressable>
  );
}

// Dialog Header
export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <VStack spacing={2} mb={4}>
      {children}
    </VStack>
  );
}

// Dialog Footer
export function DialogFooter({ children }: DialogFooterProps) {
  return (
    <Box
      flexDirection="row"
      justifyContent="flex-end"
      gap={2}
      mt={6}
      style={{
        flexWrap: 'wrap',
      }}
    >
      {children}
    </Box>
  );
}

// Dialog Title
export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <UniversalText
      size="lg"
      weight="semibold"
      colorTheme="foreground"
      style={{
        textAlign: Platform.select({ web: 'left', default: 'center' }),
      }}
    >
      {children}
    </UniversalText>
  );
}

// Dialog Description
export function DialogDescription({ children }: DialogDescriptionProps) {
  return (
    <UniversalText
      size="sm"
      colorTheme="mutedForeground"
      style={{
        textAlign: Platform.select({ web: 'left', default: 'center' }),
      }}
    >
      {children}
    </UniversalText>
  );
}

// Alert Dialog variants (convenience components)
export interface AlertDialogProps extends DialogProps {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
  isLoading?: boolean;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  isLoading = false,
}: AlertDialogProps) {
  const theme = useTheme();
  const { spacing } = useSpacing();
  
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };
  
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent isLoading={isLoading}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Pressable
            onPress={handleCancel}
            style={({ pressed, hovered }: any) => ({
              borderRadius: spacing[2],
              paddingHorizontal: spacing[4],
              paddingVertical: spacing[2],
              backgroundColor: hovered || pressed ? theme.accent : 'transparent',
              ...(Platform.OS === 'web' && {
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }),
            })}
          >
            <UniversalText 
              size="sm" 
              weight="medium"
              colorTheme="foreground"
            >
              {cancelText}
            </UniversalText>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            style={({ pressed, hovered }: any) => ({
              borderRadius: spacing[2],
              paddingHorizontal: spacing[4],
              paddingVertical: spacing[2],
              backgroundColor: destructive 
                ? (hovered ? theme.destructive + 'e6' : theme.destructive) // 90% opacity on hover
                : (hovered ? theme.primary + 'e6' : theme.primary), // 90% opacity on hover
              opacity: pressed ? 0.7 : 1,
              ...(Platform.OS === 'web' && {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }),
            })}
          >
            <UniversalText
              size="sm"
              weight="medium"
              colorTheme={destructive ? 'destructiveForeground' : 'primaryForeground'}
            >
              {confirmText}
            </UniversalText>
          </Pressable>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}