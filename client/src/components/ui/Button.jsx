import React from "react";

export function Button({
  children,
  variant = "primary", // primary, secondary, neumorphic, clay, ghost, danger
  size = "md", // sm, md, lg
  isLoading = false,
  isDisabled = false,
  onClick,
  type = "button",
  className = "",
  ariaLabel,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-[0.98] select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[44px]";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-sm rounded-xl min-w-[36px]",
    md: "px-5 py-2.5 text-base rounded-2xl min-w-[44px]",
    lg: "px-7 py-3.5 text-lg font-semibold rounded-3xl min-w-[48px]",
  };

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg shadow-blue-500/20",
    secondary: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60",
    neumorphic: "bg-[#F7F9FC] text-gray-800 shadow-[5px_5px_12px_rgba(163,177,198,0.25),-5px_-5px_12px_rgba(255,255,255,0.9)] hover:shadow-[3px_3px_8px_rgba(163,177,198,0.3),-3px_-3px_8px_rgba(255,255,255,0.9)] border border-white/60",
    clay: "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_15px_25px_-5px_rgba(37,99,235,0.35),inset_0_2px_4px_rgba(255,255,255,0.6)] hover:brightness-105",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100/70",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
