import { apiRequest } from "./apiClient.js";

export async function getHomepageStats() {
  return apiRequest("/analytics/public");
}

export async function getAdminAnalytics() {
  return apiRequest("/analytics/admin");
}
