import React, { useState, useCallback, useEffect, useMemo, useRef, useDeferredValue, useTransition } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  TextStyle,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Card } from './Card';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  category?: string;
  keywords?: string[];
  shortcut?: string;
  onSelect: () => void;
  disabled?: boolean;
}

export interface CommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
  showCategories?: boolean;
  maxHeight?: number;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  testID?: string;
}

const fuzzySearch = (query: string, text: string, keywords?: string[]): boolean => {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  
  // Direct match
  if (lowerText.includes(lowerQuery)) return true;
  
  // Keywords match
  if (keywords?.some(keyword => keyword.toLowerCase().includes(lowerQuery))) return true;
  
  // Fuzzy match - check if all query characters appear in order
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  
  return queryIndex === lowerQuery.length;
};

export const Command = React.memo(React.forwardRef<View, CommandProps>(
  (
    {
      open,
      onOpenChange,
      items,
      placeholder = 'Type a command or search...',
      emptyMessage = 'No results found',
      showCategories = true,
      maxHeight = 400,
      style,
      inputStyle,
      itemStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isPending, startTransition] = useTransition();
    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);
    
    // Use deferred value for better search performance
    const deferredSearchQuery = useDeferredValue(searchQuery);

    // Filter and group items with deferred value
    const filteredItems = useMemo(() => {
      if (!deferredSearchQuery) return items;
      
      return items.filter(item =>
        fuzzySearch(deferredSearchQuery, item.label, item.keywords)
      );
    }, [items, deferredSearchQuery]);

    const groupedItems = useMemo(() => {
      if (!showCategories) return { '': filteredItems };
      
      return filteredItems.reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {} as Record<string, CommandItem[]>);
    }, [filteredItems, showCategories]);

    const flattenedItems = useMemo(() => {
      const flattened: (CommandItem | { isCategory: true; title: string })[] = [];
      
      Object.entries(groupedItems).forEach(([category, categoryItems]) => {
        if (showCategories && category) {
          flattened.push({ isCategory: true, title: category });
        }
        flattened.push(...categoryItems);
      });
      
      return flattened;
    }, [groupedItems, showCategories]);

    // Reset when opened
    useEffect(() => {
      if (open) {
        setSearchQuery('');
        setSelectedIndex(0);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }, [open]);

    // Keyboard navigation
    useEffect(() => {
      if (!open || Platform.OS !== 'web') return;
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => {
            const selectableItems = flattenedItems.filter(item => !('isCategory' in item));
            const currentSelectableIndex = selectableItems.findIndex(
              (_, idx) => idx === prev
            );
            return Math.min(currentSelectableIndex + 1, selectableItems.length - 1);
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const selectableItems = flattenedItems.filter(item => !('isCategory' in item)) as CommandItem[];
          const selectedItem = selectableItems[selectedIndex];
          if (selectedItem && !selectedItem.disabled) {
            handleItemSelect(selectedItem);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onOpenChange(false);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, flattenedItems, selectedIndex, onOpenChange]);

    const handleItemSelect = useCallback((item: CommandItem) => {
      if (item.disabled) return;
      startTransition(() => {
        item.onSelect();
        onOpenChange(false);
      });
    }, [onOpenChange]);

    // Memoize renderItem for better performance
    const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
      if ('isCategory' in item) {
        return (
          <View
            style={{
              paddingHorizontal: spacing[4],
              paddingVertical: spacing[2],
              backgroundColor: theme.muted,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: theme.mutedForeground,
                textTransform: 'uppercase',
              }}
            >
              {item.title}
            </Text>
          </View>
        );
      }

      const isSelected = index === selectedIndex;
      
      return (
        <TouchableOpacity
          onPress={() => handleItemSelect(item)}
          disabled={item.disabled}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing[4],
              paddingVertical: spacing[3],
              backgroundColor: isSelected ? theme.accent : 'transparent',
              opacity: item.disabled ? 0.5 : 1,
            },
            itemStyle,
          ]}
        >
          {item.icon && (
            <Ionicons
              name={item.icon as any}
              size={20}
              color={item.disabled ? theme.mutedForeground : theme.foreground}
              style={{ marginRight: spacing[3] }}
            />
          )}
          
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: item.disabled ? theme.mutedForeground : theme.foreground,
              }}
            >
              {item.label}
            </Text>
            {item.description && (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.mutedForeground,
                  marginTop: spacing[0.5],
                }}
              >
                {item.description}
              </Text>
            )}
          </View>
          
          {item.shortcut && Platform.OS === 'web' && (
            <View
              style={{
                flexDirection: 'row',
                marginLeft: spacing[3],
              }}
            >
              {item.shortcut.split('+').map((key, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: theme.muted,
                    paddingHorizontal: spacing[1.5],
                    paddingVertical: spacing[0.5],
                    borderRadius: 4,
                    marginLeft: idx > 0 ? spacing[1] : 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: theme.mutedForeground,
                      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                    }}
                  >
                    {key}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      );
    }, [selectedIndex, handleItemSelect, theme, spacing, itemStyle]);

    if (!open) return null;

    return (
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => onOpenChange(false)}
        testID={testID}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-start',
            paddingTop: Platform.OS === 'ios' ? 100 : 50,
          }}
          onPress={() => onOpenChange(false)}
          activeOpacity={1}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <TouchableOpacity activeOpacity={1}>
              <Card
                ref={ref}
                style={[
                  {
                    marginHorizontal: spacing[4],
                    maxHeight,
                    overflow: 'hidden',
                  },
                  style,
                ]}
              >
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: spacing[4],
                      paddingVertical: spacing[3],
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                    },
                    inputStyle,
                  ]}
                >
                  <Ionicons
                    name="search"
                    size={20}
                    color={theme.mutedForeground}
                    style={{ marginRight: spacing[3] }}
                  />
                  <TextInput
                    ref={inputRef}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={placeholder}
                    placeholderTextColor={theme.mutedForeground}
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: theme.foreground,
                      opacity: isPending ? 0.7 : 1,
                    }}
                    autoFocus
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      style={{ marginLeft: spacing[2] }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={theme.mutedForeground}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                
                <FlatList
                  ref={flatListRef}
                  data={flattenedItems}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => 
                    'isCategory' in item ? `category-${item.title}` : item.id
                  }
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View
                      style={{
                        padding: spacing[8],
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.mutedForeground,
                        }}
                      >
                        {emptyMessage}
                      </Text>
                    </View>
                  }
                />
              </Card>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    );
  }
));

Command.displayName = 'Command';

// Command trigger button helper
export interface CommandTriggerProps {
  onPress: () => void;
  shortcut?: string;
  label?: string;
  style?: ViewStyle;
  testID?: string;
}

export const CommandTrigger: React.FC<CommandTriggerProps> = ({
  onPress,
  shortcut = '⌘K',
  label = 'Search commands...',
  style,
  testID,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[2],
          backgroundColor: theme.muted,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.border,
        },
        style,
      ]}
      testID={testID}
    >
      <Ionicons
        name="search"
        size={16}
        color={theme.mutedForeground}
        style={{ marginRight: spacing[2] }}
      />
      <Text
        style={{
          flex: 1,
          fontSize: 14,
          color: theme.mutedForeground,
        }}
      >
        {label}
      </Text>
      {Platform.OS === 'web' && (
        <View
          style={{
            backgroundColor: theme.background,
            paddingHorizontal: spacing[2],
            paddingVertical: spacing[1],
            borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: theme.mutedForeground,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            }}
          >
            {shortcut}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};