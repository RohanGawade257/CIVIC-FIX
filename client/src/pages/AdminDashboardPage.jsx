import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { REPORT_CATEGORY_OPTIONS } from "../features/reports/reportCategories.js";

import {
  assignDepartmentAdmin,
  listReportsAdmin,
  resolveReportAdmin,
  updateStatusAdmin,
  verifyReportAdmin,
} from "../services/adminApi.js";

const ADMIN_STATUS_OPTIONS = [
  ["", "All Statuses"],
  ["SUBMITTED", "Submitted"],
  ["AI_ANALYZED", "AI Analyzed"],
  ["VERIFICATION_PENDING", "Verification Pending"],
  ["VERIFIED", "Verified"],
  ["ASSIGNED", "Assigned"],
  ["IN_PROGRESS", "In Progress"],
  ["RESOLVED", "Resolved"],
  ["CITIZEN_CONFIRMATION", "Citizen Confirmation"],
  ["CLOSED", "Closed"],
  ["REJECTED", "Rejected"],
];

function AdminDashboardPage() {
  const { status: authStatus, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", category: "", status: "" });
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listReportsAdmin(filters);
      setReports(res.reports || []);
      setPagination(res.pagination || { page: 1, totalPages: 1 });
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      return undefined;
    }

    const timer = setTimeout(() => {
      fetchReports();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchReports, user]);

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

  if (user.role !== "ADMIN") {
    return (
      <main>
        <h1>Access Denied</h1>
        <p>Administrator privileges are required to view this dashboard.</p>
      </main>
    );
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function handleVerify(reportId) {
    setActionError("");
    setActionSuccess("");
    try {
      await verifyReportAdmin(reportId);
      setActionSuccess(`Report ${reportId} verified.`);
      fetchReports();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleAssign(reportId) {
    const dept = window.prompt("Enter department name for assignment:");
    if (!dept) return;
    setActionError("");
    setActionSuccess("");
    try {
      await assignDepartmentAdmin(reportId, dept);
      setActionSuccess(`Report assigned to ${dept}.`);
      fetchReports();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleStatusChange(reportId, newStatus) {
    setActionError("");
    setActionSuccess("");
    try {
      await updateStatusAdmin(reportId, newStatus);
      setActionSuccess(`Report status updated to ${newStatus}.`);
      fetchReports();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleResolve(reportId) {
    const notes = window.prompt("Enter resolution details/notes:");
    if (notes === null) return;
    setActionError("");
    setActionSuccess("");
    try {
      await resolveReportAdmin(reportId, notes, null);
      setActionSuccess(`Report marked resolved.`);
      fetchReports();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <section>
        <h2>Search & Filter Reports</h2>
        <p>
          <label htmlFor="admin-search">Search</label>
          <input
            id="admin-search"
            name="search"
            onChange={handleFilterChange}
            placeholder="Search by title, description, address..."
            type="text"
            value={filters.search}
          />
        </p>
        <p>
          <label htmlFor="admin-category">Category</label>
          <select id="admin-category" name="category" onChange={handleFilterChange} value={filters.category}>
            <option value="">All Categories</option>
            {REPORT_CATEGORY_OPTIONS.map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </p>
        <p>
          <label htmlFor="admin-status">Status</label>
          <select id="admin-status" name="status" onChange={handleFilterChange} value={filters.status}>
            {ADMIN_STATUS_OPTIONS.map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </p>
      </section>

      {error ? <p role="alert">{error}</p> : null}
      {actionError ? <p role="alert">{actionError}</p> : null}
      {actionSuccess ? <p>{actionSuccess}</p> : null}
      {loading ? <p>Loading reports...</p> : null}

      <section>
        <h2>Reports Queue ({pagination.total || reports.length})</h2>
        {reports.length === 0 ? (
          <p>No reports found matching criteria.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.title}</td>
                  <td>{report.category}</td>
                  <td>{report.priority ?? 0}</td>
                  <td>{report.status}</td>
                  <td>{report.assignedDepartment || "Unassigned"}</td>
                  <td>
                    <button onClick={() => handleVerify(report.id)} type="button">
                      Verify
                    </button>
                    <button onClick={() => handleAssign(report.id)} type="button">
                      Assign
                    </button>
                    <button onClick={() => handleStatusChange(report.id, "IN_PROGRESS")} type="button">
                      In Progress
                    </button>
                    <button onClick={() => handleResolve(report.id)} type="button">
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default AdminDashboardPage;
