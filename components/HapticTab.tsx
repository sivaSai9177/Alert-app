import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface HapticTabProps extends PressableProps {
  children: React.ReactNode;
}

export function HapticTab({ children, onPress, ...rest }: HapticTabProps) {
  const handlePress = (event: any) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  return (
    <Pressable onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  );
}