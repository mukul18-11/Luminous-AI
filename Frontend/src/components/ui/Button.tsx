import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-primary text-black font-extrabold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:brightness-110",
  secondary:
    "bg-secondary text-on-secondary font-bold shadow-md shadow-secondary/20 hover:shadow-secondary/40",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-white/5",
  outline:
    "bg-transparent border border-outline-variant text-on-surface hover:bg-white/5",
  danger:
    "bg-error/20 text-error font-bold hover:bg-error/30",
};

const sizeClasses: Record<string, string> = {
  sm: "px-4 py-2 text-xs rounded-lg",
  md: "px-6 py-2.5 text-sm rounded-lg",
  lg: "px-8 py-3.5 text-base rounded-lg",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold tracking-wide
        transition-all duration-200 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
