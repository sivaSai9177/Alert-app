import React, { useMemo, useCallback } from 'react';
import { View, ScrollView, ViewStyle, TextStyle, Pressable } from 'react-native';
import { useTheme } from '@/lib/theme/enhanced-theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Text } from './Text';
import { HStack, VStack } from './Stack';
import { SpacingScale } from '@/lib/design-system';

// Table Props
export interface TableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
}

export const Table: React.FC<TableProps> = ({
  children,
  style,
  striped = false,
  bordered = true,
  hoverable = false,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={style}
    >
      <View
        style={{
          borderWidth: bordered ? 1 : 0,
          borderColor: theme.border,
          borderRadius: spacing[2],
          backgroundColor: theme.card,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </ScrollView>
  );
};

// Table Header Props
export interface TableHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  style,
}) => {
  const theme = useTheme();
  
  return (
    <View
      style={[
        {
          backgroundColor: theme.muted,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Table Body Props
export interface TableBodyProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  style,
}) => {
  return <View style={style}>{children}</View>;
};

// Table Footer Props
export interface TableFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const TableFooter: React.FC<TableFooterProps> = ({
  children,
  style,
}) => {
  const theme = useTheme();
  
  return (
    <View
      style={[
        {
          backgroundColor: theme.muted,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Table Row Props
export interface TableRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
  striped?: boolean;
  index?: number;
  hoverable?: boolean;
  onPress?: () => void;
}

export const TableRow = React.memo<TableRowProps>(({
  children,
  style,
  striped = false,
  index = 0,
  hoverable = false,
  onPress,
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  
  const isStriped = striped && index % 2 === 1;
  
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => hoverable && setIsHovered(true)}
      onHoverOut={() => hoverable && setIsHovered(false)}
      disabled={!onPress}
    >
      {({ pressed }) => (
        <HStack
          style={[
            {
              backgroundColor: isStriped 
                ? theme.muted 
                : isHovered || pressed 
                  ? theme.muted 
                  : 'transparent',
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            },
            style,
          ]}
        >
          {children}
        </HStack>
      )}
    </Pressable>
  );
});

// Table Cell Props
export interface TableCellProps {
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  align?: 'left' | 'center' | 'right';
  width?: number;
  flex?: number;
  header?: boolean;
}

export const TableCell = React.memo<TableCellProps>(({
  children,
  style,
  textStyle,
  align = 'left',
  width,
  flex,
  header = false,
}) => {
  const { spacing } = useSpacing();
  
  const textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
  
  return (
    <View
      style={[
        {
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[2],
          width,
          flex: flex || (width ? 0 : 1),
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          size="sm"
          weight={header ? 'medium' : 'normal'}
          style={[{ textAlign }, textStyle]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
});

// Simple Table Component
export interface SimpleTableColumn {
  key: string;
  header: string;
  width?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any, index: number) => React.ReactNode;
}

export interface SimpleTableProps {
  columns: SimpleTableColumn[];
  data: any[];
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  onRowPress?: (row: any, index: number) => void;
  style?: ViewStyle;
}

export const SimpleTable = React.memo<SimpleTableProps>(({
  columns,
  data,
  striped = false,
  bordered = true,
  hoverable = false,
  onRowPress,
  style,
}) => {
  // Memoize row press handlers to prevent recreation
  const handleRowPress = useCallback((row: any, rowIndex: number) => {
    return onRowPress ? () => onRowPress(row, rowIndex) : undefined;
  }, [onRowPress]);

  // Memoize header row
  const headerRow = useMemo(() => (
    <TableRow>
      {columns.map((col) => (
        <TableCell
          key={col.key}
          header
          width={col.width}
          flex={col.flex}
          align={col.align}
        >
          {col.header}
        </TableCell>
      ))}
    </TableRow>
  ), [columns]);

  return (
    <Table striped={striped} bordered={bordered} hoverable={hoverable} style={style}>
      <TableHeader>
        {headerRow}
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            index={rowIndex}
            striped={striped}
            hoverable={hoverable}
            onPress={handleRowPress(row, rowIndex)}
          >
            {columns.map((col) => (
              <TableCell
                key={col.key}
                width={col.width}
                flex={col.flex}
                align={col.align}
              >
                {col.render 
                  ? col.render(row[col.key], row, rowIndex)
                  : row[col.key]
                }
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});