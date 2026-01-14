import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  Modal,
  Platform,
  LayoutChangeEvent,
  ScaledSize,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/lib/theme/enhanced-theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { designSystem } from '@/lib/design-system';
import { Text } from './Text';

export interface TooltipProps {
  // Content
  children: React.ReactNode;
  content: string | React.ReactNode;
  
  // Positioning
  position?: 'top' | 'bottom' | 'left' | 'right';
  side?: 'top' | 'bottom' | 'left' | 'right'; // Alias for position
  align?: 'start' | 'center' | 'end';
  offset?: number;
  
  // Behavior
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
  disabled?: boolean;
  
  // Styling
  sideOffset?: number;
  maxWidth?: number;
}

interface TooltipPosition {
  top: number;
  left: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  side,
  align = 'center',
  offset = 8,
  delayDuration = 700,
  skipDelayDuration = 300,
  disableHoverableContent = false,
  disabled = false,
  sideOffset = 0,
  maxWidth = 250,
}) => {
  const theme = useTheme();
  const { spacing, componentSpacing } = useSpacing();
  const [visible, setVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });
  const triggerRef = useRef<View>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const skipDelayRef = useRef(false);
  
  // Web-specific hover handling
  const isWeb = Platform.OS === 'web';
  
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    
    triggerRef.current.measure((x, y, width, height, pageX, pageY) => {
      const screen: ScaledSize = Dimensions.get('window');
      let top = 0;
      let left = 0;
      
      // Use side prop if provided, otherwise fall back to position
      const placement = side || position;
      
      // Calculate position based on placement
      switch (placement) {
        case 'top':
          top = pageY - tooltipSize.height - offset - sideOffset;
          break;
        case 'bottom':
          top = pageY + height + offset + sideOffset;
          break;
        case 'left':
          left = pageX - tooltipSize.width - offset - sideOffset;
          top = pageY + (height - tooltipSize.height) / 2;
          break;
        case 'right':
          left = pageX + width + offset + sideOffset;
          top = pageY + (height - tooltipSize.height) / 2;
          break;
      }
      
      // Calculate horizontal position for top/bottom
      if (position === 'top' || position === 'bottom') {
        switch (align) {
          case 'start':
            left = pageX;
            break;
          case 'center':
            left = pageX + (width - tooltipSize.width) / 2;
            break;
          case 'end':
            left = pageX + width - tooltipSize.width;
            break;
        }
      }
      
      // Ensure tooltip stays within screen bounds
      left = Math.max(8, Math.min(left, screen.width - tooltipSize.width - 8));
      top = Math.max(8, Math.min(top, screen.height - tooltipSize.height - 8));
      
      setTooltipPosition({ top, left });
    });
  }, [position, align, offset, sideOffset, tooltipSize]);
  
  const showTooltip = useCallback(() => {
    if (disabled) return;
    
    const delay = skipDelayRef.current ? skipDelayDuration : delayDuration;
    
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      skipDelayRef.current = true;
      
      // Reset skip delay after a period of inactivity
      setTimeout(() => {
        skipDelayRef.current = false;
      }, 1500);
    }, delay);
  }, [disabled, delayDuration, skipDelayDuration]);
  
  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  }, []);
  
  const onTooltipLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setTooltipSize({ width, height });
  }, []);
  
  // Update position when tooltip size changes
  React.useEffect(() => {
    if (visible && tooltipSize.width > 0 && tooltipSize.height > 0) {
      calculatePosition();
    }
  }, [visible, tooltipSize, calculatePosition]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const renderContent = () => {
    if (typeof content === 'string') {
      return (
        <Text
          size="sm"
          colorTheme="foreground"
          style={{ color: theme.popoverForeground }}
        >
          {content}
        </Text>
      );
    }
    return content;
  };
  
  return (
    <>
      <Pressable
        ref={triggerRef}
        onPressIn={isWeb ? undefined : showTooltip}
        onPressOut={isWeb ? undefined : hideTooltip}
        onHoverIn={isWeb ? showTooltip : undefined}
        onHoverOut={isWeb ? hideTooltip : undefined}
      >
        {children}
      </Pressable>
      
      {visible && (
        <Modal
          transparent
          visible={visible}
          animationType="fade"
          statusBarTranslucent
          pointerEvents="none"
        >
          <View
            style={{
              position: 'absolute',
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              maxWidth,
              backgroundColor: theme.popover,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: componentSpacing.borderRadius.md,
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
              elevation: 5,
            }}
            onLayout={onTooltipLayout}
          >
            {renderContent()}
          </View>
        </Modal>
      )}
    </>
  );
};

// Convenience components for common use cases
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In the future, this could provide shared context for tooltip delays
  return <>{children}</>;
};

export const TooltipTrigger = Pressable;
export const TooltipContent = View;