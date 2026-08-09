import { apiRequest } from "./apiClient.js";

export async function getNotifications() {
  return apiRequest("/notifications");
}

export async function confirmReportResolution(reportId, { confirmed, rating, reviewText }) {
  return apiRequest(`/reports/${reportId}/confirm`, {
    method: "POST",
    body: { confirmed, rating, reviewText },
  });
}
