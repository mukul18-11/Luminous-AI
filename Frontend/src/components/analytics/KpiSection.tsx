import React from "react";
import KpiCard from "../ui/KpiCard";

interface KpiSectionProps {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  trendText?: string;
}

const KpiSection: React.FC<KpiSectionProps> = ({
  total,
  completed,
  pending,
  overdue,
  completionRate,
  trendText = "12% from last month",
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <KpiCard
        label="Total Tasks"
        value={total.toLocaleString()}
        icon="analytics"
        trend={trendText}
        trendIcon="trending_up"
        accentColor="primary"
      />
      <KpiCard
        label="Completed"
        value={completed.toLocaleString()}
        icon="check_circle"
        trend={`${completionRate}% overall rate`}
        trendIcon="bolt"
        accentColor="secondary"
      />
      <KpiCard
        label="Pending"
        value={pending.toLocaleString()}
        icon="pending"
        trend="Awaiting action"
        trendIcon="schedule"
        accentColor="tertiary"
      />
      <KpiCard
        label="Overdue"
        value={overdue.toLocaleString()}
        icon="priority_high"
        trend="Needs immediate attention"
        trendIcon="warning"
        accentColor="error"
      />
    </div>
  );
};

export default KpiSection;
