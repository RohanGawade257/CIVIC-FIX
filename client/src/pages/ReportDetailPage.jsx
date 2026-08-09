import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading1, Text, TextSmall } from "../components/ui/Typography.jsx";
import { Card } from "../components/ui/Card.jsx";
import { StatusBadge, CategoryBadge, PriorityBadge } from "../components/ui/StatusBadge.jsx";
import { CivicMap } from "../components/CivicMap.jsx";
import { Timeline } from "../components/Timeline.jsx";
import { BeforeAfterViewer } from "../components/BeforeAfterViewer.jsx";
import { CitizenConfirmationForm } from "../components/CitizenConfirmationForm.jsx";
import { getReport } from "../services/reportApi.js";
import { confirmReportResolution } from "../services/trackingApi.js";

export default function ReportDetailPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await getReport(reportId);
        setReport(data.report || data);
      } catch (err) {
        console.error("Failed to load report detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [reportId]);

  const handleCitizenConfirmation = async ({ confirmed, rating, feedback }) => {
    setIsSubmittingConfirm(true);
    try {
      const updated = await confirmReportResolution(reportId, { confirmed, rating, feedback });
      setReport(updated.report || updated);
    } catch (err) {
      alert(err.message || "Failed to submit confirmation.");
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-gray-500 font-mono">Loading report details...</div>
      </AppLayout>
    );
  }

  if (!report) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-gray-600">
          <h2 className="text-2xl font-bold">Report Not Found</h2>
          <p className="mt-2 text-sm">The requested report ID does not exist or has been removed.</p>
        </div>
      </AppLayout>
    );
  }

  const primaryImage = report.images?.[0];
  const resolutionImage = report.resolutionEvidence?.image;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        {/* Header Metadata */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CategoryBadge category={report.category} />
              <StatusBadge status={report.status} />
              <PriorityBadge priority={report.priority || 0} />
            </div>
            <Heading1>{report.title}</Heading1>
            <TextSmall className="mt-2">
              Report ID: <span className="font-mono text-gray-800 font-semibold">{report._id}</span> • Reported on {new Date(report.createdAt).toLocaleDateString()}
            </TextSmall>
          </div>
        </div>

        {/* Resolution Evidence Before/After Signature Moment #4 */}
        {primaryImage && resolutionImage ? (
          <Card variant="clay" className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Resolution Comparison (Signature Moment)</h3>
            <BeforeAfterViewer
              beforeUrl={primaryImage.standardUrl || primaryImage.originalUrl}
              afterUrl={resolutionImage.standardUrl || resolutionImage.thumbnailUrl}
            />
          </Card>
        ) : primaryImage ? (
          <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-200">
            <img
              src={primaryImage.standardUrl || primaryImage.originalUrl}
              alt={report.title}
              className="w-full h-80 object-cover"
            />
          </div>
        ) : null}

        {/* Description & Details */}
        <Card variant="neumorphic" className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Description</h3>
          <Text className="text-gray-700 whitespace-pre-line">{report.description}</Text>
        </Card>

        {/* Citizen Confirmation Interaction Signature Moment #5 - Was this issue resolved? */}
        {report.status === "CITIZEN_CONFIRMATION" && (
          <CitizenConfirmationForm
            onSubmit={handleCitizenConfirmation}
            isLoading={isSubmittingConfirm}
          />
        )}

        {/* Incident Location Map */}
        <Card variant="glass" className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Incident Location</h3>
          <CivicMap
            coordinates={report.location?.point?.coordinates}
            address={report.location?.displayAddress}
          />
        </Card>

        {/* Timeline Progress */}
        <Card variant="neumorphic" className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Lifecycle Timeline</h3>
          <Timeline entries={report.timeline} />
        </Card>
      </div>
    </AppLayout>
  );
}
