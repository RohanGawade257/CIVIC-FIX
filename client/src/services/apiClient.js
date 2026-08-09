let _baseUrl = import.meta.env?.VITE_API_BASE_URL || "http://localhost:4000/api/v1";
if (_baseUrl && !_baseUrl.endsWith("/api/v1")) {
  _baseUrl = `${_baseUrl.replace(/\/$/, "")}/api/v1`;
}
export const API_BASE_URL = _baseUrl;

function buildRequestBody(body) {
  return body === undefined ? undefined : JSON.stringify(body);
}

export async function apiRequest(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("civicfix_token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    headers,
    body: buildRequestBody(options.body),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // Log full server error for debugging
    console.error(`❌ API ${options.method || "GET"} ${path} failed [${response.status}]:`, payload);
    const error = new Error(payload?.message || "Request failed.");
    error.statusCode = response.status;
    error.code = payload?.code || "REQUEST_FAILED";
    error.details = payload?.details;
    throw error;
  }

  return payload;
}
