import React from "react";
import { Image, Pressable, Platform } from "react-native";
import { useTheme } from "@/lib/theme/theme-provider";
import { Box, Text } from "@/components/universal";
import { log } from "@/lib/core/logger";
import * as Haptics from 'expo-haptics';

interface AvatarProps {
  image?: string | null;
  name: string;
  size?: number;
  onPress?: () => void;
}

export function Avatar({ image, name, size = 40, onPress }: AvatarProps) {
  const theme = useTheme();
  const [imageError, setImageError] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Get initials from name
  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'U'; // Default to 'U' for User
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      return 'U';
    }
    const words = trimmedName.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return trimmedName.slice(0, 2).toUpperCase();
  };

  const handlePress = () => {
    if (onPress) {
      // Haptic feedback on native
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  };

  const AvatarContent = () => {
    if (image && !imageError) {
      return (
        <Box 
          width={size} 
          height={size} 
          rounded="full"
          overflow="hidden"
          bgTheme="muted"
        >
          <Image 
            source={{ uri: image }} 
            style={{ width: '100%', height: '100%' }}
            onError={() => {
              log.debug('Failed to load avatar image', 'Avatar', { image });
              setImageError(true);
            }}
          />
        </Box>
      );
    }

    // Fallback to initials
    return (
      <Box 
        width={size} 
        height={size} 
        rounded="full"
        bgTheme="primary"
        justifyContent="center"
        alignItems="center"
        style={{
          // Add shadow on web when hovered
          ...(Platform.OS === 'web' && isHovered && onPress && {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: [{ scale: 1.05 }],
          }),
          ...(Platform.OS === 'web' && { transition: 'all 0.2s ease' } as any),
        }}
      >
        <Text 
          weight="semibold"
          style={{ 
            color: theme.primaryForeground, 
            fontSize: size * 0.4,
          }}
        >
          {getInitials(name)}
        </Text>
      </Box>
    );
  };

  if (onPress) {
    return (
      <Pressable 
        onPress={handlePress}
        onPressIn={() => Platform.OS === 'web' && setIsHovered(false)}
        onPressOut={() => Platform.OS === 'web' && setIsHovered(false)}
        style={{
          cursor: Platform.OS === 'web' ? 'pointer' : undefined,
          opacity: isHovered ? 0.9 : 1,
        }}
        {...(Platform.OS === 'web' && {
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        })}
      >
        <AvatarContent />
      </Pressable>
    );
  }

  return <AvatarContent />;
}