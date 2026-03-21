import React from "react";
import TaskCard from "./TaskCard";
import type { Task } from "../../types";

interface TaskListProps {
  tasks: Task[];
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelay?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onComplete, onCancel, onDelay, onDelete }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
        <span className="material-symbols-outlined text-6xl mb-4 opacity-30">task_alt</span>
        <p className="text-lg font-bold mb-1">No tasks yet</p>
        <p className="text-sm opacity-60">Use the voice input above to create your first task</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {tasks.map((task, index) => (
        <div
          key={task._id}
          className={index === 0 ? "md:col-span-12" : "md:col-span-6"}
        >
          <TaskCard
            task={task}
            variant={index === 0 ? "featured" : "standard"}
            onComplete={onComplete}
            onCancel={onCancel}
            onDelay={onDelay}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList;
