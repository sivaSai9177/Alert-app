import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { designSystem, Shadow, BorderRadius, SpacingScale } from '@/lib/design-system';
import { useSpacing } from '@/contexts/SpacingContext';

export interface BoxProps extends ViewProps {
  // Spacing
  p?: SpacingScale;
  px?: SpacingScale;
  py?: SpacingScale;
  pt?: SpacingScale;
  pr?: SpacingScale;
  pb?: SpacingScale;
  pl?: SpacingScale;
  m?: SpacingScale;
  mx?: SpacingScale;
  my?: SpacingScale;
  mt?: SpacingScale;
  mr?: SpacingScale;
  mb?: SpacingScale;
  ml?: SpacingScale;
  
  // Layout
  flex?: number;
  flexDirection?: ViewStyle['flexDirection'];
  justifyContent?: ViewStyle['justifyContent'];
  alignItems?: ViewStyle['alignItems'];
  alignSelf?: ViewStyle['alignSelf'];
  flexWrap?: ViewStyle['flexWrap'];
  gap?: SpacingScale;
  
  // Dimensions
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  minWidth?: ViewStyle['minWidth'];
  minHeight?: ViewStyle['minHeight'];
  maxWidth?: ViewStyle['maxWidth'];
  maxHeight?: ViewStyle['maxHeight'];
  
  // Visual
  bg?: string;
  bgTheme?: 'background' | 'card' | 'popover' | 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive';
  rounded?: BorderRadius;
  shadow?: Shadow;
  opacity?: ViewStyle['opacity'];
  
  // Border
  borderWidth?: number;
  borderColor?: string;
  borderTheme?: 'border' | 'input' | 'ring';
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  
  // Position
  position?: ViewStyle['position'];
  top?: ViewStyle['top'];
  right?: ViewStyle['right'];
  bottom?: ViewStyle['bottom'];
  left?: ViewStyle['left'];
  zIndex?: ViewStyle['zIndex'];
  
  // Other
  overflow?: ViewStyle['overflow'];
  pointerEvents?: ViewProps['pointerEvents'];
}

export const Box = React.forwardRef<View, BoxProps>(({
  // Spacing
  p, px, py, pt, pr, pb, pl,
  m, mx, my, mt, mr, mb, ml,
  
  // Layout
  flex,
  flexDirection,
  justifyContent,
  alignItems,
  alignSelf,
  flexWrap,
  gap,
  
  // Dimensions
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  
  // Visual
  bg,
  bgTheme,
  rounded,
  shadow,
  opacity,
  
  // Border
  borderWidth,
  borderColor,
  borderTheme,
  borderTopWidth,
  borderRightWidth,
  borderBottomWidth,
  borderLeftWidth,
  
  // Position
  position,
  top,
  right,
  bottom,
  left,
  zIndex,
  
  // Other
  overflow,
  pointerEvents,
  style,
  children,
  ...props
}, ref) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  
  // Build style object
  const boxStyle: ViewStyle = {
    // Spacing
    ...(p !== undefined && { padding: spacing[p] }),
    ...(px !== undefined && { paddingHorizontal: spacing[px] }),
    ...(py !== undefined && { paddingVertical: spacing[py] }),
    ...(pt !== undefined && { paddingTop: spacing[pt] }),
    ...(pr !== undefined && { paddingRight: spacing[pr] }),
    ...(pb !== undefined && { paddingBottom: spacing[pb] }),
    ...(pl !== undefined && { paddingLeft: spacing[pl] }),
    ...(m !== undefined && { margin: spacing[m] }),
    ...(mx !== undefined && { marginHorizontal: spacing[mx] }),
    ...(my !== undefined && { marginVertical: spacing[my] }),
    ...(mt !== undefined && { marginTop: spacing[mt] }),
    ...(mr !== undefined && { marginRight: spacing[mr] }),
    ...(mb !== undefined && { marginBottom: spacing[mb] }),
    ...(ml !== undefined && { marginLeft: spacing[ml] }),
    
    // Layout
    ...(flex !== undefined && { flex }),
    ...(flexDirection && { flexDirection }),
    ...(justifyContent && { justifyContent }),
    ...(alignItems && { alignItems }),
    ...(alignSelf && { alignSelf }),
    ...(flexWrap && { flexWrap }),
    ...(gap !== undefined && { gap: spacing[gap] }),
    
    // Dimensions
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(minWidth !== undefined && { minWidth }),
    ...(minHeight !== undefined && { minHeight }),
    ...(maxWidth !== undefined && { maxWidth }),
    ...(maxHeight !== undefined && { maxHeight }),
    
    // Visual
    ...(bg && { backgroundColor: bg }),
    ...(bgTheme && { backgroundColor: theme[bgTheme] }),
    ...(rounded !== undefined && { borderRadius: designSystem.borderRadius[rounded] }),
    ...(shadow && designSystem.shadows[shadow]),
    ...(opacity !== undefined && { opacity }),
    
    // Border
    ...(borderWidth !== undefined && { borderWidth }),
    ...(borderColor && { borderColor }),
    ...(borderTheme && { borderColor: theme[borderTheme] }),
    ...(borderTopWidth !== undefined && { borderTopWidth }),
    ...(borderRightWidth !== undefined && { borderRightWidth }),
    ...(borderBottomWidth !== undefined && { borderBottomWidth }),
    ...(borderLeftWidth !== undefined && { borderLeftWidth }),
    
    // Position
    ...(position && { position }),
    ...(top !== undefined && { top }),
    ...(right !== undefined && { right }),
    ...(bottom !== undefined && { bottom }),
    ...(left !== undefined && { left }),
    ...(zIndex !== undefined && { zIndex }),
    
    // Other
    ...(overflow && { overflow }),
  };
  
  return (
    <View
      ref={ref}
      style={[boxStyle, style]}
      pointerEvents={pointerEvents}
      {...props}
    >
      {children}
    </View>
  );
});

Box.displayName = 'Box';