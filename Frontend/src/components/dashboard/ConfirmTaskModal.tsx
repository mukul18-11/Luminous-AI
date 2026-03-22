import React from "react";
import MaterialIcon from "../ui/MaterialIcon";

interface ParsedTaskData {
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: string;
}

interface ConfirmTaskModalProps {
  isOpen: boolean;
  parsedTask: ParsedTaskData | null;
  clarificationQuestion: string | null;
  clarificationAnswer: string;
  isClarifyListening?: boolean;
  isProcessing?: boolean;
  onConfirm: (task: ParsedTaskData) => void;
  onCancel: () => void;
  onChange: (field: string, value: string) => void;
  onClarificationAnswerChange: (value: string) => void;
  onClarify?: (answer: string) => void;
  onClarifyMicClick?: () => void;
}

const ConfirmTaskModal: React.FC<ConfirmTaskModalProps> = ({
  isOpen,
  parsedTask,
  clarificationQuestion,
  clarificationAnswer,
  isClarifyListening = false,
  isProcessing = false,
  onConfirm,
  onCancel,
  onChange,
  onClarificationAnswerChange,
  onClarify,
  onClarifyMicClick,
}) => {
  if (!isOpen || !parsedTask) return null;

  const handleClarify = () => {
    if (clarificationAnswer.trim() && onClarify) {
      onClarify(clarificationAnswer.trim());
    }
  };

  const handleClarifyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && clarificationAnswer.trim()) {
      handleClarify();
    }
  };

  // Format time for display (HH:MM → 12-hour)
  const formatTimeDisplay = (time: string | null) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

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

        {/* Clarification Question Banner */}
        {clarificationQuestion && (
          <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2 mb-3">
              <MaterialIcon icon="smart_toy" className="text-primary mt-0.5" size="sm" />
              <p className="text-sm text-primary font-medium">{clarificationQuestion}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={clarificationAnswer}
                onChange={(e) => onClarificationAnswerChange(e.target.value)}
                onKeyDown={handleClarifyKeyDown}
                placeholder="Type your answer..."
                className="flex-1 bg-surface-container-high border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                autoFocus
              />
              {onClarifyMicClick && (
                <button
                  type="button"
                  onClick={onClarifyMicClick}
                  className={`px-3 rounded-lg border transition-all ${
                    isClarifyListening
                      ? "border-error/40 bg-error text-black animate-pulse"
                      : "border-primary/20 bg-primary/15 text-primary hover:bg-primary/20"
                  }`}
                  title={isClarifyListening ? "Stop listening" : "Answer by voice"}
                >
                  <MaterialIcon icon={isClarifyListening ? "stop" : "mic"} filled size="sm" />
                </button>
              )}
              <button
                onClick={handleClarify}
                disabled={!clarificationAnswer.trim() || isProcessing}
                className="px-4 py-2 rounded-lg bg-primary text-black text-sm font-bold disabled:opacity-40 hover:shadow-primary/30 hover:shadow-lg transition-all"
              >
                {isProcessing ? "Thinking..." : "Send"}
              </button>
            </div>
            {isClarifyListening && (
              <p className="mt-2 text-xs text-primary font-semibold">Listening for your answer...</p>
            )}
          </div>
        )}

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

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">
                Due Time
              </label>
              <input
                type="time"
                value={parsedTask.dueTime || ""}
                onChange={(e) => onChange("dueTime", e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              />
              {parsedTask.dueTime && (
                <p className="text-[10px] text-primary mt-1 font-medium">
                  {formatTimeDisplay(parsedTask.dueTime)}
                </p>
              )}
            </div>
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
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-lg bg-primary text-black font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            {isProcessing ? "Saving..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTaskModal;
