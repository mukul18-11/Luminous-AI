import React from "react";

interface BreakdownItem {
  label: string;
  percentage: number;
  color: string;
}

interface StatusBreakdownProps {
  items: BreakdownItem[];
  total: number;
}

const StatusBreakdown: React.FC<StatusBreakdownProps> = ({ items, total }) => {
  // Build SVG donut segments
  let cumulativeOffset = 0;
  const segments = items.map((item) => {
    const segment = {
      ...item,
      dashArray: `${item.percentage} ${100 - item.percentage}`,
      dashOffset: -cumulativeOffset,
    };
    cumulativeOffset += item.percentage;
    return segment;
  });

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl ghost-border ambient-shadow flex flex-col items-center">
      <h3 className="text-lg font-bold tracking-tight mb-8 self-start text-white">
        Status Breakdown
      </h3>

      {/* Donut Chart */}
      <div className="relative w-48 h-48 mb-8">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
          />
          {/* Data segments */}
          {segments.map((seg, index) => (
            <circle
              key={index}
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke={seg.color}
              strokeWidth="4"
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}
          </span>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-on-surface-variant">
                {item.label}
              </span>
            </div>
            <span className="text-sm font-bold text-white">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBreakdown;
