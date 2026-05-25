import axios from "axios";

const WASTEBOT_BASE_URL =
  import.meta.env.VITE_WASTEBOT_API_BASE_URL || "http://127.0.0.1:8001";

const wastebot = axios.create({
  baseURL: WASTEBOT_BASE_URL,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
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
        "WasteBot backend is unreachable (or blocked by CORS). Make sure it is running on port 8001 and CORS allows your frontend origin.",
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

class WasteBotAPI {
  async checkHealth() {
    try {
      const res = await wastebot.get("/wastebot/health");
      return { success: true, data: res.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: toError(error) };
    }
  }

  async chat({ question }) {
    try {
      const res = await wastebot.post("/wastebot/chat", { question });
      return { success: true, data: res.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: toError(error) };
    }
  }
}

export { WASTEBOT_BASE_URL };
export default new WasteBotAPI();
