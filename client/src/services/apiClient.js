export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

function buildRequestBody(body) {
  return body === undefined ? undefined : JSON.stringify(body);
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: buildRequestBody(options.body),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || "Request failed.");
    error.statusCode = response.status;
    error.code = payload?.code || "REQUEST_FAILED";
    throw error;
  }

  return payload;
}
