import React, { useState } from "react";
import { Button } from "./ui/Button.jsx";
import { Textarea } from "./ui/Input.jsx";

export function CitizenConfirmationForm({ onSubmit, isLoading = false }) {
  const [confirmed, setConfirmed] = useState(true);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ confirmed, rating, feedback });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 p-6 rounded-3xl border border-blue-200/80 shadow-lg space-y-5 my-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/30">
          ?
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900">Was this issue resolved?</h4>
          <p className="text-xs text-gray-600">The assigned municipal team marked this issue resolved. Has this issue been fixed to your satisfaction?</p>
        </div>
      </div>

      {/* Decision Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setConfirmed(true)}
          className={`py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${
            confirmed
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span>✓ Yes, Issue Fixed</span>
        </button>

        <button
          type="button"
          onClick={() => setConfirmed(false)}
          className={`py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${
            !confirmed
              ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 scale-[1.02]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span>✕ No, Still Broken</span>
        </button>
      </div>

      {/* Star Rating (If Confirmed) */}
      {confirmed && (
        <div className="space-y-2 animate-fadeIn">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
            Rate Resolution Quality
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${
                  star <= rating ? "text-amber-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
            <span className="text-xs font-semibold text-gray-600 ml-2">{rating} / 5 Stars</span>
          </div>
        </div>
      )}

      {/* Optional Feedback */}
      <Textarea
        label={confirmed ? "Resolution Feedback (Optional)" : "Reason for Reopening (Required)"}
        placeholder={
          confirmed
            ? "Great job fixing this quickly!"
            : "The pothole was filled with loose gravel and washed away again."
        }
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        required={!confirmed}
      />

      <Button
        type="submit"
        isLoading={isLoading}
        variant={confirmed ? "primary" : "danger"}
        size="lg"
        className="w-full rounded-2xl"
      >
        {confirmed ? "Confirm Issue Fixed" : "Reopen Issue Ticket"}
      </Button>
    </form>
  );
}
