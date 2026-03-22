import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import KpiSection from "../components/analytics/KpiSection";
import CompletionTrend from "../components/analytics/CompletionTrend";
import StatusBreakdown from "../components/analytics/StatusBreakdown";
import {
  getAnalyticsSummary,
  getCompletionTrend,
  getStatusBreakdown,
} from "../api/analytics";
import type { AnalyticsSummary, StatusBreakdownItem } from "../types";

const defaultSummary: AnalyticsSummary = {
  total: 0,
  completed: 0,
  pending: 0,
  cancelled: 0,
  delayed: 0,
  completedOnTime: 0,
  completedLate: 0,
  overdue: 0,
};

const statusColorMap: Record<string, string> = {
  completed: "#00FF41",
  pending: "#00D1FF",
  delayed: "#efb8c8",
  cancelled: "#ef4444",
};

const prettifyStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const [timeRange, setTimeRange] = useState("30");
  const [summary, setSummary] = useState<AnalyticsSummary>(defaultSummary);
  const [trendData, setTrendData] = useState<{ label: string; value: number }[]>([]);
  const [statusItems, setStatusItems] = useState<StatusBreakdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);

      try {
        const [summaryResponse, trendResponse, statusResponse] = await Promise.all([
          getAnalyticsSummary(),
          getCompletionTrend(timeRange),
          getStatusBreakdown(),
        ]);

        setSummary(summaryResponse);
        setTrendData(
          trendResponse.data.map((point) => ({
            label: point.date,
            value: point.count,
          }))
        );

        const totalCount = statusResponse.data.reduce((sum, item) => sum + item.count, 0);
        const mappedStatusItems = statusResponse.data
          .filter((item) => item.count > 0)
          .map((item) => ({
            label: prettifyStatus(item.status),
            value: item.count,
            percentage: totalCount === 0 ? 0 : Math.round((item.count / totalCount) * 100),
            color: statusColorMap[item.status] || "#ffffff",
          }));

        setStatusItems(mappedStatusItems);
        setAnalyticsError(null);
      } catch {
        setAnalyticsError("I couldn't load analytics from the backend right now.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnalytics();
  }, [timeRange]);

  const completionRate = useMemo(() => {
    if (!summary.total) return 0;
    return Math.round((summary.completed / summary.total) * 100);
  }, [summary.completed, summary.total]);

  return (
    <>
      <Navbar
        userName={userName}
        onLogout={() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userName");
          navigate("/login");
        }}
      />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white font-headline">
            Intelligence Hub
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Detailed performance metrics and AI-driven productivity insights distilled from your
            live task activity.
          </p>
        </div>

        {analyticsError && (
          <div className="mb-6 rounded-xl border border-error/30 bg-error/10 px-5 py-4 text-sm text-error font-medium">
            {analyticsError}
          </div>
        )}

        <KpiSection
          total={summary.total}
          completed={summary.completed}
          pending={summary.pending}
          overdue={summary.overdue}
          completionRate={completionRate}
          trendText={
            summary.completedOnTime > 0
              ? `${summary.completedOnTime} completed on time`
              : "Live from your database"
          }
        />

        {isLoading ? (
          <div className="py-24 text-center text-on-surface-variant">Loading analytics...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-8">
              <CompletionTrend
                data={trendData}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            </div>
            <div className="lg:col-span-4">
              <StatusBreakdown items={statusItems} total={summary.total} />
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default AnalyticsPage;
