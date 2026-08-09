import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHomepageStats } from "../services/analyticsApi.js";

function HomePage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let ignore = false;
    getHomepageStats()
      .then((res) => {
        if (!ignore) {
          setStats(res.stats);
        }
      })
      .catch((err) => {
        console.error("Failed to load impact stats", err);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main>
      <h1>CivicFix AI</h1>
      <p>Report civic issues and track accountable resolution.</p>

      {stats ? (
        <section aria-label="Impact Statistics">
          <h2>Our Impact</h2>
          <ul>
            <li>{stats.totalReports} Issues Reported</li>
            <li>{stats.resolvedIssues} Issues Resolved</li>
            <li>{stats.activeIssues} Active Issues</li>
            <li>{stats.resolutionRate}% Resolution Rate</li>
            <li>{stats.citizenSatisfaction}/5 Citizen Rating</li>
            <li>{stats.totalCitizens} Participating Citizens</li>
          </ul>
        </section>
      ) : null}

      <nav aria-label="Account">
        <Link to="/register">Create account</Link>
        <Link to="/login">Login</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/reports/new">Submit report</Link>
        <Link to="/reports/my">My reports</Link>
        <Link to="/feed">CivicFeed</Link>
      </nav>
    </main>
  );
}

export default HomePage;
