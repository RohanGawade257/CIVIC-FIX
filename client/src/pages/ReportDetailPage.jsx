import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { getReport } from "../services/reportApi.js";
import { confirmReportResolution } from "../services/trackingApi.js";

function CitizenConfirmationForm({ reportId, onDone }) {
  const [confirmed, setConfirmed] = useState(null);
  const [rating, setRating] = useState(3);
  const [reviewText, setReviewText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (confirmed === null) {
      setError("Please indicate whether the issue was resolved.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await confirmReportResolution(reportId, { confirmed, rating, reviewText });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Was this issue resolved?</h2>
      <form onSubmit={handleSubmit}>
        <p>
          <button onClick={() => setConfirmed(true)} type="button">
            Yes, it was fixed
          </button>
          <button onClick={() => setConfirmed(false)} type="button">
            No, still not resolved
          </button>
        </p>
        {confirmed === true ? (
          <>
            <p>Current answer: Yes — marking resolved</p>
            <p>
              <label htmlFor="satisfaction-rating">Satisfaction rating (1–5)</label>
              <input
                id="satisfaction-rating"
                max="5"
                min="1"
                name="rating"
                onChange={(e) => setRating(Number(e.target.value))}
                type="number"
                value={rating}
              />
            </p>
            <p>
              <label htmlFor="review-text">Optional feedback</label>
              <textarea
                id="review-text"
                name="reviewText"
                onChange={(e) => setReviewText(e.target.value)}
                value={reviewText}
              />
            </p>
          </>
        ) : null}
        {confirmed === false ? (
          <p>Current answer: No — report will be reopened for review.</p>
        ) : null}
        {error ? <p role="alert">{error}</p> : null}
        <button disabled={submitting || confirmed === null} type="submit">
          {submitting ? "Submitting..." : "Submit confirmation"}
        </button>
      </form>
    </section>
  );
}

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
          <p>Priority Score: {report.priority ?? 0}/100</p>

          {report.aiAnalysis ? (
            <section>
              <h2>AI Advisory Analysis</h2>
              <p>Severity: {report.aiAnalysis.severity}</p>
              <p>Confidence: {Math.round((report.aiAnalysis.confidence || 0) * 100)}%</p>
              <p>Civic Issue Validated: {report.aiAnalysis.isCivicIssue ? "Yes" : "No"}</p>
              <p>Category Relevance: {report.aiAnalysis.isRelevantToCategory ? "Matches" : "Mismatch"}</p>
              {report.aiAnalysis.isPotentialDuplicate ? (
                <p role="alert">Warning: Potential duplicate report detected nearby.</p>
              ) : null}
            </section>
          ) : null}

          {report.status === "CITIZEN_CONFIRMATION" ? (
            <CitizenConfirmationForm onDone={loadReport} reportId={report.id} />
          ) : null}

          {report.feedback ? (
            <section>
              <h2>Your Feedback</h2>
              <p>Rating: {report.feedback.rating}/5</p>
              {report.feedback.reviewText ? <p>Review: {report.feedback.reviewText}</p> : null}
            </section>
          ) : null}

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
