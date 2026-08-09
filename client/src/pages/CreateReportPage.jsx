import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading1, Text } from "../components/ui/Typography.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input, Textarea, Select } from "../components/ui/Input.jsx";
import { Card } from "../components/ui/Card.jsx";
import { AiScanEffect } from "../components/AiScanEffect.jsx";
import { CivicMap } from "../components/CivicMap.jsx";
import { ReportSubmittedModal } from "../components/ReportSubmittedModal.jsx";
import { createReport, uploadReportImage } from "../services/reportApi.js";
import { useAuth } from "../features/auth/AuthContext.jsx";
import ImageEditor from "../features/reports/ImageEditor.jsx";
import { createEditedImageFile, normalizeImageEdit, DEFAULT_EDIT_STATE } from "../features/reports/imageEditing.js";

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: "ROADS", label: "Roads / Potholes" },
  { value: "ELECTRICITY", label: "Broken Streetlight / Electricity" },
  { value: "WASTE_MANAGEMENT", label: "Garbage Dump / Sanitation" },
  { value: "WATER", label: "Water Pipeline Leakage" },
  { value: "TRAFFIC", label: "Traffic Signal Failure" },
  { value: "PUBLIC_WORKS", label: "Public Infrastructure" },
  { value: "OTHER", label: "Other Civic Issue" },
];

// ─── LocationSearch – real OSM Nominatim autocomplete ────────────────────────
function LocationSearch({ value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const handleInputChange = useCallback((e) => {
    const query = e.target.value;
    onChange(query);

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce 400ms then query Nominatim
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, [onChange]);

  const handleSelect = useCallback((place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    onSelect(lat, lon, place.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  }, [onSelect]);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        Location Address
        {isSearching && (
          <span className="ml-2 text-xs text-blue-500 font-normal">Searching…</span>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Type an address, area, or city… (e.g. Goa, Panaji, FC Road Pune)"
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
        {isSearching && (
          <div className="absolute right-3 top-3.5">
            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin block" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              onMouseDown={() => handleSelect(place)}
              className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
            >
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm text-gray-900 font-medium leading-snug line-clamp-1">
                  {place.name || place.display_name.split(",")[0]}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{place.display_name}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && !isSearching && suggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 text-sm text-gray-500">
          No locations found for "{value}". Try a different query.
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateReportPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Step: 1 = form, 2 = AI scan
  const [step, setStep] = useState(1);

  // Image state
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageError, setImageError] = useState("");

  // Form fields
  const [category, setCategory] = useState("ROADS");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Location state
  const [coordinates, setCoordinates] = useState([73.8567, 18.5204]); // [lng, lat]
  const [displayAddress, setDisplayAddress] = useState("FC Road, Pune, Maharashtra");
  const [isGeolocating, setIsGeolocating] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdReportId, setCreatedReportId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Redirect if not authenticated ──────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <p className="text-lg font-bold text-gray-800">Sign in to report an issue</p>
          <Button variant="primary" onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </AppLayout>
    );
  }

  // ── Image editing state (passed to ImageEditor) ───────────────────────────
  const [editState, setEditState] = useState(() => ({ ...DEFAULT_EDIT_STATE }));
  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditState((prev) => ({ ...prev, [name]: parseFloat(value) }));
  }, []);

  // ── Image Handlers ─────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setImageError("");
    if (!selected) return;

    // Validate type
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setImageError("Only JPEG, PNG, or WebP images are accepted.");
      return;
    }
    // Validate size (10MB)
    if (selected.size > 10 * 1024 * 1024) {
      setImageError("Image must be smaller than 10MB.");
      return;
    }

    // Revoke old URL to avoid memory leak
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    // Reset edit state when new file selected
    setEditState({ ...DEFAULT_EDIT_STATE });
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setImageError("");
  };

  // ── Geolocation ────────────────────────────────────────────────────────────
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGeolocating(true);
    setDisplayAddress("Detecting your location…");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { longitude, latitude } = pos.coords;
        setCoordinates([longitude, latitude]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          setDisplayAddress(data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } catch {
          setDisplayAddress(`${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`);
        } finally {
          setIsGeolocating(false);
        }
      },
      (err) => {
        setIsGeolocating(false);
        setDisplayAddress("FC Road, Pune, Maharashtra");
        if (err.code === err.PERMISSION_DENIED) {
          alert("Location permission denied. You can pin your location on the map instead.");
        } else {
          alert("Could not detect location. Please pin it on the map.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ── Map pin callback (from CivicMap click/drag) ────────────────────────────
  const handleMapLocationSelect = useCallback((lat, lng, address) => {
    setCoordinates([lng, lat]); // store as [lng, lat] geoJSON order
    if (address) setDisplayAddress(address);
  }, []);

  // ── Autocomplete selection ─────────────────────────────────────────────────
  const handleLocationSuggestionSelect = useCallback((lat, lng, address) => {
    setCoordinates([lng, lat]);
    setDisplayAddress(address);
  }, []);

  // ── Form Submission ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!title || title.trim().length < 4) {
      setSubmitError("Please provide a descriptive report title (at least 4 characters).");
      return;
    }
    if (!description || description.trim().length < 10) {
      setSubmitError("Please describe the issue in more detail (at least 10 characters).");
      return;
    }
    if (!coordinates || coordinates.length !== 2) {
      setSubmitError("Please select a location on the map.");
      return;
    }

    setIsSubmitting(true);
    setStep(2);

    try {
      // 1. Create the report document
      const reportPayload = {
        category,
        title: title.trim(),
        description: description.trim(),
        location: {
          coordinates, // [lng, lat] — matches backend schema
          displayAddress: displayAddress.trim() || undefined,
        },
      };

      const created = await createReport(reportPayload);
      const reportId = created.report?._id || created._id;

      if (!reportId) {
        throw new Error("Server did not return a report ID.");
      }

      // 2. Apply image edits then upload if user selected one
      if (file && reportId) {
        try {
          // Apply crop/rotation edits before uploading
          const processedFile = await createEditedImageFile(file, editState);
          await uploadReportImage(reportId, processedFile);
        } catch (imgErr) {
          // Image upload failure is non-fatal — report is still created
          console.warn("Image upload failed (non-fatal):", imgErr.message);
        }
      }

      setCreatedReportId(reportId);

      // Show AI scan for 2s then open modal
      setTimeout(() => {
        setIsSubmitting(false);
        setIsModalOpen(true);
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      setStep(1);
      setSubmitError(err.message || "Failed to submit report. Please try again.");
      console.error("Report submission error:", err);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <Heading1>Report a Civic Issue</Heading1>
          <Text className="mt-2 text-gray-600">
            Submit a report and our AI will classify urgency and dispatch it to your municipality.
          </Text>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { n: 1, label: "Report Details" },
            { n: 2, label: "AI Scan & Verify" },
          ].map(({ n, label }) => (
            <div key={n} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${step === n ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "bg-gray-100 text-gray-500"}`}>
              <span>{n}</span> {label}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* SECTION 1 – Photo Evidence */}
            <Card variant="clay" className="p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                1. Photo Evidence <span className="font-normal text-gray-400 text-sm">(recommended)</span>
              </h3>

              {imageError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                  ⚠ {imageError}
                </div>
              )}

              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Report preview"
                      className="w-full h-64 object-cover rounded-2xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-3 right-3 p-2 bg-gray-900/80 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-white bg-gray-900/70 px-2.5 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{file?.name} · {(file?.size / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                  {/* ImageEditor – crop, zoom, rotation adjustments */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-blue-600 font-semibold hover:underline list-none flex items-center gap-1.5">
                      <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                      Adjust image (crop, rotate, zoom)
                    </summary>
                    <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                      <ImageEditor
                        file={file}
                        editState={editState}
                        onEditChange={handleEditChange}
                        onFileChange={handleFileChange}
                      />
                    </div>
                  </details>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-blue-50/40 hover:bg-blue-50/80 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-gray-700">Click to upload photo evidence</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP · max 10 MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </Card>

            {/* SECTION 2 – Categorization */}
            <Card variant="neumorphic" className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">2. Issue Details</h3>

              <Select
                label="Issue Category"
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
              <Input
                label="Report Title"
                placeholder="e.g. Large pothole blocking right lane on FC Road"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                label="Detailed Description"
                placeholder="Describe the issue — size, hazard level, landmark details, how long it's been there…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Card>

            {/* SECTION 3 – Location */}
            <Card variant="neumorphic" className="p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">3. Issue location</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleGeolocate}
                  isLoading={isGeolocating}
                >
                  📍 Use My Location
                </Button>
              </div>

              {/* Real autocomplete search box */}
              <LocationSearch
                value={displayAddress}
                onChange={setDisplayAddress}
                onSelect={handleLocationSuggestionSelect}
              />

              {/* Coordinates display */}
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>
                  Lat: {coordinates[1].toFixed(5)}° · Lng: {coordinates[0].toFixed(5)}°
                </span>
              </div>

              {/* Real Leaflet map – click or drag to reposition */}
              <CivicMap
                coordinates={coordinates}
                address={displayAddress}
                interactive
                onLocationSelect={handleMapLocationSelect}
                className="h-80"
              />

              <p className="text-xs text-gray-400 text-center">
                💡 Click anywhere on the map or drag the pin to set the exact location.
              </p>
            </Card>

            {/* Submit error */}
            {submitError && (
              <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-sm font-semibold animate-fadeIn">
                ⚠ {submitError}
              </div>
            )}

            <Button type="submit" variant="clay" size="lg" className="w-full text-lg py-4 shadow-xl">
              Submit Civic Report →
            </Button>
          </form>
        ) : (
          /* Step 2 – AI Scan */
          <div className="space-y-6 animate-fadeIn">
            <AiScanEffect
              isScanning={isSubmitting}
              imageUrl={previewUrl}
              category={category}
              confidence={0.94}
              severity="HIGH"
              priorityScore={82}
            />
            {isSubmitting && (
              <p className="text-center font-mono text-sm text-blue-600 animate-pulse">
                Analyzing photo · classifying urgency · dispatching to municipality…
              </p>
            )}
          </div>
        )}

        {/* Confirmation Modal (Signature Moment #3) */}
        <ReportSubmittedModal
          isOpen={isModalOpen}
          reportId={createdReportId}
          onDismiss={() => {
            setIsModalOpen(false);
            navigate("/reports/my");
          }}
        />
      </div>
    </AppLayout>
  );
}
