import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading1, Text } from "../components/ui/Typography.jsx";
import { Card } from "../components/ui/Card.jsx";
import { StatusBadge, CategoryBadge } from "../components/ui/StatusBadge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { getMyReports } from "../services/reportApi.js";

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyReports() {
      try {
        const data = await getMyReports();
        setReports(data.reports || []);
      } catch (err) {
        console.error("Failed to load my reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMyReports();
  }, []);

  return (
    <AppLayout>
      <div className="py-8 space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Heading1>My Civic Submissions</Heading1>
            <Text className="mt-1 text-gray-600">Track and manage issues you have reported.</Text>
          </div>
          <Link to="/reports/new">
            <Button variant="clay" size="md">
              + Report New Issue
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 font-mono">Loading your submitted reports...</div>
        ) : reports.length === 0 ? (
          <Card variant="neumorphic" className="p-12 text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-800">You haven't reported any issues yet</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">Help improve your neighborhood by snapping a photo of potholes or streetlight failures.</p>
            <Link to="/reports/new" className="inline-block pt-2">
              <Button variant="primary" size="md">Report Your First Issue</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Link key={report._id} to={`/reports/${report._id}`}>
                <Card variant="neumorphic" hoverable className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={report.category} />
                      <StatusBadge status={report.status} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{report.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{report.location?.displayAddress || "Pune"}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-400 flex-shrink-0">
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    <span className="text-blue-600 font-semibold">View Details →</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
