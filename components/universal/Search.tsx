import React, { useState, useCallback, useRef, useEffect, useMemo, useDeferredValue, useTransition } from 'react';
import {
  View,
  TextInput,
  Pressable,
  FlatList,
  ViewStyle,
  TextStyle,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { Text } from './Text';
import { Input } from './Input';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Ionicons } from '@expo/vector-icons';

export interface SearchSuggestion {
  id: string;
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  category?: string;
}

export interface SearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  showClearButton?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  loading?: boolean;
  debounceDelay?: number;
  minSearchLength?: number;
  maxSuggestions?: number;
  variant?: 'default' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  suggestionStyle?: ViewStyle;
  testID?: string;
}

// Memoized suggestion item component
const SuggestionItem = React.memo(({ 
  item, 
  onPress, 
  theme, 
  spacing, 
  iconSize 
}: { 
  item: SearchSuggestion;
  onPress: (item: SearchSuggestion) => void;
  theme: any;
  spacing: Record<number, number>;
  iconSize: number;
}) => (
  <Pressable
    onPress={() => onPress(item)}
    style={({ pressed }) => ({
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[3],
      backgroundColor: pressed ? theme.accent : 'transparent',
    })}
  >
    {item.icon && (
      <Ionicons
        name={item.icon}
        size={iconSize}
        color={theme.mutedForeground}
        style={{ marginRight: spacing[2] }}
      />
    )}
    <View style={{ flex: 1 }}>
      <Text size="md" colorTheme="foreground">
        {item.label}
      </Text>
      {item.category && (
        <Text size="xs" colorTheme="mutedForeground">
          {item.category}
        </Text>
      )}
    </View>
  </Pressable>
));

SuggestionItem.displayName = 'SuggestionItem';

export const Search = React.forwardRef<TextInput, SearchProps>(
  (
    {
      value,
      onValueChange,
      onSearch,
      placeholder = 'Search...',
      suggestions = [],
      recentSearches = [],
      onClearRecent,
      showClearButton = true,
      autoFocus = false,
      disabled = false,
      loading = false,
      debounceDelay = 300,
      minSearchLength = 1,
      maxSuggestions = 10,
      variant = 'default',
      size = 'md',
      style,
      inputStyle,
      suggestionStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isPending, startTransition] = useTransition();
    const debounceTimeout = useRef<NodeJS.Timeout>();
    
    // Defer value for better search performance
    const deferredValue = useDeferredValue(value);


    // Memoize size config
    const sizeConfig = useMemo(() => ({
      sm: {
        height: 36,
        fontSize: 14,
        iconSize: 18,
        padding: 2,
      },
      md: {
        height: 44,
        fontSize: 16,
        iconSize: 20,
        padding: 3,
      },
      lg: {
        height: 52,
        fontSize: 18,
        iconSize: 24,
        padding: 4,
      },
    }[size]), [size]);

    // Debounced value change with transition
    const handleValueChange = useCallback(
      (text: string) => {
        startTransition(() => {
          onValueChange(text);
        });

        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }

        if (text.length >= minSearchLength) {
          debounceTimeout.current = setTimeout(() => {
            setShowSuggestions(true);
          }, debounceDelay);
        } else {
          setShowSuggestions(false);
        }
      },
      [onValueChange, minSearchLength, debounceDelay]
    );

    // Clean up timeout on unmount
    useEffect(() => {
      return () => {
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
      };
    }, []);

    const handleSubmit = () => {
      onSearch?.(value);
      setShowSuggestions(false);
      Keyboard.dismiss();
    };

    const handleSuggestionPress = (suggestion: SearchSuggestion) => {
      onValueChange(suggestion.value);
      onSearch?.(suggestion.value);
      setShowSuggestions(false);
      Keyboard.dismiss();
    };

    const handleClear = () => {
      onValueChange('');
      setShowSuggestions(false);
    };

    const variantStyles = {
      default: {
        container: {
          borderWidth: 1,
          borderColor: theme.input,
          backgroundColor: theme.background,
        },
      },
      filled: {
        container: {
          backgroundColor: theme.muted,
          borderWidth: 0,
        },
      },
      minimal: {
        container: {
          borderBottomWidth: 1,
          borderColor: theme.input,
          backgroundColor: 'transparent',
        },
      },
    }[variant];

    const containerStyle: ViewStyle = {
      height: sizeConfig.height,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: variant === 'minimal' ? 0 : 8,
      paddingHorizontal: spacing[sizeConfig.padding],
      opacity: disabled ? 0.5 : 1,
      ...variantStyles.container,
      ...(isFocused && { borderColor: theme.ring }),
      ...style,
    };

    const inputFieldStyle: TextStyle = {
      flex: 1,
      fontSize: sizeConfig.fontSize,
      color: theme.foreground,
      paddingVertical: 0,
      ...inputStyle,
    };

    const suggestionContainerStyle: ViewStyle = {
      position: 'absolute',
      top: sizeConfig.height + spacing[1],
      left: 0,
      right: 0,
      maxHeight: 300,
      backgroundColor: theme.popover || theme.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      elevation: 5,
      zIndex: 1000,
      ...suggestionStyle,
    };

    // Memoize renderSuggestion for better performance
    const renderSuggestion = useCallback(({ item }: { item: SearchSuggestion }) => (
      <SuggestionItem
        item={item}
        onPress={handleSuggestionPress}
        theme={theme}
        spacing={spacing}
        iconSize={sizeConfig.iconSize}
      />
    ), [handleSuggestionPress, theme, spacing, sizeConfig.iconSize]);

    // Memoize filtered suggestions using deferred value
    const filteredSuggestions = useMemo(() => {
      // Use deferred value for filtering to prevent blocking UI
      const searchLower = deferredValue.toLowerCase();
      if (!searchLower || searchLower.length < minSearchLength) {
        return [];
      }
      
      return suggestions
        .filter(suggestion => 
          suggestion.label.toLowerCase().includes(searchLower) ||
          suggestion.value.toLowerCase().includes(searchLower) ||
          (suggestion.category && suggestion.category.toLowerCase().includes(searchLower))
        )
        .slice(0, maxSuggestions);
    }, [deferredValue, suggestions, maxSuggestions, minSearchLength]);

    const showSuggestionsList = useMemo(() =>
      showSuggestions &&
      isFocused &&
      deferredValue.length >= minSearchLength &&
      (filteredSuggestions.length > 0 || recentSearches.length > 0),
    [showSuggestions, isFocused, deferredValue, minSearchLength, filteredSuggestions.length, recentSearches.length]);

    return (
      <View style={{ position: 'relative' }}>
        <View style={containerStyle}>
          <Ionicons
            name="search"
            size={sizeConfig.iconSize}
            color={theme.mutedForeground}
            style={{ marginRight: spacing[2] }}
          />

          <TextInput
            ref={ref}
            value={value}
            onChangeText={handleValueChange}
            onSubmitEditing={handleSubmit}
            placeholder={placeholder}
            placeholderTextColor={theme.mutedForeground}
            editable={!disabled}
            autoFocus={autoFocus}
            returnKeyType="search"
            style={[inputFieldStyle, isPending && { opacity: 0.7 }]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            testID={testID}
          />

          {loading && (
            <View style={{ marginLeft: spacing[2] }}>
              <Ionicons
                name="reload"
                size={sizeConfig.iconSize}
                color={theme.mutedForeground}
              />
            </View>
          )}

          {showClearButton && value.length > 0 && (
            <Pressable
              onPress={handleClear}
              style={{ marginLeft: spacing[2] }}
            >
              <Ionicons
                name="close-circle"
                size={sizeConfig.iconSize}
                color={theme.mutedForeground}
              />
            </Pressable>
          )}
        </View>

        {showSuggestionsList && (
          <View style={suggestionContainerStyle}>
            {recentSearches.length > 0 && filteredSuggestions.length === 0 && (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[2],
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                >
                  <Text size="sm" weight="medium" colorTheme="mutedForeground">
                    Recent Searches
                  </Text>
                  {onClearRecent && (
                    <Pressable onPress={onClearRecent}>
                      <Text size="sm" colorTheme="primary">
                        Clear
                      </Text>
                    </Pressable>
                  )}
                </View>
                <FlatList
                  data={recentSearches.map((search, index) => ({
                    id: `recent-${index}`,
                    label: search,
                    value: search,
                    icon: 'time-outline' as const,
                  }))}
                  renderItem={renderSuggestion}
                  keyExtractor={(item) => item.id}
                />
              </>
            )}

            {filteredSuggestions.length > 0 && (
              <FlatList
                data={filteredSuggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.border,
                    }}
                  />
                )}
              />
            )}
          </View>
        )}
      </View>
    );
  }
);

Search.displayName = 'Search';

// Search with Modal (for mobile)
export interface SearchModalProps extends Omit<SearchProps, 'autoFocus'> {
  visible: boolean;
  onClose: () => void;
  headerTitle?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  headerTitle = 'Search',
  ...searchProps
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: theme.background }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing[4],
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <Pressable onPress={onClose} style={{ marginRight: spacing[3] }}>
            <Ionicons name="arrow-back" size={24} color={theme.foreground} />
          </Pressable>
          <Text size="lg" weight="semibold" style={{ flex: 1 }}>
            {headerTitle}
          </Text>
        </View>

        <View style={{ padding: spacing[4] }}>
          <Search {...searchProps} autoFocus />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};