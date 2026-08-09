import { apiRequest } from "./apiClient.js";

export function createReport(payload) {
  return apiRequest("/reports", {
    method: "POST",
    body: payload,
  });
}

export function getMyReports() {
  return apiRequest("/reports/my");
}

export function getReport(reportId) {
  return apiRequest(`/reports/${reportId}`);
}

export async function uploadReportImage(reportId, imageFile) {
  const formData = new FormData();

  formData.append("image", imageFile);

  const response = await fetch(`http://localhost:4000/api/v1/reports/${reportId}/images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || "Image upload failed.");
    error.statusCode = response.status;
    error.code = payload?.code || "IMAGE_UPLOAD_FAILED";
    throw error;
  }

  return payload;
}
