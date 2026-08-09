import { apiRequest } from "./apiClient.js";

export async function getCivicFeed(params = {}) {
  const query = new URLSearchParams();
  if (params.longitude !== undefined) query.set("longitude", params.longitude);
  if (params.latitude !== undefined) query.set("latitude", params.latitude);
  if (params.radiusKm) query.set("radiusKm", params.radiusKm);
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const qs = query.toString();
  return apiRequest(`/feed${qs ? `?${qs}` : ""}`);
}

export async function getPublicFeed(params = {}) {
  const query = new URLSearchParams();
  if (params.longitude !== undefined) query.set("longitude", params.longitude);
  if (params.latitude !== undefined) query.set("latitude", params.latitude);
  if (params.radiusKm) query.set("radiusKm", params.radiusKm);
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const qs = query.toString();
  return apiRequest(`/feed/public${qs ? `?${qs}` : ""}`);
}
