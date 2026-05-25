import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

const toError = (error) => {
  const isTimeout = error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "");
  const isNetwork =
    error?.code === "ERR_NETWORK" ||
    (!error?.response && !!error?.request) ||
    /network error/i.test(error?.message || "");

  const status = error?.response?.status ?? null;
  const backendDetail = error?.response?.data?.detail ?? error?.response?.data?.error ?? null;

  if (isTimeout) return { kind: "timeout", message: "Request timed out. Please try again.", status };
  if (isNetwork)
    return {
      kind: "network",
      message:
        "Waste Classifier backend is unreachable (or blocked by CORS). Make sure it is running and CORS allows your frontend origin.",
      status,
    };
  if (backendDetail)
    return {
      kind: "backend",
      message: typeof backendDetail === "string" ? backendDetail : "Backend error.",
      status,
    };

  return { kind: "unknown", message: error?.message || "Something went wrong.", status };
};

const resolveFileUrl = (maybePath) => {
  if (!maybePath) return null;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;

  // If baseURL is ".../api", static files are mounted at "/files/...".
  const base = API_BASE_URL.replace(/\/api\/?$/i, "/");
  return new URL(maybePath.replace(/^\//, ""), base).toString();
};

class WasteClassifierAPI {
  get baseUrl() {
    return API_BASE_URL;
  }

  resolveFileUrl(path) {
    return resolveFileUrl(path);
  }

  async checkHealth() {
    try {
      const res = await api.get("/health");
      return { success: true, data: res.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: toError(error) };
    }
  }

  async detectImage(imageFile) {
    try {
      const form = new FormData();
      form.append("image", imageFile);

      const res = await api.post("/detect", form, {
        // Let the browser set the correct multipart boundary.
        timeout: 120000,
      });
      return { success: true, data: res.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: toError(error) };
    }
  }

  async getHistory(limit = 10) {
    try {
      const res = await api.get("/history", { params: { limit } });
      return { success: true, data: res.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: toError(error) };
    }
  }
}

export default new WasteClassifierAPI();
