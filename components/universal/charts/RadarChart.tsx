import React, { useMemo } from 'react';
import {
  View,
  ViewStyle,
  Dimensions,
} from 'react-native';
import Svg, {
  Polygon,
  Line,
  Circle,
  Text as SvgText,
  G,
} from 'react-native-svg';
import { useChartConfig } from './ChartContainer';

export interface RadarChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
    fillOpacity?: number;
    strokeWidth?: number;
  }>;
}

export interface RadarChartProps {
  data: RadarChartData;
  width?: number;
  height?: number;
  levels?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  showPoints?: boolean;
  style?: ViewStyle;
  onDataPointPress?: (dataset: number, index: number, value: number) => void;
  testID?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  width: propWidth,
  height = 250,
  levels = 5,
  showGrid = true,
  showLabels = true,
  showPoints = true,
  style,
  onDataPointPress,
  testID,
}) => {
  const chartConfig = useChartConfig();
  const screenWidth = Dimensions.get('window').width;
  const width = propWidth || screenWidth - 32;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 40;
  
  // Calculate max value
  const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
  
  // Calculate angle for each data point
  const angleStep = (2 * Math.PI) / data.labels.length;
  
  // Generate grid
  const gridLines = useMemo(() => {
    const lines = [];
    
    if (showGrid) {
      // Concentric polygons
      for (let level = 1; level <= levels; level++) {
        const levelRadius = (radius * level) / levels;
        const points = data.labels.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = centerX + Math.cos(angle) * levelRadius;
          const y = centerY + Math.sin(angle) * levelRadius;
          return `${x},${y}`;
        }).join(' ');
        
        lines.push(
          <Polygon
            key={`grid-level-${level}`}
            points={points}
            fill="none"
            stroke={chartConfig.styles.grid.stroke}
            strokeWidth={chartConfig.styles.grid.strokeWidth}
          />
        );
      }
      
      // Radial lines
      data.labels.forEach((_, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        lines.push(
          <Line
            key={`grid-radial-${index}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke={chartConfig.styles.grid.stroke}
            strokeWidth={chartConfig.styles.grid.strokeWidth}
          />
        );
      });
    }
    
    return lines;
  }, [showGrid, levels, data.labels, angleStep, centerX, centerY, radius, chartConfig]);
  
  // Generate data polygons
  const dataPolygons = useMemo(() => {
    return data.datasets.map((dataset, datasetIndex) => {
      const points = dataset.data.map((value, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const distance = (value / maxValue) * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        return { x, y, value, index };
      });
      
      const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
      const color = dataset.color || chartConfig.colors[`chart${datasetIndex + 1}`];
      
      return {
        polygonPoints,
        points,
        color,
        fillOpacity: dataset.fillOpacity || 0.3,
        strokeWidth: dataset.strokeWidth || 2,
        datasetIndex,
        key: `dataset-${datasetIndex}`,
      };
    });
  }, [data.datasets, angleStep, maxValue, radius, centerX, centerY, chartConfig]);
  
  // Labels
  const labels = useMemo(() => {
    if (!showLabels) return null;
    
    return data.labels.map((label, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius + 20);
      const y = centerY + Math.sin(angle) * (radius + 20);
      
      return (
        <SvgText
          key={`label-${index}`}
          x={x}
          y={y}
          fill={chartConfig.styles.text.fill}
          fontSize={chartConfig.styles.text.fontSize}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {label}
        </SvgText>
      );
    });
  }, [showLabels, data.labels, angleStep, centerX, centerY, radius, chartConfig]);
  
  return (
    <View style={[{ width, height }, style]} testID={testID}>
      <Svg width={width} height={height}>
        {/* Grid */}
        {gridLines}
        
        {/* Data polygons */}
        {dataPolygons.map(polygon => (
          <G key={polygon.key}>
            <Polygon
              points={polygon.polygonPoints}
              fill={polygon.color}
              fillOpacity={polygon.fillOpacity}
              stroke={polygon.color}
              strokeWidth={polygon.strokeWidth}
            />
            
            {/* Data points */}
            {showPoints && polygon.points.map((point, index) => (
              <Circle
                key={`point-${polygon.datasetIndex}-${index}`}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={polygon.color}
                onPress={() => onDataPointPress?.(polygon.datasetIndex, point.index, point.value)}
              />
            ))}
          </G>
        ))}
        
        {/* Labels */}
        {labels}
      </Svg>
    </View>
  );
};