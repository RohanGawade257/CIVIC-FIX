import React from "react";

const STATUS_CONFIGS = {
  SUBMITTED: { label: "Submitted", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  AI_ANALYZED: { label: "AI Analyzed", bg: "bg-purple-50 text-purple-700 border-purple-200" },
  VERIFICATION_PENDING: { label: "Pending Verification", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  VERIFIED: { label: "Verified", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ASSIGNED: { label: "Assigned", bg: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  CITIZEN_CONFIRMATION: { label: "Pending Confirmation", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  RESOLVED: { label: "Resolved", bg: "bg-green-100 text-green-800 border-green-300" },
  CLOSED: { label: "Closed & Confirmed", bg: "bg-gray-100 text-gray-800 border-gray-300" },
  REOPENED: { label: "Reopened", bg: "bg-rose-100 text-rose-800 border-rose-300" },
};

const CATEGORY_COLORS = {
  ROAD_DAMAGE: "bg-red-50 text-red-700 border-red-200",
  STREETLIGHT: "bg-amber-50 text-amber-700 border-amber-200",
  GARBAGE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WATER_LEAKAGE: "bg-cyan-50 text-cyan-700 border-cyan-200",
  TRAFFIC_SIGNAL: "bg-purple-50 text-purple-700 border-purple-200",
  PUBLIC_INFRASTRUCTURE: "bg-blue-50 text-blue-700 border-blue-200",
  OTHER_CIVIC: "bg-gray-50 text-gray-700 border-gray-200",
};

export function StatusBadge({ status, className = "" }) {
  const config = STATUS_CONFIGS[status] || { label: status, bg: "bg-gray-100 text-gray-700 border-gray-200" };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {config.label}
    </span>
  );
}

export function CategoryBadge({ category, className = "" }) {
  const colorClass = CATEGORY_COLORS[category] || "bg-gray-50 text-gray-700 border-gray-200";
  const formattedCategory = category ? category.replace(/_/g, " ") : "Category";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${colorClass} ${className}`}
    >
      {formattedCategory}
    </span>
  );
}

export function PriorityBadge({ priority, className = "" }) {
  let badgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
  let label = "Low Priority";

  if (priority >= 80) {
    badgeStyle = "bg-red-100 text-red-800 border-red-300 font-bold animate-pulse";
    label = `Critical (${priority})`;
  } else if (priority >= 60) {
    badgeStyle = "bg-orange-100 text-orange-800 border-orange-300 font-bold";
    label = `High (${priority})`;
  } else if (priority >= 40) {
    badgeStyle = "bg-amber-100 text-amber-800 border-amber-300";
    label = `Medium (${priority})`;
  } else {
    label = `Priority ${priority}`;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${badgeStyle} ${className}`}>
      {label}
    </span>
  );
}
