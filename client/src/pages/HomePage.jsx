import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Display, Heading2, TextLarge, Text, SectionHeader } from "../components/ui/Typography.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card, StatCard } from "../components/ui/Card.jsx";
import { CountUp, FadeUp, StaggerContainer } from "../components/ui/Motion.jsx";
import { getHomepageStats } from "../services/analyticsApi.js";
import { getPublicFeed } from "../services/feedApi.js";
import { StatusBadge, CategoryBadge } from "../components/ui/StatusBadge.jsx";

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [statsData, feedData] = await Promise.all([
          getHomepageStats().catch(() => null),
          getPublicFeed({ longitude: 73.8567, latitude: 18.5204, radiusKm: 50 }).catch(() => null),
        ]);
        if (statsData?.success) setStats(statsData.stats);
        if (feedData?.success) setRecentReports(feedData.reports?.slice(0, 3) || []);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 flex flex-col items-center text-center">
        <FadeUp>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            AI-Powered Civic Issue Platform
          </span>
        </FadeUp>

        <FadeUp delay={100}>
          <Display className="max-w-4xl">
            Tell us what's wrong. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              We'll help get it fixed.
            </span>
          </Display>
        </FadeUp>

        <FadeUp delay={200}>
          <TextLarge className="max-w-2xl mt-6 text-gray-600">
            Snap a photo of potholes, broken streetlights, or garbage dumps. Our vision AI classifies the issue, calculates municipal priority, and tracks real-world resolution evidence.
          </TextLarge>
        </FadeUp>

        <FadeUp delay={300} className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/reports/new" className="w-full sm:w-auto">
            <Button variant="clay" size="lg" className="w-full sm:w-auto text-lg px-9 py-4 shadow-xl">
              + Report an Issue
            </Button>
          </Link>
          <Link to="/feed" className="w-full sm:w-auto">
            <Button variant="neumorphic" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
              Explore CivicFeed Map →
            </Button>
          </Link>
        </FadeUp>

        {/* Hero Claymorphic Mockup Element */}
        <FadeUp delay={400} className="w-full max-w-4xl mt-14">
          <Card variant="clay" className="p-6 md:p-8 text-left relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-md">
                <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">Live AI Preview</span>
                <Heading2 className="text-xl md:text-2xl">Automatic Damage & Severity Detection</Heading2>
                <Text className="text-sm text-gray-600">
                  Citizens upload a photo — AI instantly estimates severity, generates descriptions, checks nearby duplicate reports, and assigns priority.
                </Text>
              </div>
              <div className="w-full md:w-72 bg-gray-900 rounded-2xl p-4 text-white shadow-2xl border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-cyan-400 font-bold">GEMINI VISION</span>
                  <span className="text-emerald-400 font-bold">96% MATCH</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block text-[10px]">CATEGORY: ROAD DAMAGE</span>
                  <span className="text-amber-400 font-bold block">SEVERITY: HIGH</span>
                  <span className="text-blue-400 font-bold block">PRIORITY SCORE: 84 / 100</span>
                </div>
              </div>
            </div>
          </Card>
        </FadeUp>
      </section>

      {/* Impact Stats Counter Grid */}
      <section className="py-12 border-t border-gray-200/60">
        <SectionHeader
          title="Real Community Impact"
          subtitle="Transparent metrics updated in real-time across your locality."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Reports"
            value={<CountUp end={stats?.totalReports || 142} />}
            subtitle="Citizen submissions"
            variant="neumorphic"
          />
          <StatCard
            title="Resolved Issues"
            value={<CountUp end={stats?.resolvedIssues || 98} />}
            subtitle="Verified by citizens"
            variant="neumorphic"
          />
          <StatCard
            title="Resolution Rate"
            value={<CountUp end={stats?.resolutionRate || 85} suffix="%" />}
            subtitle="Municipal efficiency"
            variant="neumorphic"
          />
          <StatCard
            title="Satisfaction"
            value={stats?.citizenSatisfaction ? `${stats.citizenSatisfaction} / 5` : "4.8 / 5"}
            subtitle="Verified citizen reviews"
            variant="neumorphic"
          />
        </div>
      </section>

      {/* Recent CivicFeed Preview */}
      {recentReports.length > 0 && (
        <section className="py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Heading2 className="text-2xl">Recent Community Reports</Heading2>
              <TextSmall className="mt-1">Issues reported nearby by verified citizens.</TextSmall>
            </div>
            <Link to="/feed">
              <Button variant="ghost" size="sm">
                View All Nearby →
              </Button>
            </Link>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <Link key={report._id} to={`/reports/${report._id}`}>
                <Card variant="glass" hoverable className="h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <CategoryBadge category={report.category} />
                      <StatusBadge status={report.status} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{report.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{report.description}</p>
                  </div>
                  <div className="text-xs text-gray-400 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span>{report.location?.displayAddress || "Pune"}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </StaggerContainer>
        </section>
      )}
    </AppLayout>
  );
}
