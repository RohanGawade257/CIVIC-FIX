import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { REPORT_CATEGORY_OPTIONS } from "../features/reports/reportCategories.js";
import { createReport } from "../services/reportApi.js";

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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await createReport(buildReportPayload(values));
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
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit">Submit report</button>
      </form>
    </main>
  );
}

export default CreateReportPage;
