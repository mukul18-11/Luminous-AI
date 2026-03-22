import React from "react";
import MaterialIcon from "../ui/MaterialIcon";
import type { Task } from "../../types";

interface TasksOverviewModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  accentClass?: string;
  statusLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  tasks: Task[];
  isLoading?: boolean;
  onClose: () => void;
}

const TasksOverviewModal: React.FC<TasksOverviewModalProps> = ({
  isOpen,
  title,
  subtitle,
  accentClass = "text-primary",
  statusLabel,
  emptyTitle,
  emptyDescription,
  tasks,
  isLoading = false,
  onClose,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No due date";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs uppercase tracking-[0.28em] font-bold ${accentClass}`}>
              {statusLabel}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-white">{title}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-white"
            aria-label={`Close ${title}`}
          >
            <MaterialIcon icon="close" size="sm" />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          {isLoading && (
            <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-8 text-center text-sm text-on-surface-variant">
              Loading tasks...
            </div>
          )}

          {!isLoading && tasks.length === 0 && (
            <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-8 text-center">
              <p className="text-lg font-bold text-white">{emptyTitle}</p>
              <p className="mt-2 text-sm text-on-surface-variant">{emptyDescription}</p>
            </div>
          )}

          {!isLoading &&
            tasks.map((task) => (
              <div
                key={task._id}
                className="rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-all hover:border-primary/20"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">{task.title}</h4>
                    {task.description && (
                      <p className="mt-1 text-sm text-on-surface-variant">{task.description}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-yellow-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-300">
                    {task.priority}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5">
                    <MaterialIcon icon="calendar_today" size="sm" />
                    {formatDate(task.dueDate)}
                  </span>
                  {task.dueTime && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5">
                      <MaterialIcon icon="schedule" size="sm" />
                      {formatTime(task.dueTime)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
                    <MaterialIcon icon="task_alt" size="sm" />
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TasksOverviewModal;
