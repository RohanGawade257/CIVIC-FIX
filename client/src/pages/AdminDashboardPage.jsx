import React, { useEffect, useState } from "react";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading1, Text } from "../components/ui/Typography.jsx";
import { Card, StatCard } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { Input, Select, Textarea } from "../components/ui/Input.jsx";
import { AdminReportTable } from "../components/AdminReportTable.jsx";
import { listReportsAdmin, updateStatusAdmin, assignDepartmentAdmin, resolveReportAdmin, verifyReportAdmin } from "../services/adminApi.js";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (!user || user.role !== "ADMIN") {
    return (
      <AppLayout>
        <div className="py-20 text-center text-red-600 font-bold text-xl">
          Access Denied: You do not have administrator permissions.
        </div>
      </AppLayout>
    );
  }

  // Management Form State
  const [assignedDepartment, setAssignedDepartment] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadReports();
  }, [statusFilter, categoryFilter]);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await listReportsAdmin({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
      });
      setReports(data.reports || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setAssignedDepartment(report.assignedDepartment || "");
    setNewStatus(report.status || "");
    setResolutionNotes("");
  };

  const handleAssignDepartment = async (e) => {
    e.preventDefault();
    if (!selectedReport || !assignedDepartment) return;
    setIsUpdating(true);
    try {
      const updated = await assignDepartmentAdmin(selectedReport._id, assignedDepartment);
      setSelectedReport(updated.report || updated);
      loadReports();
    } catch (err) {
      alert(err.message || "Failed to assign department.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedReport || !newStatus) return;
    setIsUpdating(true);
    try {
      const updated = await updateStatusAdmin(selectedReport._id, newStatus);
      setSelectedReport(updated.report || updated);
      loadReports();
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolveReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      const updated = await resolveReportAdmin(selectedReport._id, resolutionNotes);
      setSelectedReport(updated.report || updated);
      loadReports();
    } catch (err) {
      alert(err.message || "Failed to resolve report.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AppLayout>
      <div className="py-8 space-y-6">
        {/* Restrained Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">MUNICIPAL CONTROL CENTER</span>
            <Heading1 className="text-2xl md:text-3xl">Admin Command Portal</Heading1>
          </div>
          <div className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            SYSTEM ROLE: ADMINISTRATOR
          </div>
        </div>

        {/* Search & Filter Controls */}
        <Card variant="flat" className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <Input
            placeholder="Search by title, description, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            containerClassName="w-full md:w-1/3"
          />
          <Select
            options={[
              { value: "", label: "All Statuses" },
              { value: "SUBMITTED", label: "Submitted" },
              { value: "AI_ANALYZED", label: "AI Analyzed" },
              { value: "VERIFIED", label: "Verified" },
              { value: "ASSIGNED", label: "Assigned" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "RESOLVED", label: "Resolved" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            containerClassName="w-full md:w-1/4"
          />
          <Button variant="primary" size="md" onClick={loadReports} className="w-full md:w-auto">
            Apply Filters
          </Button>
        </Card>

        {/* Master / Detail Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-gray-500 font-mono">Fetching admin records...</div>
            ) : (
              <AdminReportTable
                reports={reports}
                onSelectReport={handleSelectReport}
                selectedReportId={selectedReport?._id}
              />
            )}
          </div>

          {/* Report Management Action Panel */}
          <div>
            {selectedReport ? (
              <Card variant="flat" className="p-6 space-y-6 sticky top-24 border-blue-200">
                <div className="border-b border-gray-200 pb-3">
                  <span className="text-xs font-mono text-blue-600 font-bold">SELECTED RECORD</span>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{selectedReport.title}</h3>
                  <p className="text-xs text-gray-500 font-mono">{selectedReport._id}</p>
                </div>

                {/* Assign Department */}
                <form onSubmit={handleAssignDepartment} className="space-y-3">
                  <Input
                    label="Assign Department"
                    placeholder="e.g. Public Works Department"
                    value={assignedDepartment}
                    onChange={(e) => setAssignedDepartment(e.target.value)}
                  />
                  <Button type="submit" variant="secondary" size="sm" isLoading={isUpdating} className="w-full">
                    Assign Department
                  </Button>
                </form>

                {/* Update Status */}
                <form onSubmit={handleStatusUpdate} className="space-y-3 pt-3 border-t border-gray-100">
                  <Select
                    label="Update Status"
                    options={[
                      { value: "VERIFIED", label: "Verified" },
                      { value: "ASSIGNED", label: "Assigned" },
                      { value: "IN_PROGRESS", label: "In Progress" },
                      { value: "RESOLVED", label: "Resolved" },
                    ]}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  />
                  <Button type="submit" variant="primary" size="sm" isLoading={isUpdating} className="w-full">
                    Update Report Status
                  </Button>
                </form>

                {/* Mark Resolved */}
                <form onSubmit={handleResolveReport} className="space-y-3 pt-3 border-t border-gray-100">
                  <Textarea
                    label="Resolution Notes"
                    placeholder="Describe repair actions taken..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                  />
                  <Button type="submit" variant="clay" size="sm" isLoading={isUpdating} className="w-full">
                    Mark Issue Resolved & Notify Citizen
                  </Button>
                </form>
              </Card>
            ) : (
              <Card variant="flat" className="p-8 text-center text-gray-500 text-sm">
                Select a report from the table to manage department assignments and status progression.
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
