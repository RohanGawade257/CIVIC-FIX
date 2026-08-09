import React, { useState } from "react";

export function BeforeAfterViewer({ beforeUrl, afterUrl, beforeLabel = "Before (Reported)", afterLabel = "After (Resolved)" }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX, rect) => {
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches[0]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.touches[0].clientX, rect);
  };

  return (
    <div className="flex flex-col gap-2 my-4">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
        <span>{beforeLabel}</span>
        <span className="text-blue-600 font-bold">Drag slider to compare</span>
        <span>{afterLabel}</span>
      </div>

      <div
        className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg select-none cursor-ew-resize border border-gray-200"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Background) */}
        <img
          src={afterUrl}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Before Image (Clipped Overlay) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeUrl}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Divider Bar & Handle */}
        <div
          className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white text-blue-600 shadow-md flex items-center justify-center border border-blue-200 transform -translate-x-1/2 text-xs font-bold">
            ↔
          </div>
        </div>
      </div>
    </div>
  );
}
