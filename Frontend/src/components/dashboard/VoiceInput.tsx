import React from "react";
import MaterialIcon from "../ui/MaterialIcon";

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  onMicClick: () => void;
  onSubmit: () => void;
  isListening?: boolean;
  placeholder?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  value,
  onChange,
  onMicClick,
  onSubmit,
  isListening = false,
  placeholder = "Transcribe a thought or type a task...",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit();
    }
  };

  return (
    <section className="mb-20 relative group">
      <div className="bg-surface-container-lowest rounded-full p-2 flex items-center shadow-2xl border border-white/10 focus-within:ring-2 ring-primary/40 transition-all duration-300">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none px-8 text-xl font-medium text-on-surface placeholder:text-on-surface-variant/40"
        />
        <button
          onClick={onMicClick}
          className={`
            p-5 rounded-full text-black shadow-lg transition-all active:scale-90 group-hover:scale-105
            ${
              isListening
                ? "bg-error luminous-glow animate-pulse"
                : "bg-gradient-to-br from-primary to-primary-dim luminous-glow"
            }
          `}
        >
          <MaterialIcon icon={isListening ? "stop" : "mic"} filled />
        </button>
      </div>

      {/* Decorative Background Accent */}
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[200%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Listening indicator */}
      {isListening && (
        <p className="text-center mt-4 text-primary text-sm font-bold animate-pulse">
          Listening... Speak now
        </p>
      )}
    </section>
  );
};

export default VoiceInput;
