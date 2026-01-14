import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ViewStyle,
  TextStyle,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  defaultValue?: string;
  showInput?: boolean;
  showPresets?: boolean;
  presets?: string[];
  variant?: 'default' | 'compact' | 'popover';
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  style?: ViewStyle;
  testID?: string;
}

const DEFAULT_PRESETS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7',
];

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
};

const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }
  
  return { h, s, v };
};

const hsvToRgb = (h: number, s: number, v: number): { r: number; g: number; b: number } => {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  let r: number, g: number, b: number;
  
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = 0; g = 0; b = 0;
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const ColorPicker = React.forwardRef<View, ColorPickerProps>(
  (
    {
      value,
      onChange,
      defaultValue = '#000000',
      showInput = true,
      showPresets = true,
      presets = DEFAULT_PRESETS,
      variant = 'default',
      disabled = false,
      placeholder = 'Select color',
      label,
      style,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value || defaultValue);
    const [inputValue, setInputValue] = useState(value || defaultValue);
    
    const currentColor = value || internalValue;
    const rgb = hexToRgb(currentColor);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    
    useEffect(() => {
      if (value) {
        setInternalValue(value);
        setInputValue(value);
      }
    }, [value]);
    
    const handleColorChange = useCallback((newColor: string) => {
      setInternalValue(newColor);
      setInputValue(newColor);
      onChange?.(newColor);
    }, [onChange]);
    
    const handleInputChange = useCallback((text: string) => {
      setInputValue(text);
      if (/^#[0-9A-F]{6}$/i.test(text)) {
        handleColorChange(text.toUpperCase());
      }
    }, [handleColorChange]);
    
    const renderColorWheel = () => (
      <View
        style={{
          width: 200,
          height: 200,
          borderRadius: 100,
          overflow: 'hidden',
          marginBottom: spacing[4],
          alignSelf: 'center',
        }}
      >
        {/* Simplified color wheel - in production, use a proper color wheel library */}
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: currentColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            // In a real implementation, this would open a color wheel
            Alert.alert('Color Wheel', 'Full color wheel not implemented in this demo');
          }}
        >
          <Text style={{ color: rgb.r + rgb.g + rgb.b > 380 ? '#000' : '#FFF' }}>
            Tap to change
          </Text>
        </TouchableOpacity>
      </View>
    );
    
    const renderSliders = () => (
      <View style={{ marginBottom: spacing[4] }}>
        <View style={{ marginBottom: spacing[3] }}>
          <Text style={{ color: theme.foreground, marginBottom: spacing[1] }}>
            Red: {rgb.r}
          </Text>
          <View
            style={{
              height: 40,
              backgroundColor: theme.muted,
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${(rgb.r / 255) * 100}%`,
                backgroundColor: `rgb(${rgb.r}, 0, 0)`,
              }}
            />
          </View>
        </View>
        
        <View style={{ marginBottom: spacing[3] }}>
          <Text style={{ color: theme.foreground, marginBottom: spacing[1] }}>
            Green: {rgb.g}
          </Text>
          <View
            style={{
              height: 40,
              backgroundColor: theme.muted,
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${(rgb.g / 255) * 100}%`,
                backgroundColor: `rgb(0, ${rgb.g}, 0)`,
              }}
            />
          </View>
        </View>
        
        <View>
          <Text style={{ color: theme.foreground, marginBottom: spacing[1] }}>
            Blue: {rgb.b}
          </Text>
          <View
            style={{
              height: 40,
              backgroundColor: theme.muted,
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${(rgb.b / 255) * 100}%`,
                backgroundColor: `rgb(0, 0, ${rgb.b})`,
              }}
            />
          </View>
        </View>
      </View>
    );
    
    const renderPresetColors = () => {
      if (!showPresets) return null;
      
      return (
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: theme.mutedForeground,
              marginBottom: spacing[2],
            }}
          >
            Preset Colors
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing[2],
            }}
          >
            {presets.map((preset, index) => (
              <TouchableOpacity
                key={`${preset}-${index}`}
                onPress={() => handleColorChange(preset)}
                disabled={disabled}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: preset,
                  borderWidth: 2,
                  borderColor: currentColor === preset ? theme.foreground : theme.border,
                }}
              />
            ))}
          </View>
        </View>
      );
    };
    
    const renderCompact = () => (
      <TouchableOpacity
        ref={ref as any}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing[2],
            backgroundColor: theme.card,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        testID={testID}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            backgroundColor: currentColor,
            marginRight: spacing[2],
            borderWidth: 1,
            borderColor: theme.border,
          }}
        />
        <Text style={{ color: theme.foreground, flex: 1 }}>{currentColor}</Text>
        <Ionicons name="chevron-down" size={16} color={theme.mutedForeground} />
      </TouchableOpacity>
    );
    
    const renderDefault = () => (
      <View ref={ref} style={style} testID={testID}>
        {label && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: theme.foreground,
              marginBottom: spacing[2],
            }}
          >
            {label}
          </Text>
        )}
        
        <Card p={4}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing[4] }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                backgroundColor: currentColor,
                marginRight: spacing[4],
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />
            
            {showInput && (
              <View style={{ flex: 1 }}>
                <Input
                  value={inputValue}
                  onChangeText={handleInputChange}
                  placeholder="#000000"
                  isDisabled={disabled}
                  style={{ marginBottom: 0 }}
                />
              </View>
            )}
          </View>
          
          {renderSliders()}
          {renderPresetColors()}
        </Card>
      </View>
    );
    
    if (variant === 'compact' || variant === 'popover') {
      return (
        <>
          {renderCompact()}
          <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsOpen(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => setIsOpen(false)}
            >
              <View
                style={{
                  backgroundColor: theme.background,
                  borderRadius: 12,
                  padding: spacing[4],
                  width: '90%',
                  maxWidth: 400,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing[4],
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: theme.foreground,
                    }}
                  >
                    {placeholder}
                  </Text>
                  <TouchableOpacity onPress={() => setIsOpen(false)}>
                    <Ionicons name="close" size={24} color={theme.mutedForeground} />
                  </TouchableOpacity>
                </View>
                
                <View style={{ marginBottom: spacing[4] }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      backgroundColor: currentColor,
                      alignSelf: 'center',
                      marginBottom: spacing[4],
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  />
                  
                  {showInput && (
                    <Input
                      value={inputValue}
                      onChangeText={handleInputChange}
                      placeholder="#000000"
                      isDisabled={disabled}
                    />
                  )}
                </View>
                
                {renderSliders()}
                {renderPresetColors()}
                
                <Button
                  onPress={() => setIsOpen(false)}
                  style={{ marginTop: spacing[4] }}
                >
                  Done
                </Button>
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      );
    }
    
    return renderDefault();
  }
);

ColorPicker.displayName = 'ColorPicker';