import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { getCivicFeed } from "../services/feedApi.js";

function CivicFeedPage() {
  const { status: authStatus, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [query, setQuery] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [locationError, setLocationError] = useState("");

  const loadFeed = useCallback(
    async (params = {}) => {
      setStatus("loading");
      setError("");
      try {
        const response = await getCivicFeed(params);
        setReports(response.reports || []);
        setPagination(response.pagination || null);
        setQuery(response.query || null);
        if (response.message) {
          setError(response.message);
        }
        setStatus("ready");
      } catch (err) {
        setError(err.message);
        setStatus("error");
      }
    },
    [],
  );

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadFeed({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        });
      },
      (geoError) => {
        setLocationError(`Could not get location: ${geoError.message}`);
      },
    );
  }

  useEffect(() => {
    if (!user) return undefined;
    const timeoutId = setTimeout(() => {
      loadFeed();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadFeed, user]);

  if (authStatus === "loading") {
    return (
      <main>
        <p>Loading account...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main>
      <h1>CivicFeed</h1>
      <p>Nearby civic issues ranked by priority, distance, and recency.</p>

      <section>
        <button onClick={handleUseCurrentLocation} type="button">
          Use my current location
        </button>
        {locationError ? <p role="alert">{locationError}</p> : null}
      </section>

      {query ? (
        <p>
          Showing issues within {query.radiusKm} km of [{query.latitude?.toFixed(4)},{" "}
          {query.longitude?.toFixed(4)}]
        </p>
      ) : null}

      {status === "loading" ? <p>Loading feed...</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      {reports.length > 0 ? (
        <ul>
          {reports.map((report) => (
            <li key={report.id}>
              <Link to={`/reports/${report.id}`}>
                <strong>{report.title}</strong>
              </Link>
              <span> — {report.category}</span>
              <span> — {report.status}</span>
              <span> — Priority: {report.priority}</span>
              {report.distanceMeters !== undefined ? (
                <span> — {report.distanceMeters}m away</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {reports.length === 0 && status === "ready" && !error ? (
        <p>No nearby issues found. Try a different location or wider radius.</p>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <nav>
          {pagination.page > 1 ? (
            <button
              onClick={() =>
                loadFeed({
                  longitude: query?.longitude,
                  latitude: query?.latitude,
                  page: pagination.page - 1,
                })
              }
              type="button"
            >
              Previous
            </button>
          ) : null}
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          {pagination.page < pagination.totalPages ? (
            <button
              onClick={() =>
                loadFeed({
                  longitude: query?.longitude,
                  latitude: query?.latitude,
                  page: pagination.page + 1,
                })
              }
              type="button"
            >
              Next
            </button>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}

export default CivicFeedPage;
