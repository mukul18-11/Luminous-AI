import api from "./axios";
import type { AnalyticsSummary, ParsedVoiceTask, Task } from "../types";

export async function getTasks(status = "all") {
  const { data } = await api.get<{ tasks: Task[] }>("/tasks", {
    params: { status },
  });
  return data;
}

export async function parseVoiceTask(
  transcript: string,
  conversationHistory: { role: string; content: string }[] = []
) {
  const { data } = await api.post<ParsedVoiceTask>("/tasks/parse-voice", {
    transcript,
    conversationHistory,
  });
  return data;
}

interface TaskMutationResponse {
  task: Task;
  analytics: AnalyticsSummary;
}

export async function createTask(payload: {
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: string;
  voiceInput: string | null;
}) {
  const { data } = await api.post<TaskMutationResponse>("/tasks", payload);
  return data;
}

export async function completeTask(id: string) {
  const { data } = await api.patch<TaskMutationResponse>(`/tasks/${id}/complete`);
  return data;
}

export async function cancelTask(id: string) {
  const { data } = await api.patch<TaskMutationResponse>(`/tasks/${id}/cancel`);
  return data;
}

export async function delayTask(id: string, newDueDate: string) {
  const { data } = await api.patch<TaskMutationResponse>(`/tasks/${id}/delay`, {
    newDueDate,
  });
  return data;
}

export async function deleteTask(id: string) {
  const { data } = await api.delete<{ message: string; analytics: AnalyticsSummary }>(
    `/tasks/${id}`
  );
  return data;
}
