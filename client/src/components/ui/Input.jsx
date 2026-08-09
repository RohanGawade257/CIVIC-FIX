import React from "react";

export function Input({
  label,
  error,
  helperText,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
  containerClassName = "",
  icon,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-800 flex items-center justify-between">
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full py-3 ${icon ? "pl-11" : "px-4"} pr-4 text-base bg-[#F0F4F8] text-gray-900 rounded-xl shadow-[inset_2px_2px_5px_rgba(163,177,198,0.25),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border border-gray-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 disabled:opacity-60 ${
            error ? "border-red-500 ring-1 ring-red-500" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <span id={`${inputId}-error`} className="text-xs font-medium text-red-600 animate-fadeIn">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${inputId}-helper`} className="text-xs text-gray-500">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  id,
  rows = 4,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
  containerClassName = "",
  ...props
}) {
  const inputId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        className={`w-full p-4 text-base bg-[#F0F4F8] text-gray-900 rounded-2xl shadow-[inset_2px_2px_5px_rgba(163,177,198,0.25),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border border-gray-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 disabled:opacity-60 ${
          error ? "border-red-500 ring-1 ring-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
      {helperText && !error && <span className="text-xs text-gray-500">{helperText}</span>}
    </div>
  );
}

export function Select({
  label,
  error,
  id,
  options = [],
  value,
  onChange,
  required = false,
  className = "",
  containerClassName = "",
  ...props
}) {
  const inputId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={inputId}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full py-3 px-4 text-base bg-[#F0F4F8] text-gray-900 rounded-xl shadow-[inset_2px_2px_5px_rgba(163,177,198,0.25),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border border-gray-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
