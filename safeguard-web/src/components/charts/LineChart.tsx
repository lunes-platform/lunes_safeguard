import { useMemo } from 'react';

export type LineChartPoint = {
  date: string;
  value: number;
};

type Props = {
  data: LineChartPoint[];
  width?: number;
  height?: number;
  lineColor?: string;
  areaColor?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
};

export function LineChart({
  data,
  width = 500,
  height = 300,
  lineColor = '#4f46e5',
  areaColor = 'rgba(79, 70, 229, 0.2)',
  showGrid = true,
  showTooltip = true,
  yAxisLabel,
  xAxisLabel
}: Props) {
  // Padding for the chart area
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  
  // Chart dimensions
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Sort data by date
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);
  
  // Calculate min and max values for scales
  const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data]);
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  
  // Scale functions
  const xScale = (index: number) => (chartWidth * index) / Math.max(1, sortedData.length - 1);
  const yScale = (value: number) => chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
  
  // Generate path for the line
  const linePath = useMemo(() => {
    if (sortedData.length === 0) return '';
    
    return sortedData.reduce((path, point, i) => {
      const x = xScale(i);
      const y = yScale(point.value);
      return path + (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
    }, '');
  }, [sortedData, chartWidth, chartHeight]);
  
  // Generate path for the area under the line
  const areaPath = useMemo(() => {
    if (sortedData.length === 0) return '';
    
    let path = sortedData.reduce((acc, point, i) => {
      const x = xScale(i);
      const y = yScale(point.value);
      return acc + (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
    }, '');
    
    // Close the path to create an area
    const lastX = xScale(sortedData.length - 1);
    path += ` L ${lastX},${chartHeight} L ${xScale(0)},${chartHeight} Z`;
    return path;
  }, [sortedData, chartWidth, chartHeight]);
  
  // Generate grid lines
  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    
    const yLines = [];
    const xLines = [];
    const ySteps = 5;
    
    // Horizontal grid lines (y-axis)
    for (let i = 0; i <= ySteps; i++) {
      const y = (chartHeight * i) / ySteps;
      yLines.push(
        <line
          key={`y-${i}`}
          x1={0}
          y1={y}
          x2={chartWidth}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      );
    }
    
    // Vertical grid lines (x-axis)
    if (sortedData.length > 1) {
      const xSteps = Math.min(sortedData.length - 1, 6);
      for (let i = 0; i <= xSteps; i++) {
        const x = (chartWidth * i) / xSteps;
        xLines.push(
          <line
            key={`x-${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={chartHeight}
            stroke="#e5e7eb"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        );
      }
    }
    
    return [...yLines, ...xLines];
  }, [showGrid, chartWidth, chartHeight, sortedData.length]);
  
  // Generate x-axis labels
  const xAxisLabels = useMemo(() => {
    if (sortedData.length <= 1) return null;
    
    const labels = [];
    const labelCount = Math.min(sortedData.length, 6);
    
    for (let i = 0; i <= labelCount; i++) {
      const index = Math.floor((i / labelCount) * (sortedData.length - 1));
      const x = xScale(index);
      const date = new Date(sortedData[index].date);
      const formattedDate = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      
      labels.push(
        <text
          key={`x-label-${i}`}
          x={x}
          y={chartHeight + 20}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {formattedDate}
        </text>
      );
    }
    
    return labels;
  }, [sortedData, chartWidth, chartHeight]);
  
  // Generate y-axis labels
  const yAxisLabels = useMemo(() => {
    const labels = [];
    const labelCount = 5;
    
    for (let i = 0; i <= labelCount; i++) {
      const value = minValue + ((maxValue - minValue) * i) / labelCount;
      const y = yScale(value);
      
      labels.push(
        <text
          key={`y-label-${i}`}
          x={-5}
          y={y}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {Math.round(value)}
        </text>
      );
    }
    
    return labels;
  }, [minValue, maxValue, chartHeight]);
  
  // Generate data points
  const dataPoints = useMemo(() => {
    if (!showTooltip) return null;
    
    return sortedData.map((point, i) => {
      const x = xScale(i);
      const y = yScale(point.value);
      const date = new Date(point.date).toLocaleDateString();
      
      return (
        <g key={`point-${i}`} className="data-point">
          <circle
            cx={x}
            cy={y}
            r={4}
            fill="white"
            stroke={lineColor}
            strokeWidth={2}
            className="cursor-pointer hover:r-5 transition-all duration-200"
          />
          <title>{`${date}: ${point.value}`}</title>
        </g>
      );
    });
  }, [sortedData, showTooltip, chartWidth, chartHeight, lineColor]);
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {/* Grid lines */}
        {gridLines}
        
        {/* Area under the line */}
        <path d={areaPath} fill={areaColor} />
        
        {/* Line */}
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" />
        
        {/* Data points with tooltips */}
        {dataPoints}
        
        {/* X-axis */}
        <line
          x1={0}
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          stroke="#9ca3af"
          strokeWidth={1}
        />
        
        {/* Y-axis */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={chartHeight}
          stroke="#9ca3af"
          strokeWidth={1}
        />
        
        {/* X-axis labels */}
        {xAxisLabels}
        
        {/* Y-axis labels */}
        {yAxisLabels}
        
        {/* Axis labels */}
        {yAxisLabel && (
          <text
            transform={`rotate(-90)`}
            x={-chartHeight / 2}
            y={-30}
            textAnchor="middle"
            fontSize="12"
            fill="#4b5563"
          >
            {yAxisLabel}
          </text>
        )}
        
        {xAxisLabel && (
          <text
            x={chartWidth / 2}
            y={chartHeight + 30}
            textAnchor="middle"
            fontSize="12"
            fill="#4b5563"
          >
            {xAxisLabel}
          </text>
        )}
      </g>
    </svg>
  );
}

export default LineChart;