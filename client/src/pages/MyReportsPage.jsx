import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { getMyReports } from "../services/reportApi.js";

function MyReportsPage() {
  const { status: authStatus, user } = useAuth();
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("idle");

  const loadReports = useCallback(async () => {
    setStatus("loading");

    try {
      const response = await getMyReports();
      setReports(response.reports);
      setStatus("ready");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      loadReports();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadReports, user]);

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
      <h1>My reports</h1>
      <p>
        <Link to="/reports/new">Submit report</Link>
      </p>
      {status === "loading" ? <p>Loading reports...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {status === "ready" && reports.length === 0 ? <p>No reports submitted yet.</p> : null}
      <ul>
        {reports.map((report) => (
          <li key={report.id}>
            <Link to={`/reports/${report.id}`}>{report.title}</Link>
            <p>{report.status}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default MyReportsPage;
