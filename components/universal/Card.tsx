import React, { useState } from 'react';
import { View, ViewProps, Platform, Pressable } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { Box, BoxProps } from './Box';
import { Text, TextProps } from './Text';
import { useSpacing } from '@/contexts/SpacingContext';
import { BorderRadius, SpacingScale } from '@/lib/design-system';

// Card component
interface CardProps extends BoxProps {
  hoverable?: boolean;
  pressable?: boolean;
  onPress?: () => void;
}

export const Card = React.forwardRef<View, CardProps>(({
  children,
  style,
  hoverable = false,
  pressable = false,
  onPress,
  ...props
}, ref) => {
  const theme = useTheme();
  const { componentSpacing } = useSpacing();
  const [isHovered, setIsHovered] = useState(false);
  
  const webHoverStyles = Platform.OS === 'web' && (hoverable || pressable) ? {
    transition: 'all 0.2s ease',
    cursor: pressable ? 'pointer' : 'default',
    ...(isHovered && {
      transform: 'translateY(-2px)',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    }),
  } : {};
  
  // Mobile hover effect using elevation
  const mobileHoverStyles = Platform.OS !== 'web' && isHovered ? {
    elevation: 8,
  } : {};
  
  const cardStyle = [webHoverStyles, mobileHoverStyles, style];

  const webHandlers = Platform.OS === 'web' && (hoverable || pressable) ? {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  } : {};
  
  const CardContent = (
    <Box
      ref={!pressable ? ref : undefined}
      bgTheme="card"
      rounded={'lg' as BorderRadius}
      borderWidth={1}
      borderTheme="border"
      shadow={isHovered ? 'md' : 'sm'}
      style={cardStyle}
      {...webHandlers}
      {...props}
    >
      {children}
    </Box>
  );

  if (pressable && onPress) {
    return (
      <Pressable ref={ref} onPress={onPress}>
        {CardContent}
      </Pressable>
    );
  }

  return CardContent;
});

Card.displayName = 'Card';

// CardHeader component
interface CardHeaderProps extends BoxProps {}

export const CardHeader = React.forwardRef<View, CardHeaderProps>(({
  children,
  style,
  ...props
}, ref) => {
  const { componentSpacing } = useSpacing();
  
  return (
    <Box
      ref={ref}
      p={componentSpacing.cardPadding as SpacingScale}
      style={style}
      {...props}
    >
      {children}
    </Box>
  );
});

CardHeader.displayName = 'CardHeader';

// CardTitle component
interface CardTitleProps extends TextProps {}

export const CardTitle = React.forwardRef<any, CardTitleProps>(({
  children,
  style,
  ...props
}, ref) => {
  return (
    <Text
      ref={ref}
      size="2xl"
      weight="semibold"
      colorTheme="cardForeground"
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
});

CardTitle.displayName = 'CardTitle';

// CardDescription component
interface CardDescriptionProps extends TextProps {}

export const CardDescription = React.forwardRef<any, CardDescriptionProps>(({
  children,
  style,
  ...props
}, ref) => {
  return (
    <Text
      ref={ref}
      size="sm"
      colorTheme="mutedForeground"
      mt={1}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
});

CardDescription.displayName = 'CardDescription';

// CardContent component
interface CardContentProps extends BoxProps {}

export const CardContent = React.forwardRef<View, CardContentProps>(({
  children,
  style,
  ...props
}, ref) => {
  const { componentSpacing } = useSpacing();
  
  return (
    <Box
      ref={ref}
      px={componentSpacing.cardPadding as SpacingScale}
      pb={componentSpacing.cardPadding as SpacingScale}
      style={style}
      {...props}
    >
      {children}
    </Box>
  );
});

CardContent.displayName = 'CardContent';

// CardFooter component
interface CardFooterProps extends BoxProps {}

export const CardFooter = React.forwardRef<View, CardFooterProps>(({
  children,
  style,
  ...props
}, ref) => {
  const { componentSpacing } = useSpacing();
  
  return (
    <Box
      ref={ref}
      flexDirection="row"
      alignItems="center"
      px={componentSpacing.cardPadding as SpacingScale}
      pb={componentSpacing.cardPadding as SpacingScale}
      style={style}
      {...props}
    >
      {children}
    </Box>
  );
});

CardFooter.displayName = 'CardFooter';