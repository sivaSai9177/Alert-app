import React from 'react';
import { ViewStyle } from 'react-native';
import { LineChart, LineChartData, LineChartProps } from './LineChart';

export interface AreaChartData extends LineChartData {}

export interface AreaChartProps extends Omit<LineChartProps, 'data'> {
  data: AreaChartData;
  showPoints?: boolean;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  showPoints = false,
  ...props
}) => {
  // Area chart is essentially a line chart with filled areas
  const areaData: LineChartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      filled: true, // Always fill area charts
      showPoints: showPoints, // Use prop value
    })),
  };

  return <LineChart data={areaData} {...props} />;
};