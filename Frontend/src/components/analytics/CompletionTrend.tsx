import React from "react";

interface CompletionTrendProps {
  data: { label: string; value: number }[];
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

const SCALE_MAX = 20;

const formatLabel = (label: string) => {
  const date = new Date(label);
  return {
    day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    date: date.toLocaleDateString("en-US", { day: "numeric" }),
    short: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
};

const CompletionTrend: React.FC<CompletionTrendProps> = ({
  data,
  timeRange = "30",
  onTimeRangeChange,
}) => {
  const showCompactLabels = data.length > 7;
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

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

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="h-72 w-full relative overflow-hidden rounded-xl border border-white/6 bg-gradient-to-b from-white/[0.01] to-transparent px-3 pt-5 pb-8">
          <div className="absolute inset-x-3 inset-y-5 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3].map((line) => (
              <div key={line} className="border-t border-white/[0.05]" />
            ))}
          </div>

          <div className="relative z-10 h-full flex items-end gap-2">
            {data.map((point) => {
              const barHeight = point.value > 0 ? Math.max((point.value / SCALE_MAX) * 100, 5) : 2;
              const { day, date, short } = formatLabel(point.label);

              return (
                <div key={point.label} className="flex-1 h-full flex flex-col justify-end items-center group">
                  <div className="relative w-full h-full flex items-end justify-center">
                    <div
                      className="w-full max-w-[34px] rounded-t-xl bg-gradient-to-t from-primary/35 via-primary/70 to-primary shadow-[0_0_14px_rgba(0,255,65,0.18)] transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(0,255,65,0.32)]"
                      style={{ height: `${barHeight}%` }}
                    />
                    <div className="absolute -top-9 rounded-full border border-white/10 bg-black/85 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                      {point.value} task{point.value === 1 ? "" : "s"}
                    </div>
                  </div>

                  {!showCompactLabels && (
                    <div className="mt-3 flex flex-col items-center gap-1">
                      <span className="min-w-[34px] rounded-full border border-white/20 bg-surface-container-high px-2 py-1 text-[11px] font-semibold text-white">
                        {date}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold tracking-[0.18em] text-primary">
                        {day}
                      </span>
                    </div>
                  )}

                  {showCompactLabels && point.label === lastPoint?.label && (
                    <div className="mt-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-primary">
                        TODAY
                      </span>
                    </div>
                  )}

                  {showCompactLabels && (
                    <div className="sr-only">
                      {short}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {showCompactLabels && firstPoint && lastPoint && (
          <div className="mt-4 flex items-center justify-between text-[11px] font-semibold">
            <span className="rounded-full border border-white/10 bg-surface-container-high px-3 py-1 text-on-surface-variant">
              {formatLabel(firstPoint.label).short}
            </span>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              {formatLabel(lastPoint.label).short}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletionTrend;
