import api from "./axios";
import type { AnalyticsSummary, TrendDataPoint } from "../types";

export async function getAnalyticsSummary() {
  const { data } = await api.get<AnalyticsSummary>("/analytics/summary");
  return data;
}

export async function getCompletionTrend(days: string) {
  const { data } = await api.get<{ data: TrendDataPoint[] }>("/analytics/completion-trend", {
    params: { days },
  });
  return data;
}

export async function getStatusBreakdown() {
  const { data } = await api.get<{ data: { status: string; count: number }[] }>(
    "/analytics/status-breakdown"
  );
  return data;
}

export async function getOverdueTasks() {
  const { data } = await api.get<{ tasks: any[] }>("/analytics/overdue");
  return data;
}
