import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import HeroGreeting from "../components/dashboard/HeroGreeting";
import VoiceInput from "../components/dashboard/VoiceInput";
import TaskList from "../components/dashboard/TaskList";
import ConfirmTaskModal from "../components/dashboard/ConfirmTaskModal";
import FilterTabs from "../components/ui/FilterTabs";
import {
  cancelTask,
  completeTask,
  createTask,
  deleteTask,
  delayTask,
  getTasks,
  parseVoiceTask,
} from "../api/tasks";
import { logout } from "../api/auth";
import type { ParsedVoiceTask, Task } from "../types";

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Delayed", value: "delayed" },
  { label: "Cancelled", value: "cancelled" },
];

type RecognitionMode = "compose" | "clarification";
type ConversationEntry = { role: string; content: string };

interface ParsedTaskData {
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: "low" | "medium" | "high";
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
};

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const emptyParsedTask = (): ParsedTaskData => ({
  title: "",
  description: "",
  dueDate: null,
  dueTime: null,
  priority: "medium",
});

const mergeParsedTask = (
  previous: ParsedTaskData | null,
  next: ParsedVoiceTask,
  fallbackTitle: string
): ParsedTaskData => ({
  title: next.title || next.refinedText || previous?.title || fallbackTitle,
  description: next.description || previous?.description || "",
  dueDate: next.dueDate ?? previous?.dueDate ?? null,
  dueTime: next.dueTime ?? previous?.dueTime ?? null,
  priority: next.priority || previous?.priority || "medium",
});

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [clarificationInput, setClarificationInput] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isListening, setIsListening] = useState(false);
  const [listeningMode, setListeningMode] = useState<RecognitionMode | null>(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [parsedTask, setParsedTask] = useState<ParsedTaskData | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recognitionModeRef = useRef<RecognitionMode | null>(null);
  const transcriptRef = useRef("");
  const silenceTimerRef = useRef<number | null>(null);
  const shouldSubmitOnEndRef = useRef(false);
  const speechEnabledRef = useRef(true);
  const conversationHistoryRef = useRef<ConversationEntry[]>([]);

  useEffect(() => {
    conversationHistoryRef.current = conversationHistory;
  }, [conversationHistory]);

  const filteredTasks = useMemo(() => {
    if (activeFilter === "all") {
      return tasks;
    }

    return tasks.filter((task) => task.status === activeFilter);
  }, [activeFilter, tasks]);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const syncConversationHistory = (nextHistory: ConversationEntry[]) => {
    conversationHistoryRef.current = nextHistory;
    setConversationHistory(nextHistory);
  };

  const stopRecognition = (shouldSubmit = false) => {
    if (!recognitionRef.current) return;

    shouldSubmitOnEndRef.current = shouldSubmit;
    clearSilenceTimer();

    try {
      recognitionRef.current.stop();
    } catch {
      setIsListening(false);
      setListeningMode(null);
    }
  };

  const scheduleSilenceStop = () => {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      stopRecognition(true);
    }, 2000);
  };

  const ensureRecognition = () => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const speechWindow = window as SpeechWindow;
    const SpeechRecognitionCtor =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setFeedbackMessage("This browser does not support voice recognition. Please type the task.");
      return null;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      transcriptRef.current = transcript;

      if (recognitionModeRef.current === "clarification") {
        setClarificationInput(transcript);
      } else {
        setInputValue(transcript);
      }

      if (transcript) {
        scheduleSilenceStop();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        setFeedbackMessage("Voice recognition ran into a problem. Please try again.");
      }
      setIsListening(false);
      setListeningMode(null);
      clearSilenceTimer();
    };

    recognition.onend = () => {
      clearSilenceTimer();
      const completedMode = recognitionModeRef.current;
      const shouldSubmit = shouldSubmitOnEndRef.current;
      const transcript = transcriptRef.current.trim();

      recognitionModeRef.current = null;
      shouldSubmitOnEndRef.current = false;
      setIsListening(false);
      setListeningMode(null);

      if (shouldSubmit && transcript && completedMode) {
        void handleTranscriptSubmission(transcript, completedMode);
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const startRecognition = (mode: RecognitionMode) => {
    const recognition = ensureRecognition();

    if (!recognition) {
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    clearSilenceTimer();
    shouldSubmitOnEndRef.current = false;
    recognitionModeRef.current = mode;
    transcriptRef.current = "";

    if (mode === "clarification") {
      setClarificationInput("");
    } else {
      setInputValue("");
    }

    setFeedbackMessage(null);
    setIsListening(true);
    setListeningMode(mode);

    try {
      recognition.start();
    } catch {
      try {
        recognition.stop();
        recognition.start();
      } catch {
        setIsListening(false);
        setListeningMode(null);
        setFeedbackMessage("I could not start listening right now. Please try again.");
      }
    }
  };

  const speakClarification = (question: string) => {
    if (!window.speechSynthesis || !speechEnabledRef.current) {
      window.setTimeout(() => startRecognition("clarification"), 250);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (clarificationQuestion === question || showConfirmModal) {
        startRecognition("clarification");
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const loadTasks = async (activeStatus = "all") => {
    setIsLoadingTasks(true);
    try {
      const { tasks: fetchedTasks } = await getTasks(activeStatus);
      setTasks(fetchedTasks);
      setFeedbackMessage(null);
    } catch {
      setFeedbackMessage("I couldn't load your tasks from the backend. Please check the server.");
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    void loadTasks("all");

    return () => {
      clearSilenceTimer();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      try {
        recognitionRef.current?.stop();
      } catch {
        // noop
      }
    };
  }, []);

  useEffect(() => {
    if (clarificationQuestion) {
      speakClarification(clarificationQuestion);
    }
  }, [clarificationQuestion]);

  const handleTranscriptSubmission = async (transcript: string, mode: RecognitionMode) => {
    if (!transcript.trim()) return;

    setIsProcessingVoice(true);
    setFeedbackMessage(null);

    try {
      const parsed = await parseVoiceTask(transcript, conversationHistoryRef.current);
      const mergedTask = mergeParsedTask(parsedTask, parsed, transcript);
      const nextHistory: ConversationEntry[] = [
        ...conversationHistoryRef.current,
        { role: "user", content: transcript },
      ];

      if (parsed.clarificationNeeded && parsed.clarificationQuestion) {
        nextHistory.push({ role: "assistant", content: parsed.clarificationQuestion });
      }

      syncConversationHistory(nextHistory);
      setParsedTask(mergedTask);
      setShowConfirmModal(true);

      if (mode === "compose") {
        setInputValue(parsed.refinedText || transcript);
      } else {
        setClarificationInput("");
      }

      if (parsed.clarificationNeeded && parsed.clarificationQuestion) {
        setClarificationQuestion(parsed.clarificationQuestion);
      } else {
        setClarificationQuestion(null);
      }
    } catch {
      setFeedbackMessage("I couldn't process that task with AI right now. Please try again.");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopRecognition(true);
      return;
    }

    startRecognition("compose");
  };

  const handleClarifyMicClick = () => {
    if (isListening && listeningMode === "clarification") {
      stopRecognition(true);
      return;
    }

    startRecognition("clarification");
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return;
    void handleTranscriptSubmission(inputValue.trim(), "compose");
  };

  const handleClarify = (answer: string) => {
    if (!answer.trim()) return;
    void handleTranscriptSubmission(answer.trim(), "clarification");
  };

  const handleConfirmTask = async (task: ParsedTaskData) => {
    setIsProcessingVoice(true);

    try {
      const { task: createdTask } = await createTask({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        priority: task.priority,
        voiceInput: inputValue || task.title,
      });

      setTasks((prev) => [createdTask, ...prev]);
      setInputValue("");
      setClarificationInput("");
      setClarificationQuestion(null);
      setParsedTask(null);
      setShowConfirmModal(false);
      syncConversationHistory([]);
      setFeedbackMessage("Task added successfully.");
    } catch {
      setFeedbackMessage("I couldn't save the task. Please try again.");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const replaceTaskInState = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
  };

  const handleComplete = async (id: string) => {
    try {
      const { task } = await completeTask(id);
      replaceTaskInState(task);
    } catch {
      setFeedbackMessage("I couldn't mark that task as completed.");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const { task } = await cancelTask(id);
      replaceTaskInState(task);
    } catch {
      setFeedbackMessage("I couldn't cancel that task.");
    }
  };

  const handleDelay = async (id: string) => {
    const newDueDate = window.prompt("Enter the new due date in YYYY-MM-DD format:");

    if (!newDueDate) return;

    try {
      const { task } = await delayTask(id, newDueDate);
      replaceTaskInState(task);
    } catch {
      setFeedbackMessage("I couldn't delay that task. Please use YYYY-MM-DD.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch {
      setFeedbackMessage("I couldn't delete that task.");
    }
  };

  const handleParsedTaskChange = (field: string, value: string) => {
    setParsedTask((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value || null,
      };
    });
  };

  const closeModal = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    stopRecognition(false);
    setShowConfirmModal(false);
    setParsedTask(null);
    setClarificationInput("");
    setClarificationQuestion(null);
    syncConversationHistory([]);
  };

  return (
    <>
      <Navbar
        userName={userName}
        onLogout={() => {
      void logout().finally(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userName");
        navigate("/login");
      });
        }}
      />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <HeroGreeting userName={userName} />

        <VoiceInput
          value={inputValue}
          onChange={setInputValue}
          onMicClick={handleMicClick}
          onSubmit={handleInputSubmit}
          isListening={isListening && listeningMode === "compose"}
          placeholder="Say a task or type one here..."
        />

        {feedbackMessage && (
          <div className="mb-6 rounded-xl border border-primary/15 bg-primary/10 px-5 py-4 text-sm text-primary font-medium">
            {feedbackMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Your tasks</h2>
            <p className="text-on-surface-variant text-sm">
              Everything here is now loading from your backend and MongoDB.
            </p>
          </div>
          <FilterTabs tabs={FILTER_TABS} activeTab={activeFilter} onTabChange={setActiveFilter} />
        </div>

        {isLoadingTasks ? (
          <div className="py-20 text-center text-on-surface-variant">Loading your tasks...</div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onDelay={handleDelay}
            onDelete={handleDelete}
          />
        )}

        <ConfirmTaskModal
          isOpen={showConfirmModal}
          parsedTask={parsedTask ?? emptyParsedTask()}
          clarificationQuestion={clarificationQuestion}
          clarificationAnswer={clarificationInput}
          isClarifyListening={isListening && listeningMode === "clarification"}
          isProcessing={isProcessingVoice}
          onConfirm={handleConfirmTask}
          onCancel={closeModal}
          onChange={handleParsedTaskChange}
          onClarificationAnswerChange={setClarificationInput}
          onClarify={handleClarify}
          onClarifyMicClick={handleClarifyMicClick}
        />
      </main>
    </>
  );
};

export default DashboardPage;
