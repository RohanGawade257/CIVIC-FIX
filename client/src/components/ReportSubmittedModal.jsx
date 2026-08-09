import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/Button.jsx";

export function ReportSubmittedModal({ isOpen, reportId, onDismiss }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/80 text-center animate-scaleIn relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500" />

        {/* Animated Pop Checkmark */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-checkmark">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Report Successfully Submitted!</h3>
        <p className="text-gray-600 text-sm mb-6">
          Thank you for taking action to improve your community. Your report has been dispatched to local department queues.
        </p>

        {/* Report ID Chip */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-sm font-mono text-gray-800 mb-6">
          <span className="text-gray-400">REPORT ID:</span>
          <span className="font-bold text-blue-600">{reportId || "CF-948271"}</span>
        </div>

        {/* Initial Timeline Preview */}
        <div className="bg-blue-50/60 rounded-2xl p-4 text-left border border-blue-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
            <div>
              <span className="text-xs font-bold text-blue-900 block">Status: Submitted & AI Analyzed</span>
              <span className="text-xs text-blue-700">Awaiting department verification and priority score assignment.</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link to={`/reports/${reportId}`} className="w-full">
            <Button variant="primary" size="lg" className="w-full rounded-2xl">
              Track Report Status
            </Button>
          </Link>
          <Link to="/feed" className="w-full">
            <Button variant="secondary" size="lg" className="w-full rounded-2xl" onClick={onDismiss}>
              Return to Feed
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
