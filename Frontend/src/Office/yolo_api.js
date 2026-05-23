const API_BASE_URL = import.meta.env.VITE_YOLO_API_BASE_URL || "http://127.0.0.1:8000";
const ADMIN_API_KEY = import.meta.env.VITE_YOLO_ADMIN_API_KEY || "";

const headers = () => (ADMIN_API_KEY ? { "X-Admin-Key": ADMIN_API_KEY } : {});

async function readJsonOrText(resp) {
  const contentType = resp.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) return await resp.json();
  } catch {
    // ignore
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
  const resp = await fetch(apiUrl("/api/health"), { headers: headers() });
  return readJsonOrText(resp);
}

export async function detectImage(file) {
  const form = new FormData();
  form.append("image", file);
  let resp;
  try {
    resp = await fetch(apiUrl("/api/detect"), { method: "POST", body: form, headers: headers() });
  } catch {
    throw new Error(`Failed to reach YOLO backend (${API_BASE_URL}).`);
  }
  const data = await readJsonOrText(resp);
  if (!resp.ok) {
    const msg = data?.hint ? `${data?.error || "Detection failed"}\n${data.hint}` : (data?.error || "Detection failed");
    throw new Error(msg);
  }
  return data;
}

export async function getHistory(limit = 20) {
  const resp = await fetch(apiUrl(`/api/history?limit=${encodeURIComponent(limit)}`), { headers: headers() });
  const data = await readJsonOrText(resp);
  if (!resp.ok) throw new Error(data?.error || "Failed to load history");
  return data;
}

