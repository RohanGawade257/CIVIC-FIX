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
