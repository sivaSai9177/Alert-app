import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSpacing } from '@/contexts/SpacingContext';
import { SpacingScale } from '@/lib/design-system';

export interface GridProps {
  children: React.ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  gap?: SpacingScale;
  rowGap?: SpacingScale;
  columnGap?: SpacingScale;
  alignItems?: ViewStyle['alignItems'];
  justifyItems?: ViewStyle['justifyContent'];
  style?: ViewStyle;
  testID?: string;
}

interface GridItemProps {
  children: React.ReactNode;
  span?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  style?: ViewStyle;
  testID?: string;
}

// Helper to get responsive value
const getResponsiveValue = <T,>(
  value: T | { xs?: T; sm?: T; md?: T; lg?: T },
  screenWidth: number
): T => {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  // Simple breakpoint system
  if (screenWidth < 640 && (value as any).xs !== undefined) {
    return (value as any).xs;
  } else if (screenWidth < 768 && (value as any).sm !== undefined) {
    return (value as any).sm;
  } else if (screenWidth < 1024 && (value as any).md !== undefined) {
    return (value as any).md;
  } else if ((value as any).lg !== undefined) {
    return (value as any).lg;
  }

  // Fallback to largest defined value
  return (value as any).lg || (value as any).md || (value as any).sm || (value as any).xs || 1;
};

export const Grid = React.forwardRef<View, GridProps>(
  (
    {
      children,
      columns = 12,
      gap,
      rowGap,
      columnGap,
      alignItems = 'stretch',
      justifyItems = 'flex-start',
      style,
      testID,
    },
    ref
  ) => {
    const { spacing } = useSpacing();
    const [containerWidth, setContainerWidth] = React.useState(0);

    const handleLayout = (event: any) => {
      setContainerWidth(event.nativeEvent.layout.width);
    };

    const currentColumns = getResponsiveValue(columns, containerWidth);
    const gapValue = gap !== undefined ? spacing[gap] : 0;
    const rowGapValue = rowGap !== undefined ? spacing[rowGap] : gapValue;
    const columnGapValue = columnGap !== undefined ? spacing[columnGap] : gapValue;

    // Calculate column width
    const totalGapWidth = columnGapValue * (currentColumns - 1);
    const columnWidth = containerWidth > 0 
      ? (containerWidth - totalGapWidth) / currentColumns 
      : 0;

    const containerStyle: ViewStyle = {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -columnGapValue / 2,
      marginVertical: -rowGapValue / 2,
      ...style,
    };

    // Process children to wrap in grid items
    const processedChildren = React.Children.map(children, (child, index) => {
      if (React.isValidElement(child) && child.type === GridItem) {
        const span = getResponsiveValue(child.props.span || 1, containerWidth);
        const itemWidth = columnWidth * span + columnGapValue * (span - 1);

        return React.cloneElement(child as React.ReactElement<GridItemProps>, {
          style: {
            width: itemWidth,
            paddingHorizontal: columnGapValue / 2,
            paddingVertical: rowGapValue / 2,
            alignItems: justifyItems,
            ...child.props.style,
          },
        });
      }

      // Wrap non-GridItem children in a default GridItem
      return (
        <GridItem
          key={index}
          style={{
            width: columnWidth,
            paddingHorizontal: columnGapValue / 2,
            paddingVertical: rowGapValue / 2,
            alignItems: justifyItems,
          }}
        >
          {child}
        </GridItem>
      );
    });

    return (
      <View
        ref={ref}
        style={containerStyle}
        onLayout={handleLayout}
        testID={testID}
      >
        {processedChildren}
      </View>
    );
  }
);

Grid.displayName = 'Grid';

// Grid Item Component
export const GridItem = React.forwardRef<View, GridItemProps>(
  ({ children, span = 1, style, testID }, ref) => {
    return (
      <View ref={ref} style={style} testID={testID}>
        {children}
      </View>
    );
  }
);

GridItem.displayName = 'GridItem';

// Row component for simplified grid usage
export interface RowProps {
  children: React.ReactNode;
  gap?: SpacingScale;
  alignItems?: ViewStyle['alignItems'];
  justifyContent?: ViewStyle['justifyContent'];
  style?: ViewStyle;
  testID?: string;
}

export const Row = React.forwardRef<View, RowProps>(
  (
    {
      children,
      gap = 2,
      alignItems = 'center',
      justifyContent = 'flex-start',
      style,
      testID,
    },
    ref
  ) => {
    const { spacing } = useSpacing();

    const rowStyle: ViewStyle = {
      flexDirection: 'row',
      gap: spacing[gap],
      alignItems,
      justifyContent,
      ...style,
    };

    return (
      <View ref={ref} style={rowStyle} testID={testID}>
        {children}
      </View>
    );
  }
);

Row.displayName = 'Row';

// Column component for simplified grid usage
export interface ColumnProps {
  children: React.ReactNode;
  gap?: SpacingScale;
  alignItems?: ViewStyle['alignItems'];
  justifyContent?: ViewStyle['justifyContent'];
  flex?: number;
  style?: ViewStyle;
  testID?: string;
}

export const Column = React.forwardRef<View, ColumnProps>(
  (
    {
      children,
      gap = 2,
      alignItems = 'stretch',
      justifyContent = 'flex-start',
      flex,
      style,
      testID,
    },
    ref
  ) => {
    const { spacing } = useSpacing();

    const columnStyle: ViewStyle = {
      flexDirection: 'column',
      gap: spacing[gap],
      alignItems,
      justifyContent,
      flex,
      ...style,
    };

    return (
      <View ref={ref} style={columnStyle} testID={testID}>
        {children}
      </View>
    );
  }
);

Column.displayName = 'Column';