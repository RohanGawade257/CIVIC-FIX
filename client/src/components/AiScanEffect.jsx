import React from "react";

export function AiScanEffect({ isScanning = true, imageUrl, category, confidence, severity, priorityScore, className = "" }) {
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-blue-200 shadow-md ${className}`}>
      {/* Background Image */}
      {imageUrl ? (
        <img src={imageUrl} alt="Analysis Target" className="w-full h-64 md:h-80 object-cover" />
      ) : (
        <div className="w-full h-64 md:h-80 bg-gray-900 flex items-center justify-center text-gray-500">
          No image provided for AI analysis
        </div>
      )}

      {/* Futuristic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Laser Scanning Line */}
      {isScanning && (
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan-line z-20 pointer-events-none" />
      )}

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-gray-950/40 pointer-events-none" />

      {/* AI Live Status Badge */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900/80 backdrop-blur-md border border-cyan-500/40 text-cyan-400 text-xs font-mono font-semibold">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        {isScanning ? "AI VISION SCANNING..." : "AI ANALYSIS COMPLETE"}
      </div>

      {/* AI Metrics Overlay */}
      {!isScanning && (
        <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-gray-900/85 backdrop-blur-lg border border-white/10 text-white animate-fadeIn">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">Detected Category</span>
            <span className="text-base font-bold text-white capitalize">{category ? category.replace(/_/g, " ") : "Civic Issue"}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {confidence && (
              <div className="text-right">
                <span className="text-gray-400 block text-[10px]">Confidence</span>
                <span className="text-emerald-400 font-bold">{Math.round(confidence * 100)}%</span>
              </div>
            )}
            {severity && (
              <div className="text-right">
                <span className="text-gray-400 block text-[10px]">Severity</span>
                <span className="text-amber-400 font-bold">{severity}</span>
              </div>
            )}
            {priorityScore !== undefined && (
              <div className="text-right pl-3 border-l border-gray-700">
                <span className="text-gray-400 block text-[10px]">Priority Score</span>
                <span className="text-blue-400 font-extrabold text-sm">{priorityScore} / 100</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
