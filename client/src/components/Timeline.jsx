import React from "react";

export function Timeline({ entries = [] }) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-gray-500 italic">No timeline events recorded yet.</p>;
  }

  return (
    <div className="relative pl-6 border-l-2 border-blue-100 space-y-6 my-4">
      {entries.map((entry, index) => {
        const isLatest = index === entries.length - 1;

        return (
          <div key={index} className="relative group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 transition-all ${
                isLatest
                  ? "bg-blue-600 border-white ring-4 ring-blue-100"
                  : "bg-gray-300 border-white"
              }`}
            />

            <div className="bg-white/80 p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-gray-900 capitalize">
                  {entry.status ? entry.status.replace(/_/g, " ") : "Status Update"}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "Just now"}
                </span>
              </div>

              {entry.message && (
                <p className="text-sm text-gray-600 leading-relaxed mb-2">{entry.message}</p>
              )}

              {entry.actorId && (
                <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Action taken by Administrator / Official
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
