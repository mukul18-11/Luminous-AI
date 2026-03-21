import React from "react";

interface CompletionTrendProps {
  data: { label: string; value: number }[];
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

const CompletionTrend: React.FC<CompletionTrendProps> = ({
  data,
  timeRange = "30",
  onTimeRangeChange,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl ghost-border ambient-shadow">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white">Completion Trend</h3>
          <p className="text-xs text-on-surface-variant font-medium">
            Daily productivity throughput over {timeRange} days
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange?.(e.target.value)}
          className="bg-surface-container-low border border-white/10 rounded-lg text-sm px-4 py-2 font-semibold focus:ring-1 focus:ring-primary/40 text-primary outline-none"
        >
          <option value="30">Last 30 Days</option>
          <option value="7">Last 7 Days</option>
        </select>
      </div>

      {/* Bar Chart */}
      <div className="h-64 w-full relative overflow-hidden rounded-lg flex items-end gap-1">
        {data.map((point, index) => {
          const heightPercent = (point.value / maxValue) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-primary/5 to-primary/60 rounded-t-sm transition-all hover:to-primary/90 cursor-pointer group relative"
              style={{ height: `${Math.max(heightPercent, 5)}%` }}
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {point.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-4 px-2">
        <span className="text-[10px] text-on-surface-variant font-bold">WEEK 1</span>
        <span className="text-[10px] text-on-surface-variant font-bold">WEEK 2</span>
        <span className="text-[10px] text-on-surface-variant font-bold">WEEK 3</span>
        <span className="text-[10px] text-on-surface-variant font-bold">WEEK 4</span>
      </div>
    </div>
  );
};

export default CompletionTrend;
