import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading1, Text } from "../components/ui/Typography.jsx";
import { Card } from "../components/ui/Card.jsx";
import { StatusBadge, CategoryBadge, PriorityBadge } from "../components/ui/StatusBadge.jsx";
import { CivicMap } from "../components/CivicMap.jsx";
import { StaggerContainer } from "../components/ui/Motion.jsx";
import { getPublicFeed, getCivicFeed } from "../services/feedApi.js";
import { useAuth } from "../features/auth/AuthContext.jsx";

export default function CivicFeedPage() {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      // Uses navigator.geolocation and distanceMeters query parameters
      try {
        let res;
        if (isAuthenticated && navigator.geolocation) {
          res = await getCivicFeed({ distanceMeters: 50000 }).catch(() => null);
        }
        if (!res || !res.reports) {
          res = await getPublicFeed({ longitude: 73.8567, latitude: 18.5204, radiusKm: 50 });
        }
        setReports(res?.reports || []);
        setPagination(res?.pagination || null);
      } catch (err) {
        console.error("Feed error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [isAuthenticated]);

  return (
    <AppLayout>
      <div className="py-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <Heading1>CivicFeed Map & Community Feed</Heading1>
          <Text className="mt-2 text-gray-600">
            Real-time map and directory of civic issues reported in your municipality.
          </Text>
        </div>

        {/* Floating Map Container */}
        <CivicMap
          coordinates={[73.8567, 18.5204]}
          address="Showing nearby active civic issues in Pune Metropolitan Region"
          className="h-80 md:h-96 shadow-xl"
        />

        {/* Reports Feed Grid */}
        {loading ? (
          <div className="py-12 text-center text-gray-500 font-mono">Loading civic feed...</div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-200">
            No active civic reports found in this area.
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Link key={report._id} to={`/reports/${report._id}`}>
                <Card variant="neumorphic" hoverable className="h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <CategoryBadge category={report.category} />
                      <StatusBadge status={report.status} />
                    </div>
                    <PriorityBadge priority={report.priority || 0} className="mb-2" />
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{report.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{report.description}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-mono">
                    <span className="truncate max-w-[180px]">{report.location?.displayAddress || "Pune"}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </StaggerContainer>
        )}
      </div>
    </AppLayout>
  );
}
