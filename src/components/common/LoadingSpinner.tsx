import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  size = "md",
  className = ""
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  };

  return (
    <div className={`py-16 text-center ${className}`}>
      <div className="inline-flex items-center justify-center">
        <div className={`animate-spin rounded-full border-b-2 border-[#273E8E] ${sizeClasses[size]}`}></div>
        <span className={`ml-3 text-gray-500 ${textSizeClasses[size]}`}>{message}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
