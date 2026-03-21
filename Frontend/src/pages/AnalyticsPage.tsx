import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import KpiSection from "../components/analytics/KpiSection";
import CompletionTrend from "../components/analytics/CompletionTrend";
import StatusBreakdown from "../components/analytics/StatusBreakdown";

// Demo data — will be replaced by API calls
const DEMO_TREND_DATA = [
  { label: "Day 1", value: 4 },
  { label: "Day 2", value: 7 },
  { label: "Day 3", value: 5 },
  { label: "Day 4", value: 9 },
  { label: "Day 5", value: 6 },
  { label: "Day 6", value: 10 },
  { label: "Day 7", value: 4 },
  { label: "Day 8", value: 8 },
  { label: "Day 9", value: 5 },
  { label: "Day 10", value: 12 },
  { label: "Day 11", value: 6 },
  { label: "Day 12", value: 9 },
];

const DEMO_STATUS_ITEMS = [
  { label: "Completed", percentage: 60, color: "#00FF41" },
  { label: "Pending", percentage: 25, color: "#00D1FF" },
  { label: "Delayed", percentage: 10, color: "#efb8c8" },
  { label: "Cancelled", percentage: 5, color: "#ef4444" },
];

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const [timeRange, setTimeRange] = useState("30");

  return (
    <>
      <Navbar userName={userName} onLogout={() => { localStorage.removeItem("userName"); navigate("/login"); }} />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white font-headline">
            Intelligence Hub
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Detailed performance metrics and AI-driven productivity insights distilled from your voice interactions.
          </p>
        </div>

        {/* KPI Cards */}
        <KpiSection
          total={1284}
          completed={942}
          pending={214}
          overdue={128}
          completionRate={73}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8">
            <CompletionTrend
              data={DEMO_TREND_DATA}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </div>
          <div className="lg:col-span-4">
            <StatusBreakdown items={DEMO_STATUS_ITEMS} total={1284} />
          </div>
        </div>
      </main>
    </>
  );
};

export default AnalyticsPage;
