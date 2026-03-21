import React from "react";

interface MaterialIconProps {
  icon: string;
  filled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-sm",
  md: "text-2xl",
  lg: "text-3xl",
};

const MaterialIcon: React.FC<MaterialIconProps> = ({
  icon,
  filled = false,
  className = "",
  size = "md",
}) => {
  return (
    <span
      className={`material-symbols-outlined ${sizeMap[size]} ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
    >
      {icon}
    </span>
  );
};

export default MaterialIcon;
