import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  ViewStyle,
  TextStyle,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Card } from './Card';

export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: string;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

export interface ContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  style?: ViewStyle;
  menuStyle?: ViewStyle;
  testID?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ContextMenu = React.forwardRef<View, ContextMenuProps>(
  (
    {
      children,
      items,
      disabled = false,
      onOpen,
      onClose,
      style,
      menuStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
    const triggerRef = useRef<View>(null);

    const handleLongPress = useCallback(() => {
      if (disabled) return;

      triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
        // Calculate menu position
        let menuX = pageX;
        let menuY = pageY + height + spacing[2];

        // Adjust if menu would go off screen
        const menuWidth = 200;
        const menuHeight = items.length * 48 + spacing[2] * 2;

        if (menuX + menuWidth > SCREEN_WIDTH) {
          menuX = SCREEN_WIDTH - menuWidth - spacing[2];
        }

        if (menuY + menuHeight > SCREEN_HEIGHT) {
          menuY = pageY - menuHeight - spacing[2];
        }

        setMenuPosition({ x: menuX, y: menuY });
        setIsOpen(true);
        onOpen?.();
      });
    }, [disabled, items.length, spacing, onOpen]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
      setSubmenuOpen(null);
      onClose?.();
    }, [onClose]);

    const handleItemSelect = useCallback((item: ContextMenuItem) => {
      if (item.disabled || item.separator) return;
      
      if (item.submenu) {
        setSubmenuOpen(item.key);
      } else {
        item.onSelect();
        handleClose();
      }
    }, [handleClose]);

    const renderMenuItem = (item: ContextMenuItem, index: number) => {
      if (item.separator) {
        return (
          <View
            key={`${item.key}-${index}`}
            style={{
              height: 1,
              backgroundColor: theme.border,
              marginVertical: spacing[1],
            }}
          />
        );
      }

      const isSubmenuOpen = submenuOpen === item.key;
      const hasSubmenu = item.submenu && item.submenu.length > 0;

      return (
        <TouchableOpacity
          key={`${item.key}-${index}`}
          onPress={() => handleItemSelect(item)}
          disabled={item.disabled}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            opacity: item.disabled ? 0.5 : 1,
            backgroundColor: isSubmenuOpen ? theme.accent : 'transparent',
          }}
        >
          {item.icon && (
            <Ionicons
              name={item.icon as any}
              size={18}
              color={
                item.destructive
                  ? theme.destructive
                  : item.disabled
                  ? theme.mutedForeground
                  : theme.foreground
              }
              style={{ marginRight: spacing[3] }}
            />
          )}
          
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              color: item.destructive
                ? theme.destructive
                : item.disabled
                ? theme.mutedForeground
                : theme.foreground,
            }}
          >
            {item.label}
          </Text>
          
          {hasSubmenu && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.mutedForeground}
              style={{ marginLeft: spacing[2] }}
            />
          )}
        </TouchableOpacity>
      );
    };

    const renderSubmenu = () => {
      const parentItem = items.find(item => item.key === submenuOpen);
      if (!parentItem || !parentItem.submenu) return null;

      return (
        <Card
          style={[
            {
              position: 'absolute',
              left: 200 + spacing[2],
              top: 0,
              minWidth: 180,
              maxHeight: SCREEN_HEIGHT * 0.8,
            },
            menuStyle,
          ]}
          p={1}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {parentItem.submenu.map((item, index) => renderMenuItem(item, index))}
          </ScrollView>
        </Card>
      );
    };

    // Platform-specific trigger
    const triggerProps = Platform.select({
      ios: {
        onLongPress: handleLongPress,
        delayLongPress: 500,
      },
      android: {
        onLongPress: handleLongPress,
        delayLongPress: 500,
      },
      default: {
        onPress: (e: any) => {
          if (Platform.OS === 'web' && e.button === 2) {
            e.preventDefault();
            handleLongPress();
          }
        },
        onContextMenu: (e: any) => {
          e.preventDefault();
          handleLongPress();
          return false;
        },
      },
    });

    return (
      <>
        <Pressable
          ref={ref}
          style={style}
          disabled={disabled}
          {...triggerProps}
          testID={testID}
        >
          <View ref={triggerRef}>
            {children}
          </View>
        </Pressable>

        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={handleClose}
        >
          <TouchableOpacity
            style={{
              flex: 1,
            }}
            onPress={handleClose}
            activeOpacity={1}
          >
            <View
              style={{
                position: 'absolute',
                left: menuPosition.x,
                top: menuPosition.y,
              }}
            >
              <Card
                style={[
                  {
                    minWidth: 200,
                    maxHeight: SCREEN_HEIGHT * 0.8,
                    ...Platform.select({
                      ios: {
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                      },
                      android: {
                        elevation: 8,
                      },
                      default: {
                        boxShadow: `0 4px 12px ${theme.foreground}30`,
                      },
                    }),
                  },
                  menuStyle,
                ]}
                p={1}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  {items.map((item, index) => renderMenuItem(item, index))}
                </ScrollView>
              </Card>
              {renderSubmenu()}
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }
);

ContextMenu.displayName = 'ContextMenu';

// Context Menu Provider for global menu
export interface ContextMenuProviderProps {
  children: React.ReactNode;
}

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({ children }) => {
  // This could be extended to provide global context menu functionality
  return <>{children}</>;
};

// Helper component for menu items with common patterns
export interface QuickContextMenuProps {
  children: React.ReactNode;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  customItems?: ContextMenuItem[];
  disabled?: boolean;
  style?: ViewStyle;
}

export const QuickContextMenu: React.FC<QuickContextMenuProps> = ({
  children,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onSelectAll,
  customItems = [],
  disabled,
  style,
}) => {
  const items: ContextMenuItem[] = [];

  if (onCut) {
    items.push({
      key: 'cut',
      label: 'Cut',
      icon: 'cut',
      onSelect: onCut,
    });
  }

  if (onCopy) {
    items.push({
      key: 'copy',
      label: 'Copy',
      icon: 'copy',
      onSelect: onCopy,
    });
  }

  if (onPaste) {
    items.push({
      key: 'paste',
      label: 'Paste',
      icon: 'clipboard',
      onSelect: onPaste,
    });
  }

  if (onSelectAll) {
    items.push({
      key: 'select-all',
      label: 'Select All',
      icon: 'checkbox-outline',
      onSelect: onSelectAll,
    });
  }

  if (items.length > 0 && (customItems.length > 0 || onDelete)) {
    items.push({
      key: 'separator-1',
      label: '',
      separator: true,
      onSelect: () => {},
    });
  }

  items.push(...customItems);

  if (onDelete) {
    if (customItems.length > 0) {
      items.push({
        key: 'separator-2',
        label: '',
        separator: true,
        onSelect: () => {},
      });
    }
    items.push({
      key: 'delete',
      label: 'Delete',
      icon: 'trash',
      destructive: true,
      onSelect: onDelete,
    });
  }

  return (
    <ContextMenu items={items} disabled={disabled} style={style}>
      {children}
    </ContextMenu>
  );
};