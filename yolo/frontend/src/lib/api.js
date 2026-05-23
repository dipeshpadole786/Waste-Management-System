// Backend command requirement: `uvicorn app.main:app --reload` (defaults to port 8000)
const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || "http://127.0.0.1:8000";
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || "";

async function readJsonOrText(resp) {
  const contentType = resp.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) return await resp.json();
  } catch {
    // fall through
  }
  try {
    const text = await resp.text();
    return { error: text };
  } catch {
    return { error: "Unknown response" };
  }
}

export function apiUrl(path) {
  if (!path) return API_BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function health() {
  const resp = await fetch(apiUrl("/api/health"), {
    headers: ADMIN_API_KEY ? { "X-Admin-Key": ADMIN_API_KEY } : {},
  });
  return resp.json();
}

export async function detectImage(file) {
  const form = new FormData();
  form.append("image", file);
  let resp;
  try {
    resp = await fetch(apiUrl("/api/detect"), {
      method: "POST",
      body: form,
      headers: ADMIN_API_KEY ? { "X-Admin-Key": ADMIN_API_KEY } : {},
    });
  } catch (e) {
    throw new Error(`Failed to reach backend (${API_BASE_URL}). Check server is running and CORS is allowed.`);
  }
  const data = await readJsonOrText(resp);
  if (!resp.ok) {
    const msg = data?.hint ? `${data?.error || "Detection failed"}\n${data.hint}` : (data?.error || "Detection failed");
    throw new Error(msg);
  }
  return data;
}

export async function getHistory(limit = 20) {
  const resp = await fetch(apiUrl(`/api/history?limit=${encodeURIComponent(limit)}`), {
    headers: ADMIN_API_KEY ? { "X-Admin-Key": ADMIN_API_KEY } : {},
  });
  const data = await readJsonOrText(resp);
  if (!resp.ok) throw new Error(data?.error || "Failed to load history");
  return data;
}
