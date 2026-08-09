import { apiRequest } from "./apiClient.js";

export function registerUser(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginUser(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function logoutUser() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return apiRequest("/users/me");
}

export function updateCurrentUser(payload) {
  return apiRequest("/users/me", {
    method: "PATCH",
    body: payload,
  });
}
