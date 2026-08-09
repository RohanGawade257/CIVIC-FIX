import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { ImageEditor } from "../features/reports/ImageEditor.jsx";
import { DEFAULT_EDIT_STATE, createEditedImageFile } from "../features/reports/imageEditing.js";
import { REPORT_CATEGORY_OPTIONS } from "../features/reports/reportCategories.js";
import { preCheckImageAi } from "../services/aiApi.js";
import { createReport, uploadReportImage } from "../services/reportApi.js";

function buildReportPayload(values) {
  return {
    category: values.category,
    title: values.title,
    description: values.description,
    location: {
      coordinates: [Number(values.longitude), Number(values.latitude)],
      displayAddress: values.displayAddress || undefined,
    },
  };
}

function CreateReportPage() {
  const navigate = useNavigate();
  const { status, user } = useAuth();
  const [error, setError] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageEdit, setImageEdit] = useState(DEFAULT_EDIT_STATE);
  const [values, setValues] = useState({
    category: "ROADS",
    title: "",
    description: "",
    longitude: "",
    latitude: "",
    displayAddress: "",
  });

  if (status === "loading") {
    return (
      <main>
        <p>Loading account...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function handleChange(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setAiAnalysis(null);
  }

  function handleImageEditChange(event) {
    const { name, value } = event.target;
    setImageEdit((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleAiPreCheck() {
    if (!imageFile) return;
    setIsAiLoading(true);
    setError("");
    try {
      const editedFile = await createEditedImageFile(imageFile, imageEdit);
      const res = await preCheckImageAi(editedFile, values.category);
      setAiAnalysis(res.aiAssist);
      if (res.aiAssist?.suggestedDescription && !values.description) {
        setValues((curr) => ({ ...curr, description: res.aiAssist.suggestedDescription }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAiLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await createReport(buildReportPayload(values));
      if (imageFile) {
        const editedImage = await createEditedImageFile(imageFile, imageEdit);
        await uploadReportImage(response.report.id, editedImage);
      }
      navigate(`/reports/${response.report.id}`);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main>
      <h1>Submit report</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="category">Category</label>
          <select id="category" name="category" onChange={handleChange} value={values.category}>
            {REPORT_CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </p>
        <p>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" onChange={handleChange} required type="text" value={values.title} />
        </p>

        <ImageEditor
          editState={imageEdit}
          file={imageFile}
          onEditChange={handleImageEditChange}
          onFileChange={handleImageChange}
        />

        {imageFile ? (
          <p>
            <button disabled={isAiLoading} onClick={handleAiPreCheck} type="button">
              {isAiLoading ? "Analyzing photo with AI..." : "AI Assist (Auto-draft description & validate image)"}
            </button>
          </p>
        ) : null}

        {aiAnalysis ? (
          <div style={{ background: "#f5f5f5", padding: "0.5rem", margin: "0.5rem 0" }}>
            <h3>AI Advisory Analysis</h3>
            <p>Category Match: {aiAnalysis.isRelevantToCategory ? "Relevant" : "Category Mismatch Warning"}</p>
            <p>Estimated Severity: {aiAnalysis.suggestedSeverity}</p>
            <p>Confidence: {Math.round(aiAnalysis.confidence * 100)}%</p>
            <p>Note: {aiAnalysis.relevanceReason}</p>
          </div>
        ) : null}

        <p>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            onChange={handleChange}
            required
            value={values.description}
          />
        </p>
        <fieldset>
          <legend>Issue location</legend>
          <p>
            <label htmlFor="longitude">Longitude</label>
            <input id="longitude" name="longitude" onChange={handleChange} required type="number" value={values.longitude} />
          </p>
          <p>
            <label htmlFor="latitude">Latitude</label>
            <input id="latitude" name="latitude" onChange={handleChange} required type="number" value={values.latitude} />
          </p>
          <p>
            <label htmlFor="displayAddress">Display address</label>
            <input
              id="displayAddress"
              name="displayAddress"
              onChange={handleChange}
              type="text"
              value={values.displayAddress}
            />
          </p>
        </fieldset>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit">Submit report</button>
      </form>
    </main>
  );
}

export default CreateReportPage;
