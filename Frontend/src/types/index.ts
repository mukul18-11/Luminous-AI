export type TaskStatus = "pending" | "completed" | "cancelled" | "delayed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt: string | null;
  delayedTo: string | null;
  originalDueDate: string | null;
  voiceInput: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface KpiData {
  label: string;
  value: number | string;
  icon: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  accentColor?: "primary" | "secondary" | "error" | "tertiary";
}

export interface AnalyticsSummary {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  delayed: number;
  completedOnTime: number;
  completedLate: number;
  overdue: number;
}

export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface StatusBreakdownItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}
