import React, { useMemo } from 'react';
import { View, ViewStyle, Pressable, Platform } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Ionicons } from '@expo/vector-icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageInfo?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'dots';
  style?: ViewStyle;
  testID?: string;
}

export const Pagination = React.forwardRef<View, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      maxVisiblePages = 7,
      showFirstLast = true,
      showPrevNext = true,
      showPageInfo = false,
      disabled = false,
      size = 'md',
      variant = 'default',
      style,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();

    // Calculate visible page numbers
    const visiblePages = useMemo(() => {
      if (totalPages <= maxVisiblePages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const halfVisible = Math.floor(maxVisiblePages / 2);
      const pages: (number | string)[] = [];

      // Always show first page
      pages.push(1);

      // Calculate start and end of visible range
      let start = Math.max(2, currentPage - halfVisible);
      let end = Math.min(totalPages - 1, currentPage + halfVisible);

      // Adjust range if at the edges
      if (currentPage <= halfVisible) {
        end = maxVisiblePages - 1;
      } else if (currentPage >= totalPages - halfVisible) {
        start = totalPages - maxVisiblePages + 2;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add visible page numbers
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);

      return pages;
    }, [currentPage, totalPages, maxVisiblePages]);

    const handlePagePress = (page: number) => {
      if (!disabled && page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    };

    const sizeConfig = {
      sm: {
        buttonSize: 28,
        fontSize: 12,
        iconSize: 14,
        gap: 1,
      },
      md: {
        buttonSize: 36,
        fontSize: 14,
        iconSize: 18,
        gap: 2,
      },
      lg: {
        buttonSize: 44,
        fontSize: 16,
        iconSize: 22,
        gap: 2,
      },
    }[size];

    const containerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing(sizeConfig.gap),
      opacity: disabled ? 0.5 : 1,
      ...style,
    };

    const buttonStyle: ViewStyle = {
      width: sizeConfig.buttonSize,
      height: sizeConfig.buttonSize,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    };

    const PageButton = ({ page, isActive }: { page: number | string; isActive: boolean }) => {
      if (page === '...') {
        return (
          <View style={[buttonStyle, { borderColor: 'transparent' }]}>
            <Text size={sizeConfig.fontSize as any} colorTheme="mutedForeground">
              •••
            </Text>
          </View>
        );
      }

      const pageNumber = page as number;
      const isDisabled = disabled || isActive;

      return (
        <Pressable
          onPress={() => handlePagePress(pageNumber)}
          disabled={isDisabled}
          style={({ pressed }) => [
            buttonStyle,
            {
              backgroundColor: isActive
                ? theme.primary
                : pressed
                ? theme.accent
                : 'transparent',
              borderColor: isActive ? theme.primary : theme.border,
            },
          ]}
        >
          <Text
            size={sizeConfig.fontSize as any}
            weight={isActive ? 'semibold' : 'normal'}
            colorTheme={isActive ? 'primaryForeground' : 'foreground'}
          >
            {pageNumber}
          </Text>
        </Pressable>
      );
    };

    if (variant === 'compact') {
      return (
        <View ref={ref} style={containerStyle} testID={testID}>
          <Button
            variant="outline"
            size={size}
            onPress={() => handlePagePress(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            leftIcon={<Ionicons name="chevron-back" size={sizeConfig.iconSize} />}
          >
            Previous
          </Button>
          
          <View style={{ minWidth: 60, alignItems: 'center' }}>
            <Text size={sizeConfig.fontSize as any}>
              {currentPage} / {totalPages}
            </Text>
          </View>
          
          <Button
            variant="outline"
            size={size}
            onPress={() => handlePagePress(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            rightIcon={<Ionicons name="chevron-forward" size={sizeConfig.iconSize} />}
          >
            Next
          </Button>
        </View>
      );
    }

    if (variant === 'dots') {
      return (
        <View ref={ref} style={containerStyle} testID={testID}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Pressable
              key={page}
              onPress={() => handlePagePress(page)}
              disabled={disabled || page === currentPage}
              style={{
                width: page === currentPage ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  page === currentPage ? theme.primary : theme.mutedForeground,
                opacity: page === currentPage ? 1 : 0.3,
              }}
            />
          ))}
        </View>
      );
    }

    // Default variant
    return (
      <View ref={ref} style={containerStyle} testID={testID}>
        {showFirstLast && currentPage > 2 && (
          <Pressable
            onPress={() => handlePagePress(1)}
            disabled={disabled}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons
              name="play-back"
              size={sizeConfig.iconSize}
              color={theme.mutedForeground}
            />
          </Pressable>
        )}

        {showPrevNext && (
          <Pressable
            onPress={() => handlePagePress(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons
              name="chevron-back"
              size={sizeConfig.iconSize}
              color={
                currentPage === 1 ? theme.mutedForeground : theme.foreground
              }
            />
          </Pressable>
        )}

        {visiblePages.map((page, index) => (
          <PageButton
            key={`${page}-${index}`}
            page={page}
            isActive={page === currentPage}
          />
        ))}

        {showPrevNext && (
          <Pressable
            onPress={() => handlePagePress(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons
              name="chevron-forward"
              size={sizeConfig.iconSize}
              color={
                currentPage === totalPages
                  ? theme.mutedForeground
                  : theme.foreground
              }
            />
          </Pressable>
        )}

        {showFirstLast && currentPage < totalPages - 1 && (
          <Pressable
            onPress={() => handlePagePress(totalPages)}
            disabled={disabled}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons
              name="play-forward"
              size={sizeConfig.iconSize}
              color={theme.mutedForeground}
            />
          </Pressable>
        )}

        {showPageInfo && (
          <View style={{ marginLeft: spacing(4) }}>
            <Text size={sizeConfig.fontSize as any} colorTheme="mutedForeground">
              Page {currentPage} of {totalPages}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

Pagination.displayName = 'Pagination';

// Pagination Info Component
export interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  style?: ViewStyle;
  textSize?: 'xs' | 'sm' | 'md' | 'lg';
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  pageSize,
  totalItems,
  style,
  textSize = 'sm',
}) => {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <View style={style}>
      <Text size={textSize} colorTheme="mutedForeground">
        Showing {start}-{end} of {totalItems} items
      </Text>
    </View>
  );
};

// usePagination Hook
export interface UsePaginationOptions {
  totalItems: number;
  pageSize?: number;
  initialPage?: number;
}

export interface UsePaginationResult {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export const usePagination = ({
  totalItems,
  pageSize: initialPageSize = 10,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationResult => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [pageSize, setPageSizeState] = React.useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    // Reset to first page when page size changes
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex,
    endIndex,
    nextPage,
    previousPage,
    goToPage,
    setPageSize,
    canGoNext: currentPage < totalPages,
    canGoPrevious: currentPage > 1,
  };
};