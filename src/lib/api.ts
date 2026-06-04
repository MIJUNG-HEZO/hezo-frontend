import ky from "ky";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export const api = {
  get: (url: string) =>
    ky.get(`${API_BASE_URL}/${url}`, { headers: getAuthHeaders(), timeout: 30000 }),

  post: (url: string, options?: { json?: unknown }) =>
    ky.post(`${API_BASE_URL}/${url}`, { json: options?.json, headers: getAuthHeaders(), timeout: 30000 }),

  patch: (url: string, options?: { json?: unknown }) =>
    ky.patch(`${API_BASE_URL}/${url}`, { json: options?.json, headers: getAuthHeaders(), timeout: 30000 }),

  put: (url: string, options?: { json?: unknown }) =>
    ky.put(`${API_BASE_URL}/${url}`, { json: options?.json, headers: getAuthHeaders(), timeout: 30000 }),

  delete: (url: string) =>
    ky.delete(`${API_BASE_URL}/${url}`, { headers: getAuthHeaders(), timeout: 30000 }),
};
