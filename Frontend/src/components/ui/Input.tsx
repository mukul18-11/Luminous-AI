import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = "", id, ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-semibold text-gray-300" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full bg-neutral-900/50 border border-outline-variant rounded-lg
          py-3 px-4 text-white placeholder:text-neutral-600
          focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-all outline-none
          ${error ? "border-error focus:ring-error/20 focus:border-error" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
};

export default Input;
