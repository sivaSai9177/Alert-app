import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  ViewStyle,
  TextStyle,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Card } from './Card';
import { Button } from './Button';

export interface FileItem {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  type?: 'image' | 'document' | 'video' | 'audio' | 'other';
}

export interface FilePickerProps {
  value?: FileItem[];
  onChange?: (files: FileItem[]) => void;
  accept?: string | string[];
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  showPreview?: boolean;
  variant?: 'default' | 'dropzone' | 'button';
  disabled?: boolean;
  placeholder?: string;
  style?: ViewStyle;
  previewStyle?: ViewStyle;
  testID?: string;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown size';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const getFileIcon = (type?: string): string => {
  switch (type) {
    case 'image':
      return 'image';
    case 'document':
      return 'document-text';
    case 'video':
      return 'videocam';
    case 'audio':
      return 'musical-notes';
    default:
      return 'document';
  }
};

export const FilePicker = React.forwardRef<View, FilePickerProps>(
  (
    {
      value = [],
      onChange,
      accept,
      multiple = false,
      maxFiles = 10,
      maxSize,
      showPreview = true,
      variant = 'default',
      disabled = false,
      placeholder = 'Select files',
      style,
      previewStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
      // Simplified implementation - in a real app, you would install and use expo-image-picker
      Alert.alert(
        'File Picker',
        'To enable file picking, install expo-image-picker:\n\nbun add expo-image-picker',
        [{ text: 'OK' }]
      );
      
      // Demo file for testing
      const demoFile: FileItem = {
        uri: 'https://via.placeholder.com/150',
        name: 'demo-image.jpg',
        type: 'image',
        size: 1024 * 50, // 50KB
      };
      
      handleFilesSelected([demoFile]);
    };

    const pickDocument = async () => {
      // Simplified implementation - in a real app, you would install and use expo-document-picker
      Alert.alert(
        'Document Picker',
        'To enable document picking, install expo-document-picker:\n\nbun add expo-document-picker',
        [{ text: 'OK' }]
      );
      
      // Demo file for testing
      const demoFile: FileItem = {
        uri: 'demo://document.pdf',
        name: 'demo-document.pdf',
        type: 'document',
        size: 1024 * 100, // 100KB
      };
      
      handleFilesSelected([demoFile]);
    };

    const handleFilesSelected = (newFiles: FileItem[]) => {
      if (disabled) return;

      // Check file size
      if (maxSize) {
        const oversizedFiles = newFiles.filter(file => file.size && file.size > maxSize);
        if (oversizedFiles.length > 0) {
          Alert.alert('File too large', `Maximum file size is ${formatFileSize(maxSize)}`);
          return;
        }
      }

      let updatedFiles: FileItem[];
      if (multiple) {
        updatedFiles = [...value, ...newFiles].slice(0, maxFiles);
      } else {
        updatedFiles = newFiles.slice(0, 1);
      }

      onChange?.(updatedFiles);
    };

    const removeFile = (index: number) => {
      const updatedFiles = value.filter((_, i) => i !== index);
      onChange?.(updatedFiles);
    };

    const renderDropzone = () => (
      <TouchableOpacity
        onPress={pickDocument}
        disabled={disabled || loading}
        style={[
          {
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: disabled ? theme.mutedForeground : theme.border,
            borderRadius: 8,
            padding: spacing[8],
            alignItems: 'center',
            backgroundColor: disabled ? theme.muted : theme.card,
            opacity: loading ? 0.7 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <>
            <Ionicons
              name="cloud-upload"
              size={48}
              color={disabled ? theme.mutedForeground : theme.primary}
            />
            <Text
              style={{
                marginTop: spacing[3],
                fontSize: 16,
                fontWeight: '500',
                color: disabled ? theme.mutedForeground : theme.foreground,
              }}
            >
              {placeholder}
            </Text>
            <Text
              style={{
                marginTop: spacing[1],
                fontSize: 14,
                color: theme.mutedForeground,
                textAlign: 'center',
              }}
            >
              {multiple ? `Select up to ${maxFiles} files` : 'Select a file'}
              {maxSize && ` • Max ${formatFileSize(maxSize)}`}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );

    const renderButton = () => (
      <View style={style}>
        <Button
          onPress={pickDocument}
          disabled={disabled || loading}
          variant="outline"
          leftIcon={<Ionicons name="attach" size={20} />}
          isLoading={loading}
        >
          {placeholder}
        </Button>
      </View>
    );

    const renderDefault = () => (
      <View style={style}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing[2],
          }}
        >
          <Button
            onPress={pickImage}
            disabled={disabled || loading}
            variant="outline"
            size="sm"
            leftIcon={<Ionicons name="image" size={16} />}
          >
            Image
          </Button>
          <Button
            onPress={pickDocument}
            disabled={disabled || loading}
            variant="outline"
            size="sm"
            leftIcon={<Ionicons name="document" size={16} />}
          >
            Document
          </Button>
        </View>
      </View>
    );

    const renderPreview = () => {
      if (!showPreview || value.length === 0) return null;

      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing[3] }}
        >
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            {value.map((file, index) => (
              <Card
                key={`${file.uri}-${index}`}
                p={2}
                style={[
                  {
                    width: 120,
                    position: 'relative',
                  },
                  previewStyle,
                ]}
              >
                {file.type === 'image' ? (
                  <Image
                    source={{ uri: file.uri }}
                    style={{
                      width: '100%',
                      height: 80,
                      borderRadius: 4,
                      marginBottom: spacing[2],
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: '100%',
                      height: 80,
                      borderRadius: 4,
                      backgroundColor: theme.muted,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: spacing[2],
                    }}
                  >
                    <Ionicons
                      name={getFileIcon(file.type) as any}
                      size={32}
                      color={theme.mutedForeground}
                    />
                  </View>
                )}
                
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    color: theme.foreground,
                    marginBottom: spacing[0.5],
                  }}
                >
                  {file.name}
                </Text>
                
                {file.size && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: theme.mutedForeground,
                    }}
                  >
                    {formatFileSize(file.size)}
                  </Text>
                )}
                
                {!disabled && (
                  <TouchableOpacity
                    onPress={() => removeFile(index)}
                    style={{
                      position: 'absolute',
                      top: spacing[1],
                      right: spacing[1],
                      backgroundColor: theme.background,
                      borderRadius: 12,
                      padding: spacing[0.5],
                    }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={theme.destructive}
                    />
                  </TouchableOpacity>
                )}
              </Card>
            ))}
          </View>
        </ScrollView>
      );
    };

    return (
      <View ref={ref} testID={testID}>
        {variant === 'dropzone' && renderDropzone()}
        {variant === 'button' && renderButton()}
        {variant === 'default' && renderDefault()}
        {renderPreview()}
      </View>
    );
  }
);

FilePicker.displayName = 'FilePicker';

// File Upload Progress Component
export interface FileUploadProgressProps {
  fileName: string;
  progress: number;
  status?: 'uploading' | 'completed' | 'error';
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  fileName,
  progress,
  status = 'uploading',
  error,
  onCancel,
  onRetry,
  style,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return theme.success;
      case 'error':
        return theme.destructive;
      default:
        return theme.primary;
    }
  };

  return (
    <Card p={3} style={style}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons
          name={status === 'completed' ? 'checkmark-circle' : status === 'error' ? 'close-circle' : 'cloud-upload'}
          size={24}
          color={getStatusColor()}
        />
        
        <View style={{ flex: 1, marginLeft: spacing[3] }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: theme.foreground,
              marginBottom: spacing[1],
            }}
          >
            {fileName}
          </Text>
          
          {status === 'uploading' && (
            <View
              style={{
                height: 4,
                backgroundColor: theme.muted,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: theme.primary,
                }}
              />
            </View>
          )}
          
          {error && (
            <Text
              style={{
                fontSize: 12,
                color: theme.destructive,
              }}
            >
              {error}
            </Text>
          )}
        </View>
        
        {status === 'uploading' && onCancel && (
          <TouchableOpacity onPress={onCancel} style={{ marginLeft: spacing[2] }}>
            <Ionicons name="close" size={20} color={theme.mutedForeground} />
          </TouchableOpacity>
        )}
        
        {status === 'error' && onRetry && (
          <TouchableOpacity onPress={onRetry} style={{ marginLeft: spacing[2] }}>
            <Ionicons name="refresh" size={20} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};