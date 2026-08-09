import React from "react";

export function Display({ children, className = "" }) {
  return (
    <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight ${className}`}>
      {children}
    </h1>
  );
}

export function Heading1({ children, className = "" }) {
  return (
    <h1 className={`text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-snug ${className}`}>
      {children}
    </h1>
  );
}

export function Heading2({ children, className = "" }) {
  return (
    <h2 className={`text-2xl md:text-3xl font-bold tracking-snug text-gray-900 ${className}`}>
      {children}
    </h2>
  );
}

export function Heading3({ children, className = "" }) {
  return (
    <h3 className={`text-xl md:text-2xl font-semibold tracking-normal text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export function Heading4({ children, className = "" }) {
  return (
    <h4 className={`text-lg md:text-xl font-semibold text-gray-800 ${className}`}>
      {children}
    </h4>
  );
}

export function TextLarge({ children, className = "" }) {
  return (
    <p className={`text-lg text-gray-600 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function Text({ children, className = "" }) {
  return (
    <p className={`text-base text-gray-700 leading-normal ${className}`}>
      {children}
    </p>
  );
}

export function TextSmall({ children, className = "" }) {
  return (
    <p className={`text-sm text-gray-500 leading-normal ${className}`}>
      {children}
    </p>
  );
}

export function Caption({ children, className = "" }) {
  return (
    <span className={`text-xs text-gray-400 font-medium tracking-wide ${className}`}>
      {children}
    </span>
  );
}

export function SectionHeader({ title, subtitle, align = "center", className = "" }) {
  const alignmentClass = align === "center" ? "text-center mx-auto" : align === "right" ? "text-right ml-auto" : "text-left";
  return (
    <div className={`max-w-3xl mb-10 ${alignmentClass} ${className}`}>
      <Heading2>{title}</Heading2>
      {subtitle && <TextLarge className="mt-3">{subtitle}</TextLarge>}
    </div>
  );
}
