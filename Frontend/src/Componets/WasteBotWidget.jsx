import { useEffect, useMemo, useRef, useState } from "react";
import API from "../API/api_req";
import "./WasteBotWidget.css";

const initialMessages = [
  {
    role: "bot",
    text:
      "Hi, I’m WasteBot.\nAsk me about segregation, recycling, composting, e‑waste disposal, or missed pickups.",
  },
];

export default function WasteBotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("unknown"); // unknown | online | offline
  const bodyRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages.length]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get("/wastebot/health");
        if (!cancelled) setStatus(res?.data?.status === "ok" ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const send = async () => {
    const question = input.trim();
    if (!question || busy) return;

    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: question }]);

    try {
      const res = await API.post("/wastebot/chat", { question });
      const answer = res?.data?.answer || "Sorry, I couldn’t generate an answer.";
      const sources = Array.isArray(res?.data?.sources) ? res.data.sources : [];
      setMessages((m) => [...m, { role: "bot", text: answer, sources }]);
    } catch (e) {
      const backendMsg = e?.response?.data?.error || e?.response?.data?.detail;
      const msg =
        backendMsg ||
        (e?.code === "ERR_NETWORK" ? "Backend is not reachable on port 3000." : e?.message) ||
        "WasteBot is not available. Start the WasteBot server and try again.";

      setStatus("offline");
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text:
            `Error: ${msg}\n\n` +
            "To fix:\n" +
            "1) Start Backend (port 3000)\n" +
            "2) Start WasteBot API: `cd WasteBot` then `python api_server.py --port 8001`\n" +
            "3) Ensure `GROQ_API_KEY` is set in `WasteBot/.env`",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div className="wb-fab">
        <button className="wb-fab-btn" onClick={() => setOpen(true)} type="button">
          <span className="wb-fab-badge" aria-hidden="true" />
          WasteBot
        </button>
      </div>
    );
  }

  return (
    <div className="wb-panel" role="dialog" aria-label="WasteBot">
      <div className="wb-panel-header">
        <div className="wb-title">
          <div>
            WasteBot
            <small>
              Waste help assistant {status === "online" ? "• Online" : status === "offline" ? "• Offline" : ""}
            </small>
          </div>
        </div>
        <button className="wb-close" onClick={() => setOpen(false)} type="button">
          ✕
        </button>
      </div>

      <div className="wb-body" ref={bodyRef}>
        {messages.map((m, idx) => (
          <div key={idx} className={`wb-msg ${m.role === "user" ? "wb-msg--user" : "wb-msg--bot"}`}>
            {m.text}
            {m.role === "bot" && Array.isArray(m.sources) && m.sources.length > 0 && (
              <div className="wb-sources">
                Sources:
                <ul>
                  {m.sources.slice(0, 3).map((s, i) => (
                    <li key={i}>
                      <strong>{s.source}</strong>: {s.snippet}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="wb-footer">
        <form
          className="wb-form"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            className="wb-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a waste-management question…"
            disabled={busy}
          />
          <button className="wb-send" type="submit" disabled={!canSend}>
            {busy ? "…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
