import React, { useMemo } from 'react';
import {
  View,
  ViewStyle,
  Dimensions,
  Text,
} from 'react-native';
import Svg, {
  Path,
  G,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import { useChartConfig } from './ChartContainer';
import { useTheme } from '@/lib/theme/theme-provider';

export interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartData[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  showValues?: boolean;
  labelPosition?: 'inside' | 'outside';
  style?: ViewStyle;
  onSlicePress?: (index: number, item: PieChartData) => void;
  testID?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  width: propWidth,
  height = 250,
  innerRadius = 0,
  outerRadius,
  showLabels = true,
  showValues = false,
  labelPosition = 'outside',
  style,
  onSlicePress,
  testID,
}) => {
  const theme = useTheme();
  const chartConfig = useChartConfig();
  const screenWidth = Dimensions.get('window').width;
  const width = propWidth || screenWidth - 32;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = outerRadius || Math.min(width, height) / 2 - 20;
  
  // Calculate total and percentages
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  
  // Generate pie slices
  const slices = useMemo(() => {
    let startAngle = -Math.PI / 2; // Start from top
    
    return data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 2 * Math.PI;
      const endAngle = startAngle + angle;
      
      // Calculate path
      const x1 = centerX + Math.cos(startAngle) * radius;
      const y1 = centerY + Math.sin(startAngle) * radius;
      const x2 = centerX + Math.cos(endAngle) * radius;
      const y2 = centerY + Math.sin(endAngle) * radius;
      
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      
      let path: string;
      if (innerRadius > 0) {
        // Donut chart
        const innerX1 = centerX + Math.cos(startAngle) * innerRadius;
        const innerY1 = centerY + Math.sin(startAngle) * innerRadius;
        const innerX2 = centerX + Math.cos(endAngle) * innerRadius;
        const innerY2 = centerY + Math.sin(endAngle) * innerRadius;
        
        path = [
          `M ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${innerX2} ${innerY2}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
          'Z',
        ].join(' ');
      } else {
        // Regular pie chart
        path = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z',
        ].join(' ');
      }
      
      // Calculate label position
      const labelAngle = startAngle + angle / 2;
      const labelRadius = labelPosition === 'inside' 
        ? (innerRadius + radius) / 2 
        : radius + 20;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      const slice = {
        path,
        color: item.color || chartConfig.colors[`chart${(index % 5) + 1}`],
        percentage,
        labelX,
        labelY,
        item,
        index,
        key: `slice-${index}`,
      };
      
      startAngle = endAngle;
      return slice;
    });
  }, [data, total, centerX, centerY, radius, innerRadius, labelPosition, chartConfig]);
  
  return (
    <View style={[{ width, height }, style]} testID={testID}>
      <Svg width={width} height={height}>
        {/* Slices */}
        {slices.map(slice => (
          <G key={slice.key}>
            <Path
              d={slice.path}
              fill={slice.color}
              onPress={() => onSlicePress?.(slice.index, slice.item)}
            />
            
            {/* Labels */}
            {showLabels && (
              <SvgText
                x={slice.labelX}
                y={slice.labelY - (showValues ? 8 : 0)}
                fill={labelPosition === 'inside' ? theme.background : theme.foreground}
                fontSize={12}
                fontWeight="500"
                textAnchor="middle"
              >
                {slice.item.label}
              </SvgText>
            )}
            
            {/* Values */}
            {showValues && (
              <SvgText
                x={slice.labelX}
                y={slice.labelY + (showLabels ? 8 : 0)}
                fill={labelPosition === 'inside' ? theme.background : theme.mutedForeground}
                fontSize={11}
                textAnchor="middle"
              >
                {`${(slice.percentage * 100).toFixed(1)}%`}
              </SvgText>
            )}
          </G>
        ))}
        
        {/* Center text for donut charts */}
        {innerRadius > 0 && (
          <G>
            <Circle
              cx={centerX}
              cy={centerY}
              r={innerRadius - 1}
              fill={theme.background}
            />
            <SvgText
              x={centerX}
              y={centerY - 8}
              fill={theme.foreground}
              fontSize={24}
              fontWeight="bold"
              textAnchor="middle"
            >
              {total}
            </SvgText>
            <SvgText
              x={centerX}
              y={centerY + 8}
              fill={theme.mutedForeground}
              fontSize={12}
              textAnchor="middle"
            >
              Total
            </SvgText>
          </G>
        )}
      </Svg>
    </View>
  );
};