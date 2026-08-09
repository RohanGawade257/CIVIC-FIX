import React from "react";
import { StatusBadge, PriorityBadge } from "./ui/StatusBadge.jsx";

export function AdminReportTable({ reports = [], onSelectReport, selectedReportId }) {
  if (!reports || reports.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-sm">
        No reports match current filter criteria.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr className="bg-slate-100/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Title & Location</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Department</th>
            <th className="py-3 px-4">Created</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reports.map((report) => {
            const isSelected = selectedReportId === report._id;

            return (
              <tr
                key={report._id}
                onClick={() => onSelectReport && onSelectReport(report)}
                className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                  isSelected ? "bg-blue-50/80 font-medium" : ""
                }`}
              >
                <td className="py-3 px-4">
                  <PriorityBadge priority={report.priority || 0} />
                </td>
                <td className="py-3 px-4 capitalize font-semibold text-gray-800">
                  {report.category ? report.category.replace(/_/g, " ").toLowerCase() : "N/A"}
                </td>
                <td className="py-3 px-4 max-w-xs">
                  <div className="font-bold text-gray-900 truncate">{report.title}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {report.location?.displayAddress || "Location specified"}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={report.status} />
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {report.assignedDepartment || <span className="text-gray-400 italic">Unassigned</span>}
                </td>
                <td className="py-3 px-4 text-gray-500 font-mono text-xs whitespace-nowrap">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors">
                    Manage
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
