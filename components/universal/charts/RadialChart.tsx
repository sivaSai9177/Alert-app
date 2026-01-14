import React from 'react';
import {
  View,
  ViewStyle,
  Text,
  Dimensions,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { useChartConfig } from './ChartContainer';
import { useTheme } from '@/lib/theme/theme-provider';

export interface RadialChartProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  showPercentage?: boolean;
  label?: string;
  startAngle?: number;
  endAngle?: number;
  style?: ViewStyle;
  testID?: string;
}

export const RadialChart: React.FC<RadialChartProps> = ({
  value,
  maxValue = 100,
  size: propSize,
  strokeWidth = 20,
  color,
  backgroundColor,
  showValue = true,
  showPercentage = false,
  label,
  startAngle = -90,
  endAngle = 270,
  style,
  testID,
}) => {
  const theme = useTheme();
  const chartConfig = useChartConfig();
  const screenWidth = Dimensions.get('window').width;
  const size = propSize || Math.min(screenWidth - 64, 200);
  
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Calculate percentage
  const percentage = Math.min(value / maxValue, 1);
  
  // Convert angles to radians
  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;
  const sweepAngle = endAngleRad - startAngleRad;
  const currentAngle = startAngleRad + sweepAngle * percentage;
  
  // Calculate path
  const x1 = centerX + Math.cos(startAngleRad) * radius;
  const y1 = centerY + Math.sin(startAngleRad) * radius;
  const x2 = centerX + Math.cos(currentAngle) * radius;
  const y2 = centerY + Math.sin(currentAngle) * radius;
  
  const largeArcFlag = Math.abs(currentAngle - startAngleRad) > Math.PI ? 1 : 0;
  
  const pathData = [
    `M ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
  ].join(' ');
  
  const backgroundPathData = [
    `M ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${Math.abs(sweepAngle) > Math.PI ? 1 : 0} 1 ${centerX + Math.cos(endAngleRad) * radius} ${centerY + Math.sin(endAngleRad) * radius}`,
  ].join(' ');
  
  const progressColor = color || chartConfig.colors.primary;
  const bgColor = backgroundColor || theme.muted;
  
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]} testID={testID}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <G>
          {/* Background arc */}
          <Path
            d={backgroundPathData}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <Path
            d={pathData}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      </Svg>
      
      {/* Center content */}
      <View style={{ alignItems: 'center' }}>
        {showValue && (
          <Text
            style={{
              fontSize: size / 5,
              fontWeight: 'bold',
              color: theme.foreground,
            }}
          >
            {showPercentage ? `${Math.round(percentage * 100)}%` : value}
          </Text>
        )}
        {label && (
          <Text
            style={{
              fontSize: size / 12,
              color: theme.mutedForeground,
              marginTop: 4,
            }}
          >
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};

// Multiple radial charts for comparison
export interface RadialBarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface RadialBarChartProps {
  data: RadialBarChartData[];
  maxValue?: number;
  size?: number;
  innerRadius?: number;
  barWidth?: number;
  showLabels?: boolean;
  showValues?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const RadialBarChart: React.FC<RadialBarChartProps> = ({
  data,
  maxValue = 100,
  size: propSize,
  innerRadius = 30,
  barWidth = 15,
  showLabels = true,
  showValues = true,
  style,
  testID,
}) => {
  const theme = useTheme();
  const chartConfig = useChartConfig();
  const screenWidth = Dimensions.get('window').width;
  const size = propSize || Math.min(screenWidth - 64, 250);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size / 2 - 20;
  
  const bars = data.map((item, index) => {
    const radius = maxRadius - index * (barWidth + 5);
    const percentage = Math.min(item.value / maxValue, 1);
    const sweepAngle = percentage * 2 * Math.PI * 0.75; // 3/4 circle
    const startAngle = -Math.PI * 0.75;
    const endAngle = startAngle + sweepAngle;
    
    const x1 = centerX + Math.cos(startAngle) * radius;
    const y1 = centerY + Math.sin(startAngle) * radius;
    const x2 = centerX + Math.cos(endAngle) * radius;
    const y2 = centerY + Math.sin(endAngle) * radius;
    
    const bgEndAngle = startAngle + 2 * Math.PI * 0.75;
    const bgX2 = centerX + Math.cos(bgEndAngle) * radius;
    const bgY2 = centerY + Math.sin(bgEndAngle) * radius;
    
    const color = item.color || chartConfig.colors[`chart${(index % 5) + 1}`];
    
    return {
      progressPath: `M ${x1} ${y1} A ${radius} ${radius} 0 ${sweepAngle > Math.PI ? 1 : 0} 1 ${x2} ${y2}`,
      backgroundPath: `M ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${bgX2} ${bgY2}`,
      color,
      item,
      radius,
      percentage,
    };
  });
  
  return (
    <View style={[{ width: size, height: size }, style]} testID={testID}>
      <Svg width={size} height={size}>
        {bars.map((bar, index) => (
          <G key={`bar-${index}`}>
            {/* Background */}
            <Path
              d={bar.backgroundPath}
              stroke={theme.muted}
              strokeWidth={barWidth}
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Progress */}
            <Path
              d={bar.progressPath}
              stroke={bar.color}
              strokeWidth={barWidth}
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Label */}
            {showLabels && (
              <SvgText
                x={centerX - bar.radius - barWidth}
                y={centerY + 4}
                fill={theme.mutedForeground}
                fontSize={10}
                textAnchor="end"
              >
                {bar.item.label}
              </SvgText>
            )}
            
            {/* Value */}
            {showValues && (
              <SvgText
                x={centerX + bar.radius + barWidth}
                y={centerY + 4}
                fill={theme.foreground}
                fontSize={12}
                fontWeight="bold"
                textAnchor="start"
              >
                {`${Math.round(bar.percentage * 100)}%`}
              </SvgText>
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
};