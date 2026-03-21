import React from "react";
import MaterialIcon from "../ui/MaterialIcon";
import type { Task } from "../../types";

interface TaskCardProps {
  task: Task;
  variant?: "featured" | "standard";
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelay?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const priorityBadge: Record<string, string> = {
  high: "bg-error/20 text-error",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-primary/20 text-primary",
};

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-on-surface-variant/20 text-on-surface-variant",
  delayed: "bg-error/20 text-error",
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  variant = "standard",
  onComplete,
  onCancel,
  onDelay,
  onDelete,
}) => {
  const isFeatured = variant === "featured";
  const isActionable = task.status === "pending" || task.status === "delayed";

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
    <div
      className={`
        bg-surface-container-lowest rounded-xl border border-white/5 shadow-lg
        hover:border-primary/30 transition-all group flex flex-col justify-between
        ${isFeatured ? "p-8 shadow-2xl min-h-[200px]" : "p-6"}
      `}
    >
      {/* Top Section */}
      <div>
        <div className="flex justify-between items-start mb-3">
          {/* Status + Priority Badges */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${statusBadge[task.status]}`}>
              {task.status}
            </span>
            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${priorityBadge[task.priority]}`}>
              {task.priority}
            </span>
          </div>

          {/* Menu */}
          {onDelete && (
            <button
              onClick={() => onDelete(task._id)}
              className="text-on-surface-variant/40 hover:text-error transition-colors"
            >
              <MaterialIcon icon="delete" size="sm" />
            </button>
          )}
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-on-surface leading-tight mb-2 ${
            isFeatured ? "text-3xl mb-4" : "text-lg"
          } ${task.status === "completed" ? "line-through opacity-50" : ""}`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-4">
        {/* Due Date & Time */}
        <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-4">
          <MaterialIcon icon="calendar_today" size="sm" />
          <span>{formatDate(task.dueDate)}</span>
          {task.dueTime && (
            <>
              <MaterialIcon icon="schedule" size="sm" />
              <span>{formatTime(task.dueTime)}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {isActionable && (
          <div className="flex items-center gap-2 flex-wrap">
            {onComplete && (
              <button
                onClick={() => onComplete(task._id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
              >
                <MaterialIcon icon="check_circle" size="sm" />
                Complete
              </button>
            )}
            {onDelay && (
              <button
                onClick={() => onDelay(task._id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-bold hover:bg-yellow-500/20 transition-all"
              >
                <MaterialIcon icon="schedule" size="sm" />
                Delay
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => onCancel(task._id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error/10 text-error text-xs font-bold hover:bg-error/20 transition-all"
              >
                <MaterialIcon icon="cancel" size="sm" />
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
