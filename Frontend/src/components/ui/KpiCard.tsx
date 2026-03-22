import React from "react";
import MaterialIcon from "./MaterialIcon";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendIcon?: string;
  accentColor?: "primary" | "secondary" | "error" | "tertiary";
  onIconClick?: () => void;
}

const accentMap: Record<string, { hover: string; text: string; icon: string }> = {
  primary: {
    hover: "hover:border-primary/30",
    text: "text-primary",
    icon: "text-primary",
  },
  secondary: {
    hover: "hover:border-primary/30",
    text: "text-primary",
    icon: "text-primary",
  },
  error: {
    hover: "hover:border-error/30",
    text: "text-error",
    icon: "text-error",
  },
  tertiary: {
    hover: "hover:border-tertiary/30",
    text: "text-tertiary",
    icon: "text-tertiary",
  },
};

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendIcon = "trending_up",
  accentColor = "primary",
  onIconClick,
}) => {
  const accent = accentMap[accentColor];

  return (
    <div
      className={`bg-surface-container-lowest p-6 rounded-xl ghost-border ambient-shadow transition-all ${accent.hover}`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
          {label}
        </span>
        <button
          type="button"
          onClick={onIconClick}
          disabled={!onIconClick}
          className={`rounded-full transition-all ${
            onIconClick
              ? "hover:scale-110 active:scale-95 cursor-pointer"
              : "cursor-default"
          }`}
          aria-label={onIconClick ? `View ${label.toLowerCase()}` : undefined}
        >
          <MaterialIcon icon={icon} className={accent.icon} />
        </button>
      </div>
      <div className={`text-3xl font-extrabold tracking-tighter mb-1 text-white`}>
        {value}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${accent.text} font-bold`}>
          <MaterialIcon icon={trendIcon} size="sm" className={accent.text} />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default KpiCard;
