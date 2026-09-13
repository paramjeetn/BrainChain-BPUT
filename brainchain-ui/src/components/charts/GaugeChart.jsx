import React from 'react';

export const GaugeChart = ({
  value = 0,
  min = 0,
  max = 100,
  label = 'Level',
  unit = '%',
  color = '#3b82f6',
  size = 140,
  strokeWidth = 12
}) => {
  // Clamp value between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = Math.round(((clampedValue - min) / (max - min)) * 100);

  // SVG Gauge calculations (semi-circle / 240-degree arc)
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use 180-degree semi circle
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size * 0.85 }}>
      <svg width={size} height={size * 0.85} className="overflow-visible">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />
        {/* Filled Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          {percentage}
          <span className="text-xs font-normal text-gray-500 ml-0.5">{unit}</span>
        </span>
        {label && (
          <span className="text-[11px] font-medium text-gray-500 -mt-0.5 tracking-wide">
            {label}
          </span>
        )}
      </div>

      {/* Min & Max labels */}
      <div className="w-full flex justify-between px-2 text-[10px] text-gray-500 -mt-3">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export default GaugeChart;
