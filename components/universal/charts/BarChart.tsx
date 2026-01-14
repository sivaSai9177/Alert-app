import React, { useMemo } from 'react';
import {
  View,
  ViewStyle,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Rect,
  Line,
  Text as SvgText,
  G,
} from 'react-native-svg';
import { useChartConfig } from './ChartContainer';

export interface BarChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

export interface BarChartProps {
  data: BarChartData;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  horizontal?: boolean;
  stacked?: boolean;
  barWidth?: number;
  style?: ViewStyle;
  onBarPress?: (dataset: number, index: number, value: number) => void;
  testID?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width: propWidth,
  height = 200,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  horizontal = false,
  stacked = false,
  barWidth: customBarWidth,
  style,
  onBarPress,
  testID,
}) => {
  const chartConfig = useChartConfig();
  const screenWidth = Dimensions.get('window').width;
  const width = propWidth || screenWidth - 32;
  
  const padding = {
    left: showYAxis ? 60 : 20,
    right: 20,
    top: 20,
    bottom: showXAxis ? 50 : 20,
  };
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Calculate min and max values
  const maxValue = useMemo(() => {
    if (stacked) {
      // For stacked bars, sum values at each index
      return Math.max(...data.labels.map((_, index) => 
        data.datasets.reduce((sum, dataset) => sum + dataset.data[index], 0)
      ));
    } else {
      // For grouped bars, find max individual value
      return Math.max(...data.datasets.flatMap(d => d.data));
    }
  }, [data, stacked]);
  
  const minValue = 0; // Bar charts typically start at 0
  const valueRange = maxValue - minValue || 1;
  
  // Calculate bar dimensions
  const groupWidth = chartWidth / data.labels.length;
  const defaultBarWidth = stacked ? groupWidth * 0.6 : (groupWidth * 0.8) / data.datasets.length;
  const barWidth = customBarWidth || defaultBarWidth;
  const barSpacing = (groupWidth - (stacked ? barWidth : barWidth * data.datasets.length)) / 2;
  
  // Generate bars
  const bars = useMemo(() => {
    const result: any[] = [];
    
    data.labels.forEach((label, labelIndex) => {
      let stackedHeight = 0;
      
      data.datasets.forEach((dataset, datasetIndex) => {
        const value = dataset.data[labelIndex];
        const barHeight = (value / valueRange) * chartHeight;
        
        let x: number, y: number;
        
        if (stacked) {
          x = padding.left + labelIndex * groupWidth + barSpacing;
          y = padding.top + chartHeight - stackedHeight - barHeight;
          stackedHeight += barHeight;
        } else {
          x = padding.left + labelIndex * groupWidth + barSpacing + datasetIndex * barWidth;
          y = padding.top + chartHeight - barHeight;
        }
        
        const color = dataset.color || chartConfig.colors[`chart${datasetIndex + 1}`];
        
        result.push({
          x,
          y,
          width: barWidth,
          height: barHeight,
          value,
          color,
          datasetIndex,
          labelIndex,
          key: `bar-${datasetIndex}-${labelIndex}`,
        });
      });
    });
    
    return result;
  }, [data, stacked, groupWidth, barWidth, barSpacing, chartHeight, valueRange, padding, chartConfig]);
  
  // Grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    
    if (showGrid) {
      // Horizontal grid lines
      const ySteps = 5;
      for (let i = 0; i <= ySteps; i++) {
        const y = padding.top + (i * chartHeight) / ySteps;
        lines.push(
          <Line
            key={`h-grid-${i}`}
            x1={padding.left}
            y1={y}
            x2={padding.left + chartWidth}
            y2={y}
            stroke={chartConfig.styles.grid.stroke}
            strokeWidth={chartConfig.styles.grid.strokeWidth}
            strokeDasharray={chartConfig.styles.grid.strokeDasharray}
          />
        );
      }
    }
    
    return lines;
  }, [showGrid, padding, chartHeight, chartWidth, chartConfig]);
  
  return (
    <View style={[{ width, height }, style]} testID={testID}>
      <Svg width={width} height={height}>
        {/* Grid */}
        {gridLines}
        
        {/* Axes */}
        {showXAxis && (
          <Line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke={chartConfig.styles.axis.stroke}
            strokeWidth={chartConfig.styles.axis.strokeWidth}
          />
        )}
        
        {showYAxis && (
          <Line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke={chartConfig.styles.axis.stroke}
            strokeWidth={chartConfig.styles.axis.strokeWidth}
          />
        )}
        
        {/* Y-axis labels */}
        {showYAxis && (
          <G>
            {[0, 1, 2, 3, 4, 5].map(i => {
              const value = minValue + (valueRange * (5 - i)) / 5;
              const y = padding.top + (i * chartHeight) / 5;
              return (
                <SvgText
                  key={`y-label-${i}`}
                  x={padding.left - 10}
                  y={y + 4}
                  fill={chartConfig.styles.text.fill}
                  fontSize={chartConfig.styles.text.fontSize}
                  textAnchor="end"
                >
                  {value.toFixed(0)}
                </SvgText>
              );
            })}
          </G>
        )}
        
        {/* X-axis labels */}
        {showXAxis && (
          <G>
            {data.labels.map((label, index) => {
              const x = padding.left + index * groupWidth + groupWidth / 2;
              return (
                <SvgText
                  key={`x-label-${index}`}
                  x={x}
                  y={height - padding.bottom + 15}
                  fill={chartConfig.styles.text.fill}
                  fontSize={chartConfig.styles.text.fontSize}
                  textAnchor="middle"
                >
                  {label}
                </SvgText>
              );
            })}
          </G>
        )}
        
        {/* Bars */}
        {bars.map(bar => (
          <Rect
            key={bar.key}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={bar.color}
            onPress={() => onBarPress?.(bar.datasetIndex, bar.labelIndex, bar.value)}
          />
        ))}
      </Svg>
    </View>
  );
};