import React from "react";

export function CivicMap({ coordinates, address, onLocationSelect, className = "", interactive = false }) {
  const [lng, lat] = coordinates || [73.8567, 18.5204]; // Default Pune coordinates

  return (
    <div className={`relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-md border border-gray-200 bg-slate-900 group ${className}`}>
      {/* Abstract Grid Map Simulation Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
      
      {/* Decorative Topographic Curves */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-blue-950/80" />

      {/* Map Control Glass Pill */}
      <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-xs font-mono flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>GEO: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
      </div>

      {/* Map Pin Center Marker */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative flex flex-col items-center">
          {/* Pulsing Ripple */}
          <div className="absolute w-12 h-12 bg-blue-500/30 rounded-full animate-ping" />
          
          {/* Marker Pin */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-110">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Location Address Glass Banner */}
      {address && (
        <div className="absolute bottom-4 left-4 right-4 z-20 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-white text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate text-gray-200 font-medium">{address}</span>
          </div>
          {interactive && (
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800 flex-shrink-0">
              PIN LOCATION
            </span>
          )}
        </div>
      )}
    </div>
  );
}
