import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { getReport } from "../services/reportApi.js";

function ReportDetailPage() {
  const { reportId } = useParams();
  const { status: authStatus, user } = useAuth();
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("idle");

  const loadReport = useCallback(async () => {
    setStatus("loading");

    try {
      const response = await getReport(reportId);
      setReport(response.report);
      setStatus("ready");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }, [reportId]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      loadReport();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadReport, user]);

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
      <p>
        <Link to="/reports/my">Back to my reports</Link>
      </p>
      {status === "loading" ? <p>Loading report...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {report ? (
        <article>
          <h1>{report.title}</h1>
          <p>{report.category}</p>
          <p>{report.status}</p>
          <p>{report.description}</p>
          <p>{report.location?.displayAddress}</p>
          <p>
            {report.location?.point?.coordinates?.[1]}, {report.location?.point?.coordinates?.[0]}
          </p>
          <h2>Timeline</h2>
          <ol>
            {report.timeline.map((entry) => (
              <li key={`${entry.status}-${entry.createdAt}`}>
                <p>{entry.status}</p>
                <p>{entry.message}</p>
              </li>
            ))}
          </ol>
        </article>
      ) : null}
    </main>
  );
}

export default ReportDetailPage;
