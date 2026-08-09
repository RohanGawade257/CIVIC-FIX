import React, { useState } from "react";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading1, Text, TextSmall } from "../components/ui/Typography.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input, Textarea, Select } from "../components/ui/Input.jsx";
import { Card } from "../components/ui/Card.jsx";
import { AiScanEffect } from "../components/AiScanEffect.jsx";
import { CivicMap } from "../components/CivicMap.jsx";
import { ReportSubmittedModal } from "../components/ReportSubmittedModal.jsx";
import { createReport, uploadReportImage } from "../services/reportApi.js";
import { useAuth } from "../features/auth/AuthContext.jsx";
import ImageEditor from "../features/reports/ImageEditor.jsx";
import { createEditedImageFile } from "../features/reports/imageEditing.js";

const CATEGORY_OPTIONS = [
  { value: "ROAD_DAMAGE", label: "Road Damage / Pothole" },
  { value: "STREETLIGHT", label: "Broken Streetlight" },
  { value: "GARBAGE", label: "Garbage Dump / Sanitation" },
  { value: "WATER_LEAKAGE", label: "Water Pipeline Leakage" },
  { value: "TRAFFIC_SIGNAL", label: "Traffic Signal Failure" },
  { value: "PUBLIC_INFRASTRUCTURE", label: "Public Infrastructure" },
  { value: "OTHER_CIVIC", label: "Other Civic Issue" },
];

export default function CreateReportPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Photo & Details, 2: AI Vision Scan, 3: Confirmation
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [category, setCategory] = useState("ROAD_DAMAGE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState([73.8567, 18.5204]); // Default Pune
  const [displayAddress, setDisplayAddress] = useState("FC Road, Pune, Maharashtra");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReportId, setCreatedReportId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          setCoordinates(coords);
          setDisplayAddress(`Detected Location (${coords[1].toFixed(4)}°, ${coords[0].toFixed(4)}°)`);
        },
        () => {
          alert("Could not fetch current geolocation. Using default coordinates.");
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || title.length < 4) {
      alert("Please provide a descriptive report title (at least 4 characters).");
      return;
    }
    if (!description || description.length < 10) {
      alert("Please provide details in the description (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);
    setStep(2); // Show AI Scan Effect

    try {
      // 1. Create Report Document
      const reportData = {
        category,
        title,
        description,
        location: {
          coordinates,
          displayAddress,
        },
      };

      const created = await createReport(reportData);
      const reportId = created.report?._id || created._id;

      // 2. Upload Image if provided
      if (file && reportId) {
        await uploadReportImage(reportId, file);
      }

      setCreatedReportId(reportId);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsModalOpen(true);
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      setStep(1);
      alert(err.message || "Failed to submit report. Please try again.");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <Heading1>Tell Us What's Wrong</Heading1>
          <Text className="mt-2 text-gray-600">
            Submit a civic issue for your community. Our AI automatically classifies urgency and dispatches updates.
          </Text>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${step === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            <span>1</span> Report Details
          </div>
          <span className="text-gray-300">→</span>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${step === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            <span>2</span> AI Scan & Verification
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card variant="clay" className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">1. Photo Evidence (Recommended)</h3>
              
              <div className="space-y-4">
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Report Preview" className="w-full h-64 object-cover rounded-2xl border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreviewUrl(null); }}
                      className="absolute top-3 right-3 p-2 bg-gray-900/80 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-blue-50/40 hover:bg-blue-50/80 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm font-semibold text-gray-700">Click to upload photo evidence</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 10MB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </Card>

            <Card variant="neumorphic" className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">2. Issue Categorization</h3>
              
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
                placeholder="Describe the issue size, hazard level, or landmark details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Card>

            <Card variant="neumorphic" className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">3. Issue location</h3>
                <Button type="button" variant="secondary" size="sm" onClick={handleGeolocate}>
                  📍 Use Current Location
                </Button>
              </div>

              <Input
                label="Display Address"
                value={displayAddress}
                onChange={(e) => setDisplayAddress(e.target.value)}
                required
              />

              <CivicMap coordinates={coordinates} address={displayAddress} interactive />
            </Card>

            {/* Optional Image Editor */}
            {file && (
              <Card variant="neumorphic" className="p-6">
                <ImageEditor file={file} onSaveEditedFile={(newFile) => setFile(newFile)} />
              </Card>
            )}

            <Button type="submit" variant="clay" size="lg" className="w-full text-lg py-4 shadow-xl">
              Submit Civic Report →
            </Button>
          </form>
        ) : (
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
                Analyzing photo features, generating priority score, and dispatching to municipality...
              </p>
            )}
          </div>
        )}

        {/* Signature Moment #3 Confirmation Modal */}
        <ReportSubmittedModal
          isOpen={isModalOpen}
          reportId={createdReportId}
          onDismiss={() => setIsModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
