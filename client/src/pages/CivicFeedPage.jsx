import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading1, Text } from "../components/ui/Typography.jsx";
import { Card } from "../components/ui/Card.jsx";
import { StatusBadge, CategoryBadge, PriorityBadge } from "../components/ui/StatusBadge.jsx";
import { CivicMap } from "../components/CivicMap.jsx";
import { StaggerContainer } from "../components/ui/Motion.jsx";
import { Button } from "../components/ui/Button.jsx";
import { getPublicFeed, getCivicFeed } from "../services/feedApi.js";
import { useAuth } from "../features/auth/AuthContext.jsx";

export default function CivicFeedPage() {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("detecting"); // detecting | granted | denied

  // Step 1: Detect user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ longitude: pos.coords.longitude, latitude: pos.coords.latitude });
          setLocationStatus("granted");
        },
        () => {
          // Default to Pune if denied
          setUserCoords({ longitude: 73.8567, latitude: 18.5204 });
          setLocationStatus("denied");
        },
        { timeout: 5000 }
      );
    } else {
      setUserCoords({ longitude: 73.8567, latitude: 18.5204 });
      setLocationStatus("denied");
    }
  }, []);

  // Step 2: Load feed once we have coords
  useEffect(() => {
    if (locationStatus === "detecting") return;

    async function loadFeed() {
      // Uses navigator.geolocation and distanceMeters query parameters
      try {
        let res;
        if (isAuthenticated) {
          res = await getCivicFeed({
            longitude: userCoords?.longitude,
            latitude: userCoords?.latitude,
            radiusKm: 50,
            distanceMeters: 50000,
          }).catch(() => null);
        }
        if (!res || !res.reports) {
          res = await getPublicFeed({
            longitude: userCoords?.longitude ?? 73.8567,
            latitude: userCoords?.latitude ?? 18.5204,
            radiusKm: 50,
          });
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
  }, [isAuthenticated, locationStatus, userCoords]);

  const mapCoords = userCoords
    ? [userCoords.longitude, userCoords.latitude]
    : [73.8567, 18.5204];

  return (
    <AppLayout>
      <div className="py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 max-w-5xl mx-auto">
          <div>
            <Heading1>CivicFeed</Heading1>
            <Text className="mt-1 text-gray-600">
              Real-time community reports near you
              {locationStatus === "granted" && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  📍 Using your location
                </span>
              )}
              {locationStatus === "denied" && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  📌 Showing Pune, Maharashtra
                </span>
              )}
            </Text>
          </div>
          {isAuthenticated && (
            <Link to="/reports/new">
              <Button variant="primary" size="sm" className="rounded-full whitespace-nowrap">
                + Report an Issue
              </Button>
            </Link>
          )}
        </div>

        {/* Live Map */}
        <CivicMap
          coordinates={mapCoords}
          address={
            locationStatus === "granted"
              ? "Showing civic issues near your current location"
              : "Showing civic issues in Pune Metropolitan Region"
          }
          className="h-80 md:h-96 shadow-xl"
        />

        {/* Reports Feed Grid */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500 font-mono text-sm bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm">
              <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Loading civic feed...
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-3xl border border-gray-200 space-y-2">
            <div className="text-4xl mb-3">🏙</div>
            <p className="font-semibold text-gray-700">No active civic reports in this area yet.</p>
            {isAuthenticated ? (
              <Link to="/reports/new" className="inline-block mt-3">
                <Button variant="primary" size="sm">Be the first to report an issue</Button>
              </Link>
            ) : (
              <Link to="/register" className="text-sm text-blue-600 hover:underline font-semibold mt-2 inline-block">
                Sign up to report civic issues →
              </Link>
            )}
          </div>
        ) : (
          <>
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

            {pagination && pagination.totalPages > 1 && (
              <div className="text-center text-xs text-gray-400 font-mono pt-4">
                Showing {reports.length} of {pagination.total} reports
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
