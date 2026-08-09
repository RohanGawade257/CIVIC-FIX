import { apiRequest, API_BASE_URL } from "./apiClient.js";

export async function listReportsAdmin(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set("search", params.search);
  if (params.status) queryParams.set("status", params.status);
  if (params.category) queryParams.set("category", params.category);
  if (params.page) queryParams.set("page", params.page);
  if (params.limit) queryParams.set("limit", params.limit);

  const queryStr = queryParams.toString();
  return apiRequest(`/admin/reports${queryStr ? `?${queryStr}` : ""}`);
}

export async function getReportAdmin(reportId) {
  return apiRequest(`/admin/reports/${reportId}`);
}

export async function verifyReportAdmin(reportId) {
  return apiRequest(`/admin/reports/${reportId}/verify`, {
    method: "PATCH",
  });
}

export async function assignDepartmentAdmin(reportId, department) {
  return apiRequest(`/admin/reports/${reportId}/assign`, {
    method: "PATCH",
    body: { department },
  });
}

export async function updateStatusAdmin(reportId, status, message) {
  return apiRequest(`/admin/reports/${reportId}/status`, {
    method: "PATCH",
    body: { status, message },
  });
}

export async function resolveReportAdmin(reportId, resolutionNotes, resolutionImageFile) {
  if (!resolutionImageFile) {
    return apiRequest(`/admin/reports/${reportId}/resolve`, {
      method: "POST",
      body: { resolutionNotes },
    });
  }

  const formData = new FormData();
  if (resolutionNotes) {
    formData.append("resolutionNotes", resolutionNotes);
  }
  formData.append("resolutionImage", resolutionImageFile);

  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/resolve`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to resolve report.");
  }
  return payload;
}
