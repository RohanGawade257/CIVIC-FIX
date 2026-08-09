import { API_BASE_URL } from "./apiClient.js";

export async function preCheckImageAi(imageFile, category = "OTHER") {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("category", category);

  const response = await fetch(`${API_BASE_URL}/ai/pre-check`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to analyze image with AI.");
  }

  return data;
}
