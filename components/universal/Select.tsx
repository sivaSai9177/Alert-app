import React from 'react';
import {
  View,
  Modal,
  Pressable,
  ViewStyle,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { Text } from './Text';
import { Box } from './Box';
import { Ionicons } from '@expo/vector-icons';
import { useSpacing } from '@/contexts/SpacingContext';
import { SpacingScale } from '@/lib/design-system';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled';
  style?: ViewStyle;
  dropdownStyle?: ViewStyle;
  searchable?: boolean;
  maxHeight?: number;
  isLoading?: boolean;
}

export const Select = React.forwardRef<View, SelectProps>(({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  size = 'md',
  variant = 'outline',
  style,
  dropdownStyle,
  searchable = false,
  maxHeight = 300,
  isLoading = false,
}, ref) => {
  const theme = useTheme();
  const { spacing, componentSizes, componentSpacing } = useSpacing();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isHovered, setIsHovered] = React.useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  // Size configuration
  const sizeConfig = {
    sm: {
      height: componentSizes.input.sm.height,
      paddingH: 3 as SpacingScale,
      fontSize: 'sm' as const,
      iconSize: componentSpacing.iconSize.sm,
    },
    md: {
      height: componentSizes.input.md.height,
      paddingH: 4 as SpacingScale,
      fontSize: 'md' as const,
      iconSize: componentSpacing.iconSize.md,
    },
    lg: {
      height: componentSizes.input.lg.height,
      paddingH: 4 as SpacingScale,
      fontSize: 'lg' as const,
      iconSize: componentSpacing.iconSize.lg,
    },
  };

  const config = sizeConfig[size];

  // Filter options based on search
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Theme-aware colors
  const getColors = () => {
    if (disabled) {
      return {
        background: theme.muted,
        border: theme.border,
        text: theme.mutedForeground,
        placeholder: theme.mutedForeground,
        icon: theme.mutedForeground,
      };
    }

    if (error) {
      return {
        background: variant === 'filled' ? theme.muted : theme.background,
        border: theme.destructive,
        text: theme.foreground,
        placeholder: theme.mutedForeground,
        icon: theme.destructive,
      };
    }

    return {
      background: variant === 'filled' ? theme.muted : theme.background,
      border: isHovered ? theme.ring : theme.border,
      text: theme.foreground,
      placeholder: theme.mutedForeground,
      icon: theme.mutedForeground,
    };
  };

  const colors = getColors();

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onValueChange?.(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const webHandlers = Platform.OS === 'web' && !disabled ? {
    onHoverIn: () => setIsHovered(true),
    onHoverOut: () => setIsHovered(false),
  } : {};

  return (
    <View ref={ref} style={style}>
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        {...webHandlers}
        style={({ pressed }) => ({
          height: config.height,
          paddingHorizontal: spacing[config.paddingH],
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 6,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: disabled ? 0.6 : 1,
          ...(Platform.OS === 'web' && {
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.2s ease',
          } as any),
        })}
      >
        <Text
          size={config.fontSize}
          style={{
            color: selectedOption ? colors.text : colors.placeholder,
            flex: 1,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={config.iconSize}
          color={colors.icon}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: theme.background === '#000000' || theme.background === '#0a0a0a' 
              ? 'rgba(0, 0, 0, 0.7)' 
              : 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            setIsOpen(false);
            setSearchQuery('');
          }}
        >
          <Pressable
            style={[
              {
                backgroundColor: theme.background,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.border,
                width: '90%',
                maxWidth: 400,
                maxHeight,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
                elevation: 5,
              },
              dropdownStyle,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <Box p={4 as SpacingScale} alignItems="center">
                <ActivityIndicator size="small" color={theme.primary} />
                <Text colorTheme="mutedForeground" size="sm" mt={2}>
                  Loading options...
                </Text>
              </Box>
            ) : searchable ? (
              <Box p={3 as SpacingScale} borderBottomWidth={1} borderColor={theme.border}>
                <Input
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search..."
                  size={size}
                  autoFocus
                />
              </Box>
            ) : null}

            {!isLoading && (
              <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  disabled={item.disabled}
                  style={({ pressed }) => ({
                    paddingHorizontal: spacing[4],
                    paddingVertical: spacing[3],
                    backgroundColor: pressed && !item.disabled
                      ? theme.accent
                      : item.value === value
                        ? theme.accent
                        : 'transparent',
                    opacity: item.disabled ? 0.5 : 1,
                  })}
                >
                  <Text
                    size={config.fontSize}
                    weight={item.value === value ? 'medium' : 'normal'}
                    style={{
                      color: item.value === value
                        ? theme.accentForeground
                        : theme.foreground,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Box p={4 as SpacingScale} alignItems="center">
                  <Text colorTheme="mutedForeground" size="sm">
                    No options found
                  </Text>
                </Box>
              }
            />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
});

Select.displayName = 'Select';

// Import Input for searchable select
import { Input } from './Input';