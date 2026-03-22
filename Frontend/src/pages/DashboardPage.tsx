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
    dueTime: "17:00",
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
    dueTime: null,
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
    dueTime: null,
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

interface ParsedTaskData {
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isListening, setIsListening] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [parsedTask, setParsedTask] = useState<ParsedTaskData | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);
  const [_conversationHistory, setConversationHistory] = useState<
    { role: string; content: string }[]
  >([]);

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

    // Simulate AI-parsed voice data (will be replaced with actual API call)
    // For now, simulate the LLM deciding if clarification is needed
    const lowerInput = inputValue.toLowerCase();
    const vagueTimeWords = ["evening", "afternoon", "morning", "later", "night", "noon"];
    const hasVagueTime = vagueTimeWords.some((w) => lowerInput.includes(w));
    const hasExactTime = /\d{1,2}(:\d{2})?\s*(am|pm)/i.test(lowerInput) || /at\s+\d{1,2}/i.test(lowerInput);

    // Map vague time to approximate HH:MM
    let approxTime: string | null = null;
    if (lowerInput.includes("morning")) approxTime = "09:00";
    else if (lowerInput.includes("noon")) approxTime = "12:00";
    else if (lowerInput.includes("afternoon")) approxTime = "14:00";
    else if (lowerInput.includes("evening")) approxTime = "18:00";
    else if (lowerInput.includes("night")) approxTime = "21:00";

    // Extract exact time if present
    const timeMatch = lowerInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3].toLowerCase();
      if (period === "pm" && hours < 12) hours += 12;
      if (period === "am" && hours === 12) hours = 0;
      approxTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }

    const parsed: ParsedTaskData = {
      title: inputValue,
      description: "",
      dueDate: null,
      dueTime: approxTime,
      priority: "medium",
    };

    setParsedTask(parsed);
    setConversationHistory([{ role: "user", content: inputValue }]);

    if (hasVagueTime && !hasExactTime) {
      const timeWord = vagueTimeWords.find((w) => lowerInput.includes(w)) || "that time";
      setClarificationQuestion(
        `Could you specify the exact time in the ${timeWord}? For now, I've set it to ${formatTime12(approxTime)}.`
      );
    } else {
      setClarificationQuestion(null);
    }

    setShowConfirmModal(true);
  };

  // Handle user answering a clarification question
  const handleClarify = (answer: string) => {
    // Parse the answer for a time
    const timeMatch = answer.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch && parsedTask) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3].toLowerCase();
      if (period === "pm" && hours < 12) hours += 12;
      if (period === "am" && hours === 12) hours = 0;
      const newTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      setParsedTask({ ...parsedTask, dueTime: newTime });
      setClarificationQuestion(null);
    } else {
      // Couldn't parse, ask again
      setClarificationQuestion(
        `I couldn't understand the time. Please specify like "3:30 PM" or "5 PM".`
      );
    }

    setConversationHistory((prev) => [...prev, { role: "user", content: answer }]);
  };

  const handleConfirmTask = (task: ParsedTaskData) => {
    const newTask: Task = {
      _id: Date.now().toString(),
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
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
    setClarificationQuestion(null);
    setConversationHistory([]);
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

  const closeModal = () => {
    setShowConfirmModal(false);
    setParsedTask(null);
    setClarificationQuestion(null);
    setConversationHistory([]);
  };

  return (
    <>
      <Navbar userName={userName} onLogout={() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userName");
        navigate("/login");
      }} />

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

      {/* Confirm Modal with Clarification */}
      <ConfirmTaskModal
        isOpen={showConfirmModal}
        parsedTask={parsedTask}
        clarificationQuestion={clarificationQuestion}
        onConfirm={handleConfirmTask}
        onCancel={closeModal}
        onChange={handleParsedTaskChange}
        onClarify={handleClarify}
      />
    </>
  );
};

// Helper: convert HH:MM to 12-hour display
function formatTime12(time: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default DashboardPage;
