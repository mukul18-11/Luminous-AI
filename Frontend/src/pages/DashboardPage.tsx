import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import HeroGreeting from "../components/dashboard/HeroGreeting";
import VoiceInput from "../components/dashboard/VoiceInput";
import TaskList from "../components/dashboard/TaskList";
import ConfirmTaskModal from "../components/dashboard/ConfirmTaskModal";
import FilterTabs from "../components/ui/FilterTabs";
import type { Task, TaskStatus } from "../types";

// Demo tasks for initial UI
const DEMO_TASKS: Task[] = [
  {
    _id: "1",
    title: "Take Jimmy out for a walk in the evening at 5pm",
    description: "Don't forget the leash and water bottle",
    dueDate: new Date().toISOString(),
    priority: "high",
    status: "pending",
    completedAt: null,
    delayedTo: null,
    originalDueDate: null,
    voiceInput: "Take Jimmy out for a walk in the evening at 5pm",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "Submit quarterly report",
    description: "Q1 financials need to be reviewed by the team lead",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    status: "pending",
    completedAt: null,
    delayedTo: null,
    originalDueDate: null,
    voiceInput: "Remind me to submit the quarterly report by next Friday",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "3",
    title: "Buy groceries",
    description: "",
    dueDate: null,
    priority: "medium",
    status: "pending",
    completedAt: null,
    delayedTo: null,
    originalDueDate: null,
    voiceInput: "Buy groceries",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Delayed", value: "delayed" },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isListening, setIsListening] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [parsedTask, setParsedTask] = useState<{
    title: string;
    description: string;
    dueDate: string | null;
    priority: string;
  } | null>(null);

  // Filter tasks
  const filteredTasks =
    activeFilter === "all"
      ? tasks
      : tasks.filter((t) => t.status === activeFilter);

  // Handlers
  const handleMicClick = () => {
    // TODO: integrate Web Speech API via useVoiceInput hook
    setIsListening(!isListening);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return;
    // Simulate parsed voice data — will be replaced with OpenAI API call
    setParsedTask({
      title: inputValue,
      description: "",
      dueDate: null,
      priority: "medium",
    });
    setShowConfirmModal(true);
  };

  const handleConfirmTask = (task: {
    title: string;
    description: string;
    dueDate: string | null;
    priority: string;
  }) => {
    const newTask: Task = {
      _id: Date.now().toString(),
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority as Task["priority"],
      status: "pending",
      completedAt: null,
      delayedTo: null,
      originalDueDate: null,
      voiceInput: inputValue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setInputValue("");
    setShowConfirmModal(false);
    setParsedTask(null);
  };

  const handleComplete = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t._id === id
          ? { ...t, status: "completed" as TaskStatus, completedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const handleCancel = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t._id === id ? { ...t, status: "cancelled" as TaskStatus } : t
      )
    );
  };

  const handleDelay = (id: string) => {
    // TODO: show date picker modal
    setTasks(
      tasks.map((t) =>
        t._id === id ? { ...t, status: "delayed" as TaskStatus } : t
      )
    );
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((t) => t._id !== id));
  };

  const handleParsedTaskChange = (field: string, value: string) => {
    if (parsedTask) {
      setParsedTask({ ...parsedTask, [field]: value || null });
    }
  };

  return (
    <>
      <Navbar userName={userName} onLogout={() => { localStorage.removeItem("userName"); navigate("/login"); }} />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <HeroGreeting userName={userName} />

        <VoiceInput
          value={inputValue}
          onChange={setInputValue}
          onMicClick={handleMicClick}
          onSubmit={handleInputSubmit}
          isListening={isListening}
        />

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <FilterTabs
            tabs={FILTER_TABS}
            activeTab={activeFilter}
            onTabChange={setActiveFilter}
          />
        </div>

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          onComplete={handleComplete}
          onCancel={handleCancel}
          onDelay={handleDelay}
          onDelete={handleDelete}
        />
      </main>

      {/* Confirm Modal */}
      <ConfirmTaskModal
        isOpen={showConfirmModal}
        parsedTask={parsedTask}
        onConfirm={handleConfirmTask}
        onCancel={() => {
          setShowConfirmModal(false);
          setParsedTask(null);
        }}
        onChange={handleParsedTaskChange}
      />
    </>
  );
};

export default DashboardPage;
