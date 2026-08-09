import React from "react";

export function Card({
  children,
  variant = "neumorphic", // neumorphic, glass, clay, flat
  className = "",
  hoverable = false,
  onClick,
  ...props
}) {
  const variantStyles = {
    neumorphic: "bg-[#F7F9FC] shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.8)] border border-white/60 rounded-2xl p-6",
    glass: "bg-white/65 backdrop-blur-md border border-white/50 shadow-[0_12px_40px_rgba(15,23,42,0.10)] rounded-2xl p-6",
    clay: "bg-gradient-to-br from-white to-blue-50/60 shadow-[0_20px_30px_-10px_rgba(37,99,235,0.12),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/80 rounded-3xl p-8",
    flat: "bg-white border border-gray-200/80 shadow-sm rounded-2xl p-6",
  };

  const hoverStyles = hoverable
    ? "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer"
    : "";

  return (
    <div
      onClick={onClick}
      className={`${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, subtitle, icon, trend, variant = "neumorphic", className = "" }) {
  return (
    <Card variant={variant} className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">{icon}</div>}
      </div>
      <div>
        <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
}
