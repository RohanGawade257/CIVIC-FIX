import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { DEFAULT_EDIT_STATE, createEditedImageFile } from "../features/reports/imageEditing.js";
import { REPORT_CATEGORY_OPTIONS } from "../features/reports/reportCategories.js";
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
  }

  function handleImageEditChange(event) {
    const { name, value } = event.target;

    setImageEdit((current) => ({
      ...current,
      [name]: value,
    }));
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
        <fieldset>
          <legend>Issue image</legend>
          <p>
            <label htmlFor="image">Image</label>
            <input accept="image/jpeg,image/png,image/webp" id="image" name="image" onChange={handleImageChange} type="file" />
          </p>
          <p>
            <label htmlFor="cropX">Crop X</label>
            <input id="cropX" max="100" min="0" name="cropX" onChange={handleImageEditChange} type="range" value={imageEdit.cropX} />
          </p>
          <p>
            <label htmlFor="cropY">Crop Y</label>
            <input id="cropY" max="100" min="0" name="cropY" onChange={handleImageEditChange} type="range" value={imageEdit.cropY} />
          </p>
          <p>
            <label htmlFor="cropSize">Crop size</label>
            <input
              id="cropSize"
              max="100"
              min="20"
              name="cropSize"
              onChange={handleImageEditChange}
              type="range"
              value={imageEdit.cropSize}
            />
          </p>
          <p>
            <label htmlFor="zoom">Zoom</label>
            <input id="zoom" max="3" min="1" name="zoom" onChange={handleImageEditChange} step="0.1" type="range" value={imageEdit.zoom} />
          </p>
          <p>
            <label htmlFor="rotation">Rotate</label>
            <input
              id="rotation"
              max="180"
              min="-180"
              name="rotation"
              onChange={handleImageEditChange}
              step="5"
              type="range"
              value={imageEdit.rotation}
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
