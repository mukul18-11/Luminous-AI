import React from "react";
import MaterialIcon from "../ui/MaterialIcon";

interface ConfirmTaskModalProps {
  isOpen: boolean;
  parsedTask: {
    title: string;
    description: string;
    dueDate: string | null;
    priority: string;
  } | null;
  onConfirm: (task: { title: string; description: string; dueDate: string | null; priority: string }) => void;
  onCancel: () => void;
  onChange: (field: string, value: string) => void;
}

const ConfirmTaskModal: React.FC<ConfirmTaskModalProps> = ({
  isOpen,
  parsedTask,
  onConfirm,
  onCancel,
  onChange,
}) => {
  if (!isOpen || !parsedTask) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-md ambient-shadow">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <MaterialIcon icon="auto_awesome" className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Confirm Task</h3>
            <p className="text-xs text-on-surface-variant">Review the AI-extracted details</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">
              Title
            </label>
            <input
              type="text"
              value={parsedTask.title}
              onChange={(e) => onChange("title", e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">
              Description
            </label>
            <textarea
              value={parsedTask.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={2}
              className="w-full bg-surface-container-high border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">
              Due Date
            </label>
            <input
              type="date"
              value={parsedTask.dueDate || ""}
              onChange={(e) => onChange("dueDate", e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">
              Priority
            </label>
            <select
              value={parsedTask.priority}
              onChange={(e) => onChange("priority", e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-on-surface-variant font-semibold text-sm hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(parsedTask)}
            className="flex-1 py-2.5 rounded-lg bg-primary text-black font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTaskModal;
